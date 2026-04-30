import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Header,
  SpaceBetween,
  Input,
  Button,
  Box,
  Alert,
  Badge,
  Spinner,
  ExpandableSection,
  Textarea,
  Select,
  FormField,
} from '@cloudscape-design/components';
import { hasCredentials, getCredentials } from '../utils/sessionStorage';
import {
  mcpSendMessage,
  mcpSendApproval,
  parseAgentResponse,
  getCallerIdentity,
} from '../services/mcpService';

const APPROVAL_DECISIONS = [
  { label: 'Approve', value: 'approve' },
  { label: 'Reject', value: 'reject' },
  { label: 'Override', value: 'override' },
];

const MessageBubble = ({ msg }) => {
  const isUser = msg.role === 'user';
  const isSystem = msg.role === 'system';

  const bubbleStyle = {
    maxWidth: '80%',
    padding: '10px 14px',
    borderRadius: '12px',
    background: isUser ? '#0972d3' : isSystem ? '#f4f4f4' : '#ffffff',
    color: isUser ? '#fff' : '#000',
    border: isSystem ? '1px solid #e9ebed' : isUser ? 'none' : '1px solid #d1d5db',
    alignSelf: isUser ? 'flex-end' : 'flex-start',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontSize: '14px',
    lineHeight: '1.5',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
      <Box color="text-status-inactive" fontSize="body-s" margin={{ bottom: 'xxs' }}>
        {isUser ? 'You' : isSystem ? 'System' : 'Agent'}
      </Box>
      <div style={bubbleStyle}>{msg.text}</div>
    </div>
  );
};

const ApprovalCard = ({ request, onDecision }) => {
  const [decision, setDecision] = useState({ label: 'Approve', value: 'approve' });
  const [overrideMsg, setOverrideMsg] = useState('');
  const [rejectMsg, setRejectMsg] = useState('');

  const handleSubmit = () => {
    onDecision({
      decision: decision.value,
      message: decision.value === 'override' ? overrideMsg : decision.value === 'reject' ? rejectMsg : undefined,
    });
  };

  return (
    <Container
      header={
        <Header variant="h3" description="Review the proposed operation before approving">
          <Badge color="severity-medium">Approval Required</Badge> {request.toolName}
        </Header>
      }
    >
      <SpaceBetween size="m">
        {request.description && (
          <Box variant="p" color="text-body-secondary">
            <span style={{ whiteSpace: 'pre-wrap' }}>{request.description}</span>
          </Box>
        )}

        <ExpandableSection headerText="Proposed parameters" defaultExpanded>
          <Box variant="code">
            <pre style={{ margin: 0, fontSize: '12px', overflowX: 'auto' }}>
              {JSON.stringify(request.parameters, null, 2)}
            </pre>
          </Box>
        </ExpandableSection>

        <FormField label="Decision">
          <Select
            selectedOption={decision}
            onChange={({ detail }) => setDecision(detail.selectedOption)}
            options={APPROVAL_DECISIONS}
          />
        </FormField>

        {decision.value === 'override' && (
          <FormField label="Override instructions">
            <Textarea
              value={overrideMsg}
              onChange={({ detail }) => setOverrideMsg(detail.value)}
              placeholder="Describe the modified parameters or instructions..."
              rows={3}
            />
          </FormField>
        )}

        {decision.value === 'reject' && (
          <FormField label="Rejection reason (optional)">
            <Input
              value={rejectMsg}
              onChange={({ detail }) => setRejectMsg(detail.value)}
              placeholder="Reason for rejection..."
            />
          </FormField>
        )}

        <Button
          variant={decision.value === 'approve' ? 'primary' : decision.value === 'reject' ? 'normal' : 'normal'}
          onClick={handleSubmit}
        >
          {decision.value === 'approve' ? 'Approve' : decision.value === 'reject' ? 'Reject' : 'Send Override'}
        </Button>
      </SpaceBetween>
    </Container>
  );
};

