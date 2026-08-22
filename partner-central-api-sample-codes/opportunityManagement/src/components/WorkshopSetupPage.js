import React, { useState, useRef } from 'react';
import {
  Container,
  Box,
  SpaceBetween,
  StatusIndicator,
  Button,
  Header,
  ColumnLayout,
  Alert,
  FormField,
  Input,
  Form,
} from '@cloudscape-design/components';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-browser';

const REGION = 'us-east-1';
const MCP_ENDPOINT = 'https://partnercentral-agents-mcp.us-east-1.api.aws/mcp';
const PC_SELLING_ENDPOINT = 'https://partnercentral-selling.us-east-1.api.aws';
const CATALOG = 'Sandbox';

const getSignerForService = (creds, service) => {
  return new SignatureV4({
    credentials: {
      accessKeyId: creds.accessKey,
      secretAccessKey: creds.secretKey,
      sessionToken: creds.sessionToken || undefined,
    },
    region: REGION,
    service,
    sha256: Sha256,
  });
};

const signAndFetch = async (creds, url, body, service, headers = {}) => {
  const signer = getSignerForService(creds, service);
  const urlObj = new URL(url);
  const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);

  const request = {
    method: 'POST',
    hostname: urlObj.hostname,
    path: urlObj.pathname,
    protocol: 'https:',
    headers: {
      'Content-Type': headers['Content-Type'] || 'application/json',
      host: urlObj.hostname,
      ...headers,
    },
    body: bodyStr,
  };

  const signed = await signer.sign(request);
  const response = await fetch(url, {
    method: 'POST',
    headers: signed.headers,
    body: bodyStr,
  });

  return response;
};

const signAndFetchGet = async (creds, url, service) => {
  const signer = getSignerForService(creds, service);
  const urlObj = new URL(url);

  const request = {
    method: 'GET',
    hostname: urlObj.hostname,
    path: urlObj.pathname + urlObj.search,
    protocol: 'https:',
    headers: { host: urlObj.hostname },
  };

  const signed = await signer.sign(request);
  return fetch(url, { method: 'GET', headers: signed.headers });
};

const checkAwsCredentials = async (creds) => {
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

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const text = await response.text();
  const account = text.match(/<Account>(.*?)<\/Account>/)?.[1];
  const arn = text.match(/<Arn>(.*?)<\/Arn>/)?.[1];
  return { account, arn };
};

// Hardcoded fallback list used when discovery fails (e.g. the IAM policy
// doesn't include bedrock:ListInferenceProfiles / bedrock:ListFoundationModels).
// Keep these ordered the same way rankClaudeModels would.
const FALLBACK_CLAUDE_CANDIDATES = [
  'us.anthropic.claude-haiku-4-5-20251001-v1:0',
  'us.anthropic.claude-3-5-haiku-20241022-v1:0',
  'us.anthropic.claude-3-haiku-20240307-v1:0',
  'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
  'us.anthropic.claude-sonnet-4-20250514-v1:0',
  'anthropic.claude-3-haiku-20240307-v1:0',
  'anthropic.claude-3-5-sonnet-20241022-v2:0',
];

// Order Anthropic Claude IDs by family (haiku→sonnet→opus), profile preference,
// and newest version date — same logic as orchestrator_agent._rank_models.
const rankClaudeModels = (ids) => {
  const familyRank = { haiku: 0, sonnet: 1, opus: 2 };
  const dateRe = /(\d{8})/;

  const key = (mid) => {
    const m = mid.toLowerCase();
    const family = Object.keys(familyRank).find((f) => m.includes(f)) || 'zzz_other';
    const dateMatch = m.match(dateRe);
    const dateKey = dateMatch ? -parseInt(dateMatch[1], 10) : 0;
    const profilePriority = ['us', 'eu', 'apac'].includes(m.split('.')[0]) ? 0 : 1;
    return [familyRank[family] ?? 99, profilePriority, dateKey];
  };

  const seen = new Set();
  return [...ids]
    .sort((a, b) => {
      const [a1, a2, a3] = key(a);
      const [b1, b2, b3] = key(b);
      return a1 - b1 || a2 - b2 || a3 - b3;
    })
    .filter((id) => (seen.has(id) ? false : seen.add(id)));
};

// Discover Anthropic models via bedrock.{region}.amazonaws.com (control plane).
// Returns a ranked, deduplicated list of inference-profile IDs + bare model IDs.
const discoverAnthropicModels = async (creds) => {
  const ids = [];
  const baseUrl = `https://bedrock.${REGION}.amazonaws.com`;

  try {
    const resp = await signAndFetchGet(creds, `${baseUrl}/inference-profiles`, 'bedrock');
    if (resp.ok) {
      const data = await resp.json();
      for (const prof of data.inferenceProfileSummaries || []) {
        const pid = prof.inferenceProfileId || prof.inferenceProfileArn || '';
        if (pid.toLowerCase().includes('anthropic') && (prof.status || 'ACTIVE') === 'ACTIVE') {
          ids.push(pid);
        }
      }
    }
  } catch (_) { /* fall through to foundation models */ }

  try {
    const resp = await signAndFetchGet(
      creds,
      `${baseUrl}/foundation-models?byProvider=anthropic`,
      'bedrock'
    );
    if (resp.ok) {
      const data = await resp.json();
      for (const m of data.modelSummaries || []) {
        if (!(m.outputModalities || []).includes('TEXT')) continue;
        if ((m.modelLifecycle || {}).status !== 'ACTIVE') continue;
        if (!(m.inferenceTypesSupported || ['ON_DEMAND']).includes('ON_DEMAND')) continue;
        ids.push(m.modelId);
      }
    }
  } catch (_) { /* return whatever we have */ }

  return rankClaudeModels(ids);
};

