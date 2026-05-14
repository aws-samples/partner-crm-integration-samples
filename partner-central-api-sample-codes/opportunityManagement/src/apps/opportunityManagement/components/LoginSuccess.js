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

function LoginSuccess() {
  const navigate = useNavigate();

  return (
    <Container
      header={
        <Header
          variant="h1"
          description="You have successfully authenticated with AWS Marketplace"
        >
          Login Successful
        </Header>
      }
    >
      <SpaceBetween direction="vertical" size="l">
        <Alert type="success">
          <Box>
            <strong>Authentication Complete!</strong>
          </Box>
          <Box>
            Your AWS credentials have been validated with AWS and you can now access all AWS Marketplace features.
          </Box>
        </Alert>

        <Container>
          <SpaceBetween direction="vertical" size="m">
            <Box>
              <Header variant="h3">What's Next?</Header>
            </Box>
            <Box>
              Choose from the available sections in the navigation menu:
            </Box>
            <SpaceBetween direction="vertical" size="s">
              <Box>
                <strong>Products:</strong> View and manage your SaaS products, or publish new ones
              </Box>
              <Box>
                <strong>Offers:</strong> Create private offers, manage existing offers, and track change sets
              </Box>
              <Box>
                <strong>Opportunities:</strong> Manage partner opportunities and AWS collaborations
              </Box>
              <Box>
                <strong>Engagements:</strong> Handle engagement invitations and partnerships
              </Box>
            </SpaceBetween>
          </SpaceBetween>
        </Container>

        <SpaceBetween direction="horizontal" size="xs">
          <Button
            variant="primary"
            onClick={() => navigate('/products')}
          >
            Go to Products
          </Button>
          <Button
            onClick={() => navigate('/offers')}
          >
            Go to Offers
          </Button>
          <Button
            onClick={() => navigate('/opportunities')}
          >
            Go to Opportunities
          </Button>
        </SpaceBetween>
      </SpaceBetween>
    </Container>
  );
}

export default LoginSuccess;