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
  Box
} from '@cloudscape-design/components';
import { storeCredentials, hasCredentials, getCredentials } from '../utils/sessionStorage';

const CredentialsForm = () => {
  const navigate = useNavigate();
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [region, setRegion] = useState('us-east-1');
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
      storeCredentials(accessKey, secretKey, sessionToken, region);
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
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="*"
          style={{ display: 'none' }}
        />
      </Form>
      
      <Box margin={{ top: 's' }} color="text-status-info">
        <strong>Tip:</strong> To see hidden folders (e.g., .aws) when selecting files:
        <br />• Mac: Press Command + Shift + .
        <br />• Windows: Press Ctrl + Shift + .
      </Box>
    </Container>
  );
};

export default CredentialsForm;