const checkBedrockAccess = async (creds) => {
  // Dynamic discovery: list Anthropic models, rank, probe in order, stop at first success.
  // Falls back to a hardcoded candidate list if discovery returns empty (e.g. the
  // IAM policy doesn't include bedrock:ListInferenceProfiles).
  let candidates = await discoverAnthropicModels(creds);
  let usedFallback = false;
  if (!candidates.length) {
    candidates = FALLBACK_CLAUDE_CANDIDATES;
    usedFallback = true;
  }

  let lastError = null;
  for (const modelId of candidates) {
    try {
      const url = `https://bedrock-runtime.${REGION}.amazonaws.com/model/${modelId}/converse`;
      const body = {
        messages: [{
          role: 'user',
          content: [{ text: "Say 'Bedrock access verified' in exactly those words." }],
        }],
        inferenceConfig: { maxTokens: 50 },
      };
      const response = await signAndFetch(creds, url, body, 'bedrock');
      if (response.ok) {
        const result = await response.json();
        const output = result?.output?.message?.content?.[0]?.text || 'OK';
        const detail = { model: modelId, response: output.slice(0, 80) };
        if (usedFallback) {
          detail.note = 'Bedrock model discovery skipped (IAM lacks bedrock:ListInferenceProfiles / ListFoundationModels). Probed a built-in candidate list instead.';
        }
        return detail;
      }
      const errText = await response.text();
      lastError = `HTTP ${response.status}: ${errText.slice(0, 200)}`;
      // Skip "model not usable" errors and try the next candidate.
      if (
        response.status === 400 ||
        response.status === 403 ||
        response.status === 404 ||
        /AccessDeniedException|ValidationException|ResourceNotFoundException|on-demand throughput/i.test(errText)
      ) {
        continue;
      }
      // Anything else: abort discovery.
      throw new Error(lastError);
    } catch (err) {
      lastError = err.message || String(err);
    }
  }

  throw new Error(
    `No usable Bedrock model in ${REGION} (tried ${candidates.length}). ` +
    `Last error: ${lastError || 'unknown'}. ` +
    `Models tried: ${candidates.slice(0, 5).join(', ')}. ` +
    `Note: Bedrock's "Model access" console page has been retired — Anthropic models are ` +
    `auto-enabled on first invoke. First-time Anthropic users may need to submit a one-time ` +
    `use-case form via the Bedrock console "Model catalog". Also confirm your IAM grants ` +
    `bedrock:InvokeModel + InvokeModelWithResponseStream on Claude foundation-model/* and inference-profile/* ARNs.`
  );
};

const checkPartnerCentralApi = async (creds) => {
  const url = `${PC_SELLING_ENDPOINT}/ListOpportunities`;
  const body = { Catalog: CATALOG, MaxResults: 1 };

  const response = await signAndFetch(creds, url, body, 'partnercentral-selling', {
    'Content-Type': 'application/x-amz-json-1.0',
    'X-Amz-Target': 'AWSPartnerCentralSelling.ListOpportunities',
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errText.slice(0, 200)}`);
  }
  const result = await response.json();
  const count = (result.OpportunitySummaries || []).length;
  return { opportunities: count };
};

const checkMcpServer = async (creds) => {
  const body = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'sendMessage',
      arguments: {
        content: [{ type: 'text', text: 'Hello, what can you help me with?' }],
        catalog: CATALOG,
        stream: false,
      },
    },
  };

  const response = await signAndFetch(creds, MCP_ENDPOINT, body, 'partnercentral-agents-mcp');
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errText.slice(0, 200)}`);
  }
  const result = await response.json();
  if (result.error) throw new Error(result.error.message || JSON.stringify(result.error));

  const content = result?.result?.content || [];
  for (const block of content) {
    if (block.type === 'text' && block.text) {
      try {
        const inner = JSON.parse(block.text);
        return { status: inner.status || 'connected' };
      } catch (_) {
        return { status: 'connected' };
      }
    }
  }
  return { status: 'connected' };
};

const CHECKS = [
  { id: 'credentials', label: 'AWS Credentials', fn: checkAwsCredentials },
  { id: 'bedrock', label: 'Amazon Bedrock Model Access', fn: checkBedrockAccess },
  { id: 'pc-api', label: 'Partner Central Selling API', fn: checkPartnerCentralApi },
  { id: 'mcp', label: 'Partner Central MCP Server', fn: checkMcpServer },
];

