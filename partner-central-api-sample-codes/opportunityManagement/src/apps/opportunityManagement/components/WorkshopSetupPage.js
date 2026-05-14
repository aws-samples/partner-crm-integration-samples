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
const BEDROCK_MODEL_ID = 'us.anthropic.claude-haiku-4-5-20251001-v1:0';

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

const checkBedrockAccess = async (creds) => {
  const url = `https://bedrock-runtime.${REGION}.amazonaws.com/model/${BEDROCK_MODEL_ID}/converse`;
  const body = {
    messages: [{
      role: 'user',
      content: [{ text: "Say 'Bedrock access verified' in exactly those words." }],
    }],
    inferenceConfig: { maxTokens: 50 },
  };

  const response = await signAndFetch(creds, url, body, 'bedrock');
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errText.slice(0, 200)}`);
  }
  const result = await response.json();
  const output = result?.output?.message?.content?.[0]?.text || 'OK';
  return { response: output.slice(0, 80) };
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
