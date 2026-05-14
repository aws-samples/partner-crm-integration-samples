import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Header,
  SpaceBetween,
  Button,
  Box,
  Alert
} from "@cloudscape-design/components";

function LogoutSuccess() {
  const navigate = useNavigate();

  return (
    <Container
      header={
        <Header
          variant="h1"
          description="You have been successfully signed out"
        >
          Logged Out
        </Header>
      }
    >
      <SpaceBetween direction="vertical" size="l">
        <Alert type="info">
          <Box>
            <strong>You have been logged out.</strong>
          </Box>
          <Box>
            To log in again, click on Log In on the left.
          </Box>
        </Alert>

        <Container>
          <SpaceBetween direction="vertical" size="m">
            <Box>
              <Header variant="h3">Session Ended</Header>
            </Box>
            <Box>
              Your AWS credentials have been cleared from this session for security purposes.
            </Box>
            <Box>
              All stored authentication data has been removed from your browser.
            </Box>
          </SpaceBetween>
        </Container>

        <SpaceBetween direction="horizontal" size="xs">
          <Button 
            variant="primary" 
            onClick={() => navigate('/')}
          >
            Log In Again
          </Button>
        </SpaceBetween>
      </SpaceBetween>
    </Container>
  );
}

export default LogoutSuccess;