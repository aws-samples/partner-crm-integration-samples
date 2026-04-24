import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Container,
  Header,
  SpaceBetween,
  FormField,
  Input,
  Button,
  Alert,
  Box,
  Select
} from '@cloudscape-design/components';
import { storeCredentials, hasCredentials, getCredentials } from '../utils/sessionStorage';
import { CATALOG_OPTIONS } from '../config/config';

const CredentialsForm = () => {
  const navigate = useNavigate();
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [region, setRegion] = useState('us-east-1');
  const [endpointUrl, setEndpointUrl] = useState('https://partnercentral-selling.us-east-1.api.aws');
  const [catalog, setCatalog] = useState(CATALOG_OPTIONS[0].value);
  const [error, setError] = useState('');
  const [sandboxStatus, setSandboxStatus] = useState(null); // null | 'testing' | 'ok' | 'fail'
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (hasCredentials()) {
      const credentials = getCredentials();
      setAccessKey(credentials.accessKey || '');
      setSecretKey(credentials.secretKey || '');
      setSessionToken(credentials.sessionToken || '');
      setRegion(credentials.region || 'us-east-1');
      setEndpointUrl(credentials.endpointUrl || 'https://partnercentral-selling.us-east-1.api.aws');
      setCatalog(credentials.catalog || CATALOG_OPTIONS[0].value);
    }
  }, []);

  const handleSubmit = () => {
    if (!accessKey || !secretKey) {
      setError('Access Key and Secret Key are required');
      return;
    }
    try {
      storeCredentials(accessKey, secretKey, sessionToken, region, { endpointUrl, catalog });
      navigate('/opportunities');
    } catch (err) {
      setError('Failed to store credentials: ' + err.message);
    }
  };

  const handleTestSandbox = async () => {
    if (!accessKey || !secretKey) {
      setError('Enter credentials before testing Sandbox access');
      return;
    }
    setSandboxStatus('testing');
    setError('');
    try {
      const { PartnerCentralSellingClient, ListOpportunitiesCommand } = await import('@aws-sdk/client-partnercentral-selling');
      const client = new PartnerCentralSellingClient({
        region: region || 'us-east-1',
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
          sessionToken: sessionToken || undefined,
        },
        ...(endpointUrl ? { endpoint: endpointUrl } : {}),
      });
      await client.send(new ListOpportunitiesCommand({ Catalog: 'Sandbox', MaxResults: 1 }));
      setSandboxStatus('ok');
    } catch (err) {
      setSandboxStatus('fail');
      setError(`Sandbox test failed: ${err.message}`);
    }
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
        const lines = e.target.result.split('\n');
        let awsAccessKey = '', awsSecretKey = '', awsSessionToken = '', awsRegion = 'us-east-1';
        lines.forEach(line => {
          const t = line.trim();
          if (t.startsWith('aws_access_key_id=')) awsAccessKey = t.split('=')[1];
          else if (t.startsWith('aws_secret_access_key=')) awsSecretKey = t.split('=')[1];
          else if (t.startsWith('aws_session_token=')) awsSessionToken = t.split('=')[1];
          else if (t.startsWith('region=')) awsRegion = t.split('=')[1];
        });
        setAccessKey(awsAccessKey);
        setSecretKey(awsSecretKey);
        setSessionToken(awsSessionToken);
        setRegion(awsRegion || 'us-east-1');
        setEndpointUrl('https://partnercentral-selling.us-east-1.api.aws');
        setError('');
      } catch (err) {
        setError('Failed to parse credentials file: ' + err.message);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <Container>
      <Form
        header={<Header variant="h1">AWS Credentials</Header>}
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button formAction="none" variant="link">Cancel</Button>
            <Button onClick={handleCredentialSync}>Credential Sync</Button>
            <Button onClick={handleTestSandbox} loading={sandboxStatus === 'testing'}>
              Test Sandbox Access
            </Button>
            <Button variant="primary" onClick={handleSubmit}>Submit</Button>
          </SpaceBetween>
        }
      >
        {error && <Alert type="error">{error}</Alert>}
        {sandboxStatus === 'ok' && (
          <Alert type="success">Sandbox access confirmed — your account has Sandbox catalog access.</Alert>
        )}
        {sandboxStatus === 'fail' && !error && (
          <Alert type="error">Sandbox access check failed. Your account may not have Sandbox catalog access.</Alert>
        )}

        <Alert type="warning">
          <Box fontWeight="bold">⚠️ SECURITY WARNING</Box>
          <SpaceBetween size="xs">
            <div>This is a demo application. Never use long-term AWS credentials in production applications or store them client-side.</div>
            <div>• Use temporary credentials with limited permissions</div>
            <div>• Consider using AWS STS AssumeRole for temporary access</div>
            <div>• Never share or commit credentials to version control</div>
          </SpaceBetween>
        </Alert>

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

          <FormField label="AWS Region">
            <Input
              value={region}
              onChange={({ detail }) => setRegion(detail.value)}
              placeholder="us-east-1"
            />
          </FormField>

          <FormField label="Catalog" description="Applies to all API calls and the Agent Chat. Use Sandbox for safe testing.">
            <Select
              selectedOption={CATALOG_OPTIONS.find(o => o.value === catalog)
                ? { value: catalog, label: CATALOG_OPTIONS.find(o => o.value === catalog).name }
                : null}
              onChange={({ detail }) => setCatalog(detail.selectedOption?.value || CATALOG_OPTIONS[0].value)}
              options={CATALOG_OPTIONS.map(o => ({ value: o.value, label: o.name }))}
              placeholder="Select catalog"
            />
          </FormField>

          <FormField label="Endpoint URL">
            <Input
              value={endpointUrl}
              onChange={({ detail }) => setEndpointUrl(detail.value)}
              placeholder="https://partnercentral-selling.us-east-1.api.aws"
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

      <Box margin={{ top: 's' }} color="text-status-info">
        <strong>Tip:</strong> To see hidden folders (e.g., .aws) when selecting files:
        <br />• Mac: Press Command + Shift + .
        <br />• Windows: Press Ctrl + Shift + .
        <br /><br /><strong>Credential Sync:</strong> Upload a file with credentials in this format:
        <br />aws_access_key_id=YOUR_ACCESS_KEY
        <br />aws_secret_access_key=YOUR_SECRET_KEY
        <br />aws_session_token=YOUR_SESSION_TOKEN
        <br />region=us-east-1
      </Box>

      <Box margin={{ top: 'l' }} padding={{ top: 's' }} color="text-status-inactive" fontSize="body-s">
        <div style={{ borderTop: '1px solid #e9ebed', paddingTop: '12px' }}>
          <div><strong>IMPORTANT DISCLAIMERS:</strong></div>
          <div>• This is a sample application for demonstration purposes only</div>
          <div>• Should not be used as-is in production environments</div>
          <div>• Credentials are stored in browser session storage only</div>
          <div>• Use at your own risk - review security implications</div>
          <br />
          <div>Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.</div>
          <div>This sample application is licensed under the MIT-0 License.</div>
        </div>
      </Box>
    </Container>
  );
};

export default CredentialsForm;