const AgentChat = ({ initialOpportunityId = null, compact = false } = {}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [pendingApproval, setPendingApproval] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [lastOpportunityId, setLastOpportunityId] = useState(initialOpportunityId);
  // Mirror of lastOpportunityId for synchronous reads inside the same handler.
  // React state updates don't flush mid-handler, so the retry branches below
  // would otherwise see a stale null even after we just called setLastOpportunityId.
  const lastOppIdRef = useRef(initialOpportunityId);
  const bottomRef = useRef(null);

  const catalog = getCredentials().catalog || 'Sandbox';

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    if (hasCredentials()) {
      getCallerIdentity()
        .then(id => setIdentity(id))
        .catch(() => setIdentity({ error: 'Could not resolve identity' }));
    }
  }, []);

  // Keep the opportunity-id ref/state in sync if the embedding component
  // changes its initialOpportunityId (e.g., user loads a different opp on
  // the same screen). This is idempotent — if it's already set, no harm.
  useEffect(() => {
    if (initialOpportunityId) {
      lastOppIdRef.current = initialOpportunityId;
      setLastOpportunityId(initialOpportunityId);
    }
  }, [initialOpportunityId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, pendingApproval]);

  const addMessage = (role, text) => {
    setMessages(prev => [...prev, { role, text, id: Date.now() + Math.random() }]);
  };

  // The server-side intent classifier rejects short bare messages ("yes", "go ahead")
  // as off-topic chit-chat. If the user sends a short affirmative and we know the
  // opportunity they are working on, add a minimal anchor phrase so the classifier
  // keeps routing to the Partner Central agent.
  const AFFIRMATIVE_RE = /^(yes|y|yeah|yep|sure|ok|okay|confirm|confirmed|go ahead|do it|please do|proceed|both|yes both|yes to both|affirm|affirmative|correct)\.?$/i;
  const anchorIfShort = (text) => {
    const trimmed = text.trim();
    if (!AFFIRMATIVE_RE.test(trimmed)) return text;
    const oppId = lastOppIdRef.current || lastOpportunityId;
    if (!oppId) return text;
    return `${trimmed} (regarding Partner Central opportunity ${oppId})`;
  };

  // Extract the first opportunity-looking ID from a string and remember it.
  // We update both the React state (for display/persistence) and the ref (for
  // synchronous reads inside the current handler). Scans can come from user
  // input, approval parameter JSON, or agent response text.
  //
  // The regex uses the `g` flag and we keep the LAST match from each scan —
  // when the agent lists multiple opportunities (e.g., a 4-row table), the
  // most recently mentioned ID is the one the user is most likely talking
  // about on their next turn. Taking match()[0] (the first ID) would anchor
  // follow-ups to the wrong opportunity.
  const OPP_ID_RE = /\bO\d{6,}\b/g;
  const rememberOpportunityId = (text) => {
    if (!text) return;
    const matches = text.match(OPP_ID_RE);
    if (matches && matches.length) {
      const latest = matches[matches.length - 1];
      lastOppIdRef.current = latest;
      setLastOpportunityId(latest);
    }
  };

  // The server's off-topic canned reply after a classifier miss. We detect it so
  // we can silently re-anchor the conversation instead of surfacing it to the user.
  const OFF_TOPIC_RE = /only help with AWS Partner Central|opportunities,?\s+funding,?\s+partner account/i;
  const isOffTopicReply = (text) => typeof text === 'string' && OFF_TOPIC_RE.test(text);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    if (!hasCredentials()) {
      setError('No AWS credentials found. Please log in first.');
      return;
    }

    const userText = input.trim();
    rememberOpportunityId(userText);

    // Embedded chat (compact mode with a scoped opportunity): on the very first
    // turn — before we have a sessionId — if the user's message doesn't already
    // reference the scoped opportunity, prepend a concise anchor so the agent
    // knows which opportunity to reason about. After turn 1, the server-side
    // session remembers context, and anchorIfShort continues handling bare
    // "yes" / "proceed" follow-ups.
    let textToSend = anchorIfShort(userText);
    if (
      initialOpportunityId &&
      !sessionId &&
      !userText.includes(initialOpportunityId)
    ) {
      textToSend = `Regarding Partner Central opportunity ${initialOpportunityId}: ${textToSend}`;
    }

    // Top-level chat: on turn 1 (no session yet), if the user's message already
    // names an opportunity (captured into lastOppIdRef a moment ago), prepend a
    // lead-edge anchor. The classifier reacts more reliably to leading context
    // than to trailing parentheticals, and this cuts down on first-turn
    // off-topic misfires.
    if (
      !initialOpportunityId &&
      !sessionId &&
      lastOppIdRef.current &&
      !textToSend.toLowerCase().startsWith('regarding')
    ) {
      textToSend = `Regarding Partner Central opportunity ${lastOppIdRef.current}: ${textToSend}`;
    }

    setInput('');
    addMessage('user', userText);
    setLoading(true);
    setError('');

    try {
      const rpcResponse = await mcpSendMessage({ text: textToSend, sessionId, catalog });
      const parsed = parseAgentResponse(rpcResponse);

      if (parsed.sessionId && !sessionId) {
        setSessionId(parsed.sessionId);
      }

      if (parsed.type === 'error') {
        setError(`Agent error (${parsed.code}): ${parsed.message}`);
      } else if (parsed.type === 'approval_required') {
        if (parsed.sessionId) setSessionId(parsed.sessionId);
        rememberOpportunityId(JSON.stringify(parsed.approvalRequest?.parameters || {}));
        addMessage('agent', 'This operation requires your approval. Please review the details below.');
        setPendingApproval({ ...parsed.approvalRequest, _sessionId: parsed.sessionId || sessionId });
      } else if (
        isOffTopicReply(parsed.text) &&
        lastOppIdRef.current &&
        !AFFIRMATIVE_RE.test(userText.trim())
      ) {
        // Non-affirmative message got classified as off-topic despite our anchor
        // rule not kicking in. Retry once with the opportunity ID appended.
        // eslint-disable-next-line no-console
        console.log('[MCP] off-topic reply on send — re-anchoring for', lastOppIdRef.current);
        const anchored = `${userText} (regarding Partner Central opportunity ${lastOppIdRef.current})`;
        const rpc2 = await mcpSendMessage({ text: anchored, sessionId: parsed.sessionId || sessionId, catalog });
        const parsed2 = parseAgentResponse(rpc2);
        if (parsed2.sessionId && !sessionId) setSessionId(parsed2.sessionId);
        if (parsed2.type === 'approval_required') {
          rememberOpportunityId(JSON.stringify(parsed2.approvalRequest?.parameters || {}));
          addMessage('agent', 'This operation requires your approval. Please review the details below.');
          setPendingApproval({ ...parsed2.approvalRequest, _sessionId: parsed2.sessionId || sessionId });
        } else if (parsed2.type === 'error') {
          setError(`Agent error (${parsed2.code}): ${parsed2.message}`);
        } else if (isOffTopicReply(parsed2.text)) {
          // The retry came back off-topic too. Per the porting guide we only
          // retry once — but surface actionable guidance instead of the canned
          // reply so the user knows it's a classifier miss, not a real limit.
          // eslint-disable-next-line no-console
          console.log('[MCP] retry also off-topic — surfacing user guidance');
          addMessage(
            'agent',
            `The agent's classifier didn't recognize that message as a Partner Central request, even after I added the opportunity ID. This happens occasionally with the current server build.\n\nTry rephrasing with an explicit action verb at the start, for example:\n  • "Tell me about opportunity ${lastOppIdRef.current} — what's its current stage?"\n  • "Summarize opportunity ${lastOppIdRef.current}"\n  • "What do I need to do to progress ${lastOppIdRef.current} to Qualified?"`
          );
        } else {
          rememberOpportunityId(parsed2.text);
          addMessage('agent', parsed2.text || '(no response text)');
        }
      } else {
        rememberOpportunityId(parsed.text);
        addMessage('agent', parsed.text || '(no response text)');
      }
    } catch (e) {
      setError(`Request failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalDecision = async ({ decision, message }) => {
    if (!pendingApproval) return;
    setLoading(true);
    setError('');

    const approval = pendingApproval;
    setPendingApproval(null);

    addMessage('user', `Decision: ${decision}${message ? ` — "${message}"` : ''}`);

    try {
      if (!approval.toolUseId || approval.toolUseId === 'unknown') {
        throw new Error('Cannot send approval: missing toolUseId. Start a new session and retry.');
      }

      let rpcResponse = await mcpSendApproval({
        sessionId: approval._sessionId || sessionId,
        toolUseId: approval.toolUseId,
        decision,
        message,
      });
      let parsed = parseAgentResponse(rpcResponse);

      // Silent auto-retry: if we approved and the server sends back another
      // approval request with the SAME toolUseId, that's a server quirk where
      // the decision didn't stick. Resend once before bothering the user.
      if (
        decision === 'approve' &&
        parsed.type === 'approval_required' &&
        parsed.approvalRequest?.toolUseId === approval.toolUseId
      ) {
        // eslint-disable-next-line no-console
        console.log('[MCP] approval loop detected — resending once for', approval.toolUseId);
        rpcResponse = await mcpSendApproval({
          sessionId: parsed.sessionId || approval._sessionId || sessionId,
          toolUseId: approval.toolUseId,
          decision: 'approve',
        });
        parsed = parseAgentResponse(rpcResponse);
      }

      if (parsed.sessionId && !sessionId) setSessionId(parsed.sessionId);

      if (parsed.type === 'error') {
        setError(`Agent error (${parsed.code}): ${parsed.message}`);
      } else if (parsed.type === 'approval_required') {
        // Genuine new approval (different toolUseId, or auto-retry still looped).
        if (parsed.sessionId) setSessionId(parsed.sessionId);
        rememberOpportunityId(JSON.stringify(parsed.approvalRequest?.parameters || {}));
        addMessage(
          'agent',
          parsed.approvalRequest?.toolUseId === approval.toolUseId
            ? 'The server returned another approval request for this operation. Please review and decide again.'
            : 'Another approval is needed to continue. Please review the details below.'
        );
        setPendingApproval({ ...parsed.approvalRequest, _sessionId: parsed.sessionId || sessionId });
      } else if (
        decision === 'approve' &&
        parsed.type === 'message' &&
        isOffTopicReply(parsed.text) &&
        lastOppIdRef.current
      ) {
        // Server-side intent classifier lost the thread after the approval. Silently
        // re-anchor with the opportunity ID instead of showing the canned reply.
        // eslint-disable-next-line no-console
        console.log('[MCP] off-topic reply after approve — re-anchoring for', lastOppIdRef.current);
        const anchorText = `Continue with the approved operation on opportunity ${lastOppIdRef.current} and share the result.`;
        const rpc2 = await mcpSendMessage({
          text: anchorText,
          sessionId: parsed.sessionId || approval._sessionId || sessionId,
          catalog,
        });
        const parsed2 = parseAgentResponse(rpc2);
        if (parsed2.sessionId && !sessionId) setSessionId(parsed2.sessionId);
        if (parsed2.type === 'approval_required') {
          addMessage('agent', 'Another approval is needed to continue. Please review the details below.');
          setPendingApproval({ ...parsed2.approvalRequest, _sessionId: parsed2.sessionId || sessionId });
        } else if (parsed2.type === 'error') {
          setError(`Agent error (${parsed2.code}): ${parsed2.message}`);
        } else {
          rememberOpportunityId(parsed2.text);
          addMessage('agent', parsed2.text || 'Operation processed.');
        }
      } else {
        rememberOpportunityId(parsed.text);
        addMessage('agent', parsed.text || 'Operation processed.');
      }
    } catch (e) {
      setError(`Approval request failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.detail.key === 'Enter' && !e.detail.shiftKey) {
      handleSend();
    }
  };

  const handleNewSession = () => {
    setSessionId(null);
    setMessages([]);
    setPendingApproval(null);
    setError('');
    addMessage('system', 'New session started.');
  };

  return (
    <SpaceBetween size="m">
      <Container
        header={
          <Header
            variant={compact ? 'h3' : 'h2'}
            description={
              <SpaceBetween size="xxs">
                <div>{sessionId ? `Session: ${sessionId}` : 'No active session — send a message to start one'}</div>
                {!compact && identity && (
                  <Box fontSize="body-s" color={identity.error ? 'text-status-error' : 'text-status-inactive'}>
                    {identity.error ? identity.error : `Identity: ${identity.arn} (Account: ${identity.account})`}
                  </Box>
                )}
                {compact && initialOpportunityId && (
                  <Box fontSize="body-s" color="text-status-inactive">
                    Scoped to opportunity {initialOpportunityId} — follow-up messages anchor here automatically.
                  </Box>
                )}
              </SpaceBetween>
            }            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Badge color={catalog === 'AWS' ? 'red' : 'blue'}>{catalog}</Badge>
                {sessionId && <Badge color="green">Session active</Badge>}
                <Button onClick={handleNewSession} disabled={loading}>New Session</Button>
              </SpaceBetween>
            }
          >
            {compact ? 'Ask the agent' : 'Partner Central Agent Chat'}
          </Header>
        }
      >
        {!hasCredentials() && (
          <Alert type="warning">
            No AWS credentials found. Please <a href="#/">log in</a> first.
          </Alert>
        )}

        {error && (
          <Alert type="error" dismissible onDismiss={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Message history */}
        <div
          style={{
            height: compact ? '360px' : 'calc(100vh - 320px)',
            minHeight: compact ? '280px' : '300px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '12px',
            background: '#f8f8f8',
            borderRadius: '8px',
            border: '1px solid #e9ebed',
          }}
        >
          {messages.length === 0 && (
            <Box color="text-status-inactive" textAlign="center" padding="xl">
              {compact && initialOpportunityId ? (
                <>
                  Ask anything about opportunity {initialOpportunityId}.
                  <br />
                  <br />
                  Try: "What's the current status?", "Am I eligible for MAP funding?", or "What do I need to do to progress this to Qualified?"
                </>
              ) : (
                <>
                  Ask anything about your ACE opportunities in the Sandbox catalog.
                  <br />
                  <br />
                  Try: "List my open opportunities" or "Tell me about opportunity O1234567890"
                </>
              )}
            </Box>
          )}
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Spinner size="normal" />
              <Box color="text-status-inactive" fontSize="body-s">Agent is thinking...</Box>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Approval card */}
        {pendingApproval && !loading && (
          <ApprovalCard request={pendingApproval} onDecision={handleApprovalDecision} />
        )}

        {/* Input area */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <Input
              value={input}
              onChange={({ detail }) => setInput(detail.value)}
              onKeyDown={handleKeyDown}
              placeholder={compact && initialOpportunityId
                ? `Ask about ${initialOpportunityId}... (Enter to send)`
                : 'Ask about your opportunities... (Enter to send)'}
              disabled={loading || !!pendingApproval}
            />
          </div>
          <Button
            variant="primary"
            onClick={handleSend}
            disabled={loading || !input.trim() || !!pendingApproval}
          >
            Send
          </Button>
        </div>
      </Container>
    </SpaceBetween>
  );
};

export default AgentChat;
