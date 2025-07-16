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
import { config, CATALOG_OPTIONS } from '../config/config';

const CredentialsForm = () => {
  const navigate = useNavigate();
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [region, setRegion] = useState('us-east-1');
  const [endpointUrl, setEndpointUrl] = useState('https://partnercentral-selling.us-east-1.api.aws');
  const [catalog, setCatalog] = useState(CATALOG_OPTIONS[1].value);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    // Pre-fill form with existing credentials if available
    if (hasCredentials()) {
      const credentials = getCredentials();
      setAccessKey(credentials.accessKey || '');
      setSecretKey(credentials.secretKey || '');
      setSessionToken(credentials.sessionToken || '');
      setRegion(credentials.region || 'us-east-1');
      setEndpointUrl(credentials.endpointUrl || 'https://partnercentral-selling.us-east-1.api.aws');
      setCatalog(credentials.catalog || CATALOG_OPTIONS[1].value);
    }
  }, []);
  
  const handleSubmit = () => {
    console.log('Form submitted');
    
    if (!accessKey || !secretKey) {
      setError('Access Key and Secret Key are required');
      return;
    }
    
    try {
      console.log('Storing credentials...');
      const additionalConfig = config.Internal ? { endpointUrl, catalog } : {};
      storeCredentials(accessKey, secretKey, sessionToken, region, additionalConfig);
      console.log('Credentials stored successfully');
      console.log('Navigating to /opportunities...');
      navigate('/opportunities');
    } catch (error) {
      console.error('Error storing credentials:', error);
      setError('Failed to store credentials: ' + error.message);
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
        const content = e.target.result;
        const lines = content.split('\n');
        
        let awsAccessKey = '';
        let awsSecretKey = '';
        let awsSessionToken = '';
        let awsRegion = 'us-east-1';
        
        lines.forEach(line => {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('aws_access_key_id=')) {
            awsAccessKey = trimmedLine.split('=')[1];
          } else if (trimmedLine.startsWith('aws_secret_access_key=')) {
            awsSecretKey = trimmedLine.split('=')[1];
          } else if (trimmedLine.startsWith('aws_session_token=')) {
            awsSessionToken = trimmedLine.split('=')[1];
          } else if (trimmedLine.startsWith('region=')) {
            awsRegion = trimmedLine.split('=')[1];
          }
        });
        
        setAccessKey(awsAccessKey);
        setSecretKey(awsSecretKey);
        setSessionToken(awsSessionToken);
        setRegion(awsRegion || 'us-east-1');
        setEndpointUrl('https://partnercentral-selling.us-east-1.api.aws');
        setCatalog(CATALOG_OPTIONS[1].value);
        setError('');
        
      } catch (error) {
        setError('Failed to parse credentials file: ' + error.message);
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
            <Button formAction="none" variant="link">
              Cancel
            </Button>
            <Button onClick={handleCredentialSync}>
              Credential Sync
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </SpaceBetween>
        }
      >
        {error && <Alert type="error">{error}</Alert>}
      
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
        
        {config.Internal && (
          <>
            <FormField label="Endpoint URL">
              <Input
                value={endpointUrl}
                onChange={({ detail }) => setEndpointUrl(detail.value)}
                placeholder="https://partnercentral-selling.us-east-1.api.aws"
              />
            </FormField>
            
            <FormField label="Catalog">
              <Select
                selectedOption={CATALOG_OPTIONS.find(option => option.value === catalog) ? { value: catalog, label: CATALOG_OPTIONS.find(option => option.value === catalog).name } : null}
                onChange={({ detail }) => setCatalog(detail.selectedOption?.value || CATALOG_OPTIONS[1].value)}
                options={CATALOG_OPTIONS.map(option => ({ value: option.value, label: option.name }))}
                placeholder="Select catalog"
              />
            </FormField>
          </>
        )}
        
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
          <div><strong>This application is only used for Sandbox testing purposes.</strong></div>
        </div>
      </Box>
    </Container>
  );
};

export default CredentialsForm;
