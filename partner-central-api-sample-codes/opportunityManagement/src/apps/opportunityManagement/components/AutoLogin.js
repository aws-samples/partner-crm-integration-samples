import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Header,
  SpaceBetween,
  Box,
  Alert,
  Spinner,
  Button
} from "@cloudscape-design/components";
import { storeCredentials } from '../../../utils/sessionStorage';
import { CATALOG_OPTIONS } from '../../../config/config';

function AutoLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Auto-login using environment variables (secure approach)
    const autoLogin = async () => {
      try {
        // SECURITY CHECK: Never auto-login in production builds
        if (process.env.NODE_ENV === 'production') {
          throw new Error('Auto-login is disabled in production for security reasons. Please use manual login.');
        }
        
        setLoading(true);
        
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Read credentials from environment variables
        
        const awsAccessKey = process.env.REACT_APP_AWS_ACCESS_KEY_ID;
        const awsSecretKey = process.env.REACT_APP_AWS_SECRET_ACCESS_KEY;
        const awsSessionToken = process.env.REACT_APP_AWS_SESSION_TOKEN;
        const awsRegion = process.env.REACT_APP_AWS_REGION || 'us-east-1';
        
        
        // Validate credentials exist
        if (!awsAccessKey || !awsSecretKey) {
          throw new Error('Missing AWS credentials in environment variables. Please set REACT_APP_AWS_ACCESS_KEY_ID and REACT_APP_AWS_SECRET_ACCESS_KEY in .env.local file.');
        }
        
        
        // Test credentials with AWS STS to ensure they're valid
        const AWS = require('aws-sdk');
        AWS.config.update({
          accessKeyId: awsAccessKey,
          secretAccessKey: awsSecretKey,
          sessionToken: awsSessionToken,
          region: awsRegion
        });
        
        const sts = new AWS.STS();
        
        try {
          // Test credentials by calling GetCallerIdentity
          const identity = await sts.getCallerIdentity().promise();
        } catch (credError) {
          throw new Error(`Authentication failed: ${credError.message}. Please check your AWS credentials and ensure they are not expired.`);
        }
        
        
        // Store credentials using the same logic as CredentialsForm
        const additionalConfig = {
          endpointUrl: 'https://partnercentral-selling.us-east-1.api.aws',
          catalog: CATALOG_OPTIONS[1].value
        };
        
        storeCredentials(
          awsAccessKey,
          awsSecretKey,
          awsSessionToken,
          awsRegion,
          additionalConfig
        );
        
        
        // Navigate to login success page
        navigate('/login-success');
        
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    autoLogin();
  }, [navigate]);

  if (loading) {
    return (
      <Container
        header={
          <Header
            variant="h1"
            description="Automatically logging in with your AWS credentials"
          >
            Auto Login
          </Header>
        }
      >
        <SpaceBetween direction="vertical" size="l">
          <Box textAlign="center">
            <Spinner size="large" />
          </Box>
          <Box textAlign="center">
            <Alert type="info">
              <Box>
                <strong>Authenticating...</strong>
              </Box>
              <Box>
                Reading credentials from your .aws/credentials file and logging you in automatically.
              </Box>
            </Alert>
          </Box>
        </SpaceBetween>
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        header={
          <Header
            variant="h1"
            description="Auto-login encountered an issue"
          >
            Auto Login Failed
          </Header>
        }
      >
        <SpaceBetween direction="vertical" size="l">
          <Alert type="error">
            {error}
          </Alert>
          <Box>
            <strong>Auto-login requires environment variables setup:</strong>
          </Box>
          <Box>
            <strong>Option 1:</strong> Create <code>.env.local</code> file with your AWS credentials
          </Box>
          <Box>
            <strong>Option 2:</strong> Use manual login with "Credential Sync" button
          </Box>
          <Box>
            <strong>Option 3:</strong> Set <code>SkipLogin: false</code> in config.js
          </Box>
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="primary" onClick={() => navigate('/login')}>
              Use Manual Login
            </Button>
            <Button onClick={() => window.location.reload()}>
              Retry Auto-Login
            </Button>
          </SpaceBetween>
        </SpaceBetween>
      </Container>
    );
  }

  return null;
}

export default AutoLogin;