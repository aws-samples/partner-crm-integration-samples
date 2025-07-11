import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Spinner,
  ColumnLayout
} from "@cloudscape-design/components";
import { hasCredentials, getEngagementInvitationId } from '../utils/sessionStorage';

function GetEngagementInvitation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invitationId, setInvitationId] = useState('');
  const [showDetails, setShowDetails] = useState(false);

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

    setError(null);
    navigate(`/engagement-invitation/${encodeURIComponent(invitationId.trim())}`);
  };



  return (
    <Container>
      <SpaceBetween size="l">
        <Header variant="h1">Get Engagement Invitation</Header>
        <Header variant="h2">GetEngagementInvitation</Header>
        
        {error && <Alert type="error">{error}</Alert>}
        
        <Container>
          <Header variant="h2">Invitation Details</Header>
          <Form>
            <FormField 
              label="Engagement Invitation ID"
              description="Enter the ID of the engagement invitation you want to retrieve"
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
                Catalog: "Sandbox",
                Identifier: invitationId.trim()
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
            Get Engagement Invitation
          </Button>
        </SpaceBetween>
      </SpaceBetween>
    </Container>
  );
}

export default GetEngagementInvitation;