import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  Container,
  Header,
  Form,
  FormField,
  Input,
  SpaceBetween,
  Button,
  Box,
  Alert,
  Table,
  Link
} from "@cloudscape-design/components";
import { hasCredentials, getEngagementInvitationId, saveOpportunityId, getCredentials } from '../utils/sessionStorage';

function AcceptEngagementInvitation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const [invitationId, setInvitationId] = useState('');
  const [clientToken] = useState(uuidv4());

  useEffect(() => {
    // Check if credentials exist
    if (!hasCredentials()) {
      navigate('/');
      return;
    }

    // Get invitation ID from various sources
    const sessionInvitationId = getEngagementInvitationId();
    const selectedInvitationId = location.state?.selectedInvitationId;
    
    // Priority: selected invitation > session invitation > empty
    if (selectedInvitationId) {
      setInvitationId(selectedInvitationId);
    } else if (sessionInvitationId) {
      setInvitationId(sessionInvitationId);
    }
  }, [navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!invitationId.trim()) {
      setError('Please enter an engagement invitation ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Import AWS SDK
      const { PartnerCentralSellingClient, StartEngagementByAcceptingInvitationTaskCommand } = await import("@aws-sdk/client-partnercentral-selling");
      const { getCredentials } = await import('../utils/sessionStorage');
      
      const credentials = getCredentials();
      
      const client = new PartnerCentralSellingClient({
        region: credentials.region || 'us-east-1',
        credentials: {
          accessKeyId: credentials.accessKey,
          secretAccessKey: credentials.secretKey,
          sessionToken: credentials.sessionToken
        }
      });
      
      // Prepare the payload
      const payload = {
        Catalog: credentials.catalog || "Sandbox",
        Identifier: invitationId.trim(),
        ClientToken: clientToken
      };
      
      console.log('StartEngagementByAcceptingInvitationTask payload:', payload);
      
      // Create and send the command
      const command = new StartEngagementByAcceptingInvitationTaskCommand(payload);
      const apiResponse = await client.send(command);
      
      console.log('StartEngagementByAcceptingInvitationTask response:', apiResponse);
      
      // Save the opportunity ID to session storage if available
      if (apiResponse && apiResponse.OpportunityId) {
        saveOpportunityId(apiResponse.OpportunityId);
      }
      
      setResponse(apiResponse);
    } catch (error) {
      console.error('Error accepting engagement invitation:', error);
      setError(`Error: ${error.message || 'Failed to accept engagement invitation'}`);
    } finally {
      setLoading(false);
    }
  };

  // Render response in tabular format
  const renderResponse = () => {
    if (!response) return null;
    
    // Convert the response object to an array of key-value pairs
    const responseItems = Object.entries(response).map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      rawValue: value
    }));
    
    return (
      <Container>
        <Header variant="h2">Accept Engagement Invitation Response</Header>
        <Table
          columnDefinitions={[
            {
              id: "key",
              header: "Field",
              cell: item => item.key
            },
            {
              id: "value",
              header: "Value",
              cell: item => {
                // If this is the OpportunityId field, make it a hyperlink
                if (item.key === 'OpportunityId' && item.rawValue) {
                  return (
                    <Link 
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/opportunity/${item.rawValue}`);
                      }}
                    >
                      {item.value}
                    </Link>
                  );
                }
                return item.value;
              }
            }
          ]}
          items={responseItems}
          variant="container"
          stickyHeader={true}
          stripedRows={true}
        />
      </Container>
    );
  };

  if (response) {
    return (
      <Container>
        <SpaceBetween size="l">
          <Alert type="success">Engagement invitation accepted successfully!</Alert>
          {renderResponse()}
          <SpaceBetween direction="horizontal" size="xs" alignItems="center">
            <Button onClick={() => navigate('/engagement-invitations')}>Back to Engagement Invitations</Button>
            <Button variant="primary" onClick={() => window.location.reload()}>Accept Another</Button>
          </SpaceBetween>
        </SpaceBetween>
      </Container>
    );
  }

  return (
    <Container>
      <SpaceBetween size="l">
        <Header variant="h1">Accept Engagement Invitation</Header>
        <Header variant="h2">StartEngagementByAcceptingInvitationTask</Header>
        
        {error && <Alert type="error">{error}</Alert>}
        
        <Container>
          <Header variant="h2">Invitation Details</Header>
          <Form>
            <FormField 
              label="Engagement Invitation ID"
              description="Enter the ID of the engagement invitation you want to accept"
            >
              <Input
                value={invitationId}
                onChange={({ detail }) => setInvitationId(detail.value)}
                placeholder="Enter engagement invitation ID (e.g., engi-0000001abc3de)"
              />
            </FormField>
          </Form>
        </Container>
        
        {/* JSON Payload Preview */}
        <Container>
          <Header variant="h2">JSON Payload Preview</Header>
          <Box variant="code">
            <pre style={{ 
              backgroundColor: '#f9f9f9', 
              padding: '15px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              overflowX: 'auto',
              maxHeight: '400px',
              fontSize: '12px'
            }}>
              {JSON.stringify({
                Catalog: getCredentials().catalog || "Sandbox",
                Identifier: invitationId.trim(),
                ClientToken: clientToken
              }, null, 2)}
            </pre>
          </Box>
        </Container>
        
        <SpaceBetween direction="horizontal" size="xs" alignItems="center">
          <Button variant="link" onClick={() => navigate('/engagement-invitations')}>Cancel</Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit} 
            loading={loading}
            disabled={!invitationId.trim()}
          >
            Accept Invitation
          </Button>
        </SpaceBetween>
      </SpaceBetween>
    </Container>
  );
}

export default AcceptEngagementInvitation;