function WorkshopSetupPage() {
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [error, setError] = useState('');
  const [results, setResults] = useState({});
  const [running, setRunning] = useState(false);
  const fileInputRef = useRef(null);

  const handleRunChecks = async () => {
    if (!accessKey || !secretKey) {
      setError('Access Key and Secret Key are required');
      return;
    }
    setError('');
    setRunning(true);
    setResults({});

    const creds = { accessKey, secretKey, sessionToken };

    for (const check of CHECKS) {
      setResults((prev) => ({ ...prev, [check.id]: { status: 'loading' } }));
      try {
        const detail = await check.fn(creds);
        setResults((prev) => ({ ...prev, [check.id]: { status: 'success', detail } }));
      } catch (err) {
        setResults((prev) => ({ ...prev, [check.id]: { status: 'error', message: err.message } }));
      }
    }
    setRunning(false);
  };

  const handleCredentialSync = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const lines = content.split('\n');

        lines.forEach(line => {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('aws_access_key_id=')) {
            setAccessKey(trimmedLine.split('=')[1]);
          } else if (trimmedLine.startsWith('aws_secret_access_key=')) {
            setSecretKey(trimmedLine.split('=')[1]);
          } else if (trimmedLine.startsWith('aws_session_token=')) {
            setSessionToken(trimmedLine.split('=')[1]);
          }
        });
        setError('');
      } catch (err) {
        setError('Failed to parse credentials file: ' + err.message);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const allPassed = CHECKS.every((c) => results[c.id]?.status === 'success');
  const anyFailed = CHECKS.some((c) => results[c.id]?.status === 'error');

  return (
    <Box padding={{ top: 'l', horizontal: 'l' }}>
      <SpaceBetween size="l">
        <Container>
          <Form
            header={<Header variant="h1">Workshop Setup Verification</Header>}
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={handleCredentialSync}>
                  Credential Sync
                </Button>
                <Button variant="primary" onClick={handleRunChecks} loading={running}>
                  {Object.keys(results).length === 0 ? 'Test Workshop Setup' : 'Re-run Checks'}
                </Button>
              </SpaceBetween>
            }
          >
            {error && <Alert type="error">{error}</Alert>}

            <Box margin={{ top: 'l' }}>
              <FormField label="AWS Access Key ID" required>
                <Input
                  value={accessKey}
                  onChange={({ detail }) => setAccessKey(detail.value)}
                  placeholder="Enter your AWS Access Key ID"
                />
              </FormField>

              <FormField label="AWS Secret Access Key" required>
                <Input
                  type="password"
                  value={secretKey}
                  onChange={({ detail }) => setSecretKey(detail.value)}
                  placeholder="Enter your AWS Secret Access Key"
                />
              </FormField>

              <FormField label="AWS Session Token (optional)">
                <Input
                  type="password"
                  value={sessionToken}
                  onChange={({ detail }) => setSessionToken(detail.value)}
                  placeholder="Enter your AWS Session Token if using temporary credentials"
                />
              </FormField>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="*"
                style={{ display: 'none' }}
              />
            </Box>
          </Form>
        </Container>

        {Object.keys(results).length > 0 && (
          <Container header={<Header variant="h2">Results</Header>}>
            <SpaceBetween size="m">
              <ColumnLayout columns={1}>
                {CHECKS.map((check) => {
                  const r = results[check.id];
                  return (
                    <Box key={check.id} padding={{ vertical: 'xs' }}>
                      <SpaceBetween size="xxs">
                        <Box>
                          {r?.status === 'loading' && <StatusIndicator type="loading">{check.label}</StatusIndicator>}
                          {r?.status === 'success' && <StatusIndicator type="success">{check.label}</StatusIndicator>}
                          {r?.status === 'error' && <StatusIndicator type="error">{check.label}</StatusIndicator>}
                        </Box>
                        {r?.status === 'success' && r.detail && (
                          <Box color="text-status-info" fontSize="body-s" padding={{ left: 'l' }}>
                            {Object.entries(r.detail).map(([k, v]) => (
                              <div key={k}>{k}: {v}</div>
                            ))}
                          </Box>
                        )}
                        {r?.status === 'error' && (
                          <Box color="text-status-error" fontSize="body-s" padding={{ left: 'l' }}>
                            {r.message}
                          </Box>
                        )}
                      </SpaceBetween>
                    </Box>
                  );
                })}
              </ColumnLayout>

              {allPassed && (
                <Alert type="success">
                  🎉 All checks passed! Your setup is ready for the workshop.
                </Alert>
              )}
              {anyFailed && !running && (
                <Alert type="error">
                  ⚠️ Some checks failed. Please fix the issues above and re-run.
                </Alert>
              )}
            </SpaceBetween>
          </Container>
        )}
      </SpaceBetween>
    </Box>
  );
}

export default WorkshopSetupPage;
