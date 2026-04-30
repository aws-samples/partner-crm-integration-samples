// src/services/mcpService.js
// Handles JSON-RPC 2.0 calls to the Partner Central Agent MCP Server
// with AWS Signature Version 4 signing at the transport layer.

import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-browser';
import { getCredentials } from '../utils/sessionStorage';

const MCP_ENDPOINT = 'https://partnercentral-agents-mcp.us-east-1.api.aws/mcp';
const SERVICE = 'partnercentral-agents-mcp';
const REGION = 'us-east-1';

// Client identification per Partner Central MCP docs. AWS recommends sending
// these on every tools/call (via _meta) and in the initialize clientInfo so
// they can attribute usage and track success rates for different client
// implementations.
const CLIENT_INFO = {
  integrator: 'Direct',
  sourceProduct: 'AWS Partner Central Opportunity Management Sample',
};

let requestId = 1;

const getSigner = () => {
  const creds = getCredentials();
  return new SignatureV4({
    credentials: {
      accessKeyId: creds.accessKey,
      secretAccessKey: creds.secretKey,
      sessionToken: creds.sessionToken || undefined,
    },
    region: REGION,
    service: SERVICE,
    sha256: Sha256,
  });
};

const signedFetch = async (body) => {
  const signer = getSigner();
  const url = new URL(MCP_ENDPOINT);
  const bodyStr = JSON.stringify(body);

  const request = {
    method: 'POST',
    hostname: url.hostname,
    path: url.pathname,
    protocol: 'https:',
    headers: {
      'Content-Type': 'application/json',
      host: url.hostname,
    },
    body: bodyStr,
  };

  const signed = await signer.sign(request);

  const response = await fetch(MCP_ENDPOINT, {
    method: 'POST',
    headers: signed.headers,
    body: bodyStr,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.json();
};

// Check caller identity using STS (helps debug credential issues)
export const getCallerIdentity = async () => {
  const creds = getCredentials();
  const signer = new SignatureV4({
    credentials: {
      accessKeyId: creds.accessKey,
      secretAccessKey: creds.secretKey,
      sessionToken: creds.sessionToken || undefined,
    },
    region: REGION,
    service: 'sts',
    sha256: Sha256,
  });

  const bodyStr = 'Action=GetCallerIdentity&Version=2011-06-15';
  const request = {
    method: 'POST',
    hostname: 'sts.amazonaws.com',
    path: '/',
    protocol: 'https:',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      host: 'sts.amazonaws.com',
    },
    body: bodyStr,
  };

  const signed = await signer.sign(request);
  const response = await fetch('https://sts.amazonaws.com/', {
    method: 'POST',
    headers: signed.headers,
    body: bodyStr,
  });

  const text = await response.text();
  // Parse Account and Arn from XML response
  const account = text.match(/<Account>(.*?)<\/Account>/)?.[1];
  const arn = text.match(/<Arn>(.*?)<\/Arn>/)?.[1];
  return { account, arn };
};

// Initialize MCP connection
export const mcpInitialize = async () => {
  const body = {
    jsonrpc: '2.0',
    id: requestId++,
    method: 'initialize',
    params: {
      protocolVersion: '2025-03-26',
      clientInfo: {
        name: 'opportunity-management-ui',
        version: '1.0.0',
        integrator: CLIENT_INFO.integrator,
        sourceProduct: CLIENT_INFO.sourceProduct,
      },
      capabilities: {},
    },
  };
  return signedFetch(body);
};

// Send a message to the agent
export const mcpSendMessage = async ({ text, sessionId, catalog = 'Sandbox', stream = false }) => {
  const params = {
    catalog,
    content: [{ type: 'text', text }],
  };
  if (sessionId) params.sessionId = sessionId;
  if (stream) params.stream = true;

  const body = {
    jsonrpc: '2.0',
    id: requestId++,
    method: 'tools/call',
    params: {
      name: 'sendMessage',
      arguments: params,
      _meta: { ...CLIENT_INFO },
    },
  };
  return signedFetch(body);
};

// Send a tool approval response
export const mcpSendApproval = async ({ sessionId, toolUseId, decision, message, catalog = 'Sandbox' }) => {
  const approvalContent = {
    type: 'tool_approval_response',
    toolUseId,
    decision,
  };
  if (message) approvalContent.message = message;

  const body = {
    jsonrpc: '2.0',
    id: requestId++,
    method: 'tools/call',
    params: {
      name: 'sendMessage',
      arguments: {
        catalog,
        sessionId,
        content: [approvalContent],
      },
      _meta: { ...CLIENT_INFO },
    },
  };
  // Dev aid: log what we're sending so we can diff against the spec.
  try {
    console.log('[MCP] sending approval:', { sessionId, toolUseId, decision, message, catalog });
    if (typeof window !== 'undefined') window.__lastMcpApprovalBody = body;
  } catch (_) {}
  return signedFetch(body);
};

// Get session state
export const mcpGetSession = async (sessionId) => {
  const body = {
    jsonrpc: '2.0',
    id: requestId++,
    method: 'tools/call',
    params: {
      name: 'getSession',
      arguments: { sessionId },
      _meta: { ...CLIENT_INFO },
    },
  };
  return signedFetch(body);
};

// Unwrap the outer JSON-RPC envelope into the agent payload.
// MCP returns result.content = [{ type: 'text', text: '<json-string>' }].
// The inner JSON has { sessionId, status, content: [...] }.
const _unwrapResult = (rpcResponse) => {
  const result = rpcResponse.result;
  if (!result) return null;
  const outer = result.content || [];
  for (const block of outer) {
    if (block.type === 'text' && typeof block.text === 'string') {
      try {
        return JSON.parse(block.text);
      } catch (_) {
        // outer text is not JSON — return a synthetic payload so callers still get text
        return { _rawText: block.text };
      }
    }
  }
  return null;
};

// Walk each content block by type and pull out the approval request details.
// Inner content array contains various block types across server builds:
//   - { type: 'text', text: '...' }
//   - { type: 'ASSISTANT_RESPONSE', content: { text }}
//   - { type: 'tool_approval_request', toolUseId, toolName, parameters }
//   - { type: 'serverToolUse' | 'TOOL_USE' | 'tool_use', content: { toolUseId, name, input } }
//   - { type: 'serverToolResult', content: { toolUseId, output, status } }
const _extractApprovalRequest = (payload) => {
  const blocks = Array.isArray(payload?.content) ? payload.content : [];
  let toolUseId;
  let toolName;
  let parameters;
  const descriptions = [];

  // Helper: look for id/name/params at either the block root OR inside block.content.
  const pickId = (b) =>
    b?.toolUseId ?? b?.tool_use_id ?? b?.toolUseID ?? b?.id ??
    b?.content?.toolUseId ?? b?.content?.tool_use_id ?? b?.content?.id;
  const pickName = (b) =>
    b?.toolName ?? b?.tool_name ?? b?.name ??
    b?.content?.toolName ?? b?.content?.name;
  const pickParams = (b) => {
    const raw = b?.parameters ?? b?.input ?? b?.arguments ??
                b?.content?.parameters ?? b?.content?.input ?? b?.content?.arguments;
    // Some builds stringify input/arguments — try to parse if it looks like JSON.
    if (typeof raw === 'string') {
      const t = raw.trim();
      if (t.startsWith('{') || t.startsWith('[')) {
        try { return JSON.parse(t); } catch (_) { /* fall through */ }
      }
    }
    return raw;
  };

  const TOOL_USE_TYPES = new Set(['tool_approval_request', 'TOOL_USE', 'tool_use', 'serverToolUse']);

  for (const block of blocks) {
    const btype = block?.type;
    if (!btype) continue;

    if (btype === 'tool_approval_request') {
      toolUseId = pickId(block) ?? toolUseId;
      toolName = pickName(block) ?? toolName;
      parameters = pickParams(block) ?? parameters;
      continue;
    }

    if (TOOL_USE_TYPES.has(btype)) {
      // Skip internal "thinking" tool uses — they are agent scratchpad, not user approvals.
      const name = pickName(block);
      if (name === 'thinking') continue;
      // Prefer the last tool use encountered so we pick the most recent pending write.
      toolUseId = pickId(block) ?? toolUseId;
      toolName = name ?? toolName;
      parameters = pickParams(block) ?? parameters;
      continue;
    }

    if (btype === 'ASSISTANT_RESPONSE' && block.content?.text) {
      descriptions.push(block.content.text);
      continue;
    }

    if (btype === 'text' && typeof block.text === 'string') {
      descriptions.push(block.text);
    }
  }

  // Legacy top-level fallback (some older server builds)
  if (!toolUseId && payload?.tool_approval_request) {
    const r = payload.tool_approval_request;
    toolUseId = pickId(r);
    toolName = pickName(r);
    parameters = pickParams(r);
  }

  // Last-resort regex scan: extract the first tooluse_* id seen in the payload
  // in case the server uses a block shape we haven't mapped yet.
  if (!toolUseId) {
    const s = JSON.stringify(payload);
    const m = s.match(/"(?:toolUseId|tool_use_id)"\s*:\s*"(tooluse_[A-Za-z0-9]+)"/);
    if (m) toolUseId = m[1];
  }

  // Fail fast — a bad toolUseId would just loop us back into requires_approval.
  if (!toolUseId || toolUseId === 'unknown') {
    const snippet = JSON.stringify(payload).slice(0, 4000);
    throw new Error(
      'Approval request is missing a valid toolUseId. Server payload: ' + snippet
    );
  }

  return {
    toolUseId,
    toolName: toolName || 'unknown',
    parameters: parameters || {},
    description: descriptions.join('\n\n').trim() || undefined,
  };
};

// Collect the final assistant-facing text from a completed response.
const _extractAssistantText = (payload) => {
  const blocks = Array.isArray(payload?.content) ? payload.content : [];
  const texts = [];
  for (const block of blocks) {
    if (block?.type === 'ASSISTANT_RESPONSE' && block.content?.text) {
      texts.push(block.content.text);
    } else if (block?.type === 'text' && typeof block.text === 'string') {
      texts.push(block.text);
    }
  }
  return texts.length ? texts[texts.length - 1] : '';
};

// Parse the agent response into a usable shape
export const parseAgentResponse = (rpcResponse) => {
  if (rpcResponse.error) {
    return { type: 'error', code: rpcResponse.error.code, message: rpcResponse.error.message };
  }

  const payload = _unwrapResult(rpcResponse);
  // Dev aid: log the unwrapped agent payload AND stash it on window so we can
  // inspect the full object from DevTools even if the message gets truncated.
  try {
    console.log('[MCP] payload:', payload);
    if (typeof window !== 'undefined') window.__lastMcpPayload = payload;
  } catch (_) {}

  if (!payload) return { type: 'error', message: 'Empty response' };

  // Fallback: outer text wasn't JSON — just surface it.
  if (payload._rawText && !payload.status && !payload.content) {
    return { type: 'message', text: payload._rawText };
  }

  const status = (payload.status || '').toLowerCase();

  // Only treat a response as an approval request when the server explicitly says so:
  //   - status === 'requires_approval', OR
  //   - a tool_approval_request block is present in inner content, OR
  //   - a top-level tool_approval_request field is present (legacy shape).
  // Bare serverToolUse / TOOL_USE blocks are the agent running read-only tools
  // (e.g. get_full_opportunity, thinking) mid-turn and MUST NOT trigger approval.
  const innerBlocks = Array.isArray(payload.content) ? payload.content : [];
  const hasApprovalBlock = innerBlocks.some(b => b?.type === 'tool_approval_request');
  const hasTopLevelApproval = !!payload.tool_approval_request;
  const isApproval =
    status === 'requires_approval' || hasApprovalBlock || hasTopLevelApproval;

  if (isApproval) {
    try {
      const approvalRequest = _extractApprovalRequest(payload);
      return {
        type: 'approval_required',
        sessionId: payload.sessionId,
        approvalRequest,
      };
    } catch (e) {
      return { type: 'error', message: e.message };
    }
  }

  const text = _extractAssistantText(payload) || payload._rawText || '(no response)';
  return {
    type: 'message',
    sessionId: payload.sessionId,
    text,
    status: payload.status,
  };
};
