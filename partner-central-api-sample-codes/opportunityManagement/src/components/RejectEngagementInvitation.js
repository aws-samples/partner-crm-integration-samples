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
  Alert
} from "@cloudscape-design/components";
import { hasCredentials, getEngagementInvitationId } from '../utils/sessionStorage';

function RejectEngagementInvitation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [invitationArn, setInvitationArn] = useState('');
  const [rejectionReason, setRejectionReason] = useState('Solution is not clear');

  useEffect(() => {
    // Check if credentials exist
    if (!hasCredentials()) {
      navigate('/');
      return;
    }

    // Get invitation ARN from various sources
    const sessionInvitationId = getEngagementInvitationId();
    const selectedInvitationArn = location.state?.selectedInvitationArn;
    
    // Priority: selected invitation > session invitation > empty
    if (selectedInvitationArn) {
      setInvitationArn(selectedInvitationArn);
    } else if (sessionInvitationId) {
      setInvitationArn(sessionInvitationId);
    }
  }, [navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!invitationArn.trim()) {
      setError('Please enter an engagement invitation ARN');
      return;
    }

    if (!rejectionReason.trim()) {
      setError('Please enter a rejection reason');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Import AWS SDK
      const { PartnerCentralSellingClient, RejectEngagementInvitationCommand } = await import("@aws-sdk/client-partnercentral-selling");
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
        Catalog: "Sandbox",
        Identifier: invitationArn.trim(),
        RejectionReason: rejectionReason.trim()
      };
      
      console.log('RejectEngagementInvitation payload:', payload);
      
      // Create and send the command
      const command = new RejectEngagementInvitationCommand(payload);
      await client.send(command);
      
      console.log('RejectEngagementInvitation completed successfully');
      
      setSuccess(true);
    } catch (error) {
      console.error('Error rejecting engagement invitation:', error);
      setError(`Error: ${error.message || 'Failed to reject engagement invitation'}`);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container>
        <SpaceBetween size="l">
          <Alert type="success">
            Engagement Invitation {invitationArn} has been rejected.
          </Alert>
          
          <SpaceBetween direction="horizontal" size="xs" alignItems="center">
            <Button onClick={() => navigate('/engagement-invitations')}>Back to Engagement Invitations</Button>
            <Button variant="primary" onClick={() => window.location.reload()}>Reject Another</Button>
          </SpaceBetween>
        </SpaceBetween>
      </Container>
    );
  }

  return (
    <Container>
      <SpaceBetween size="l">
        <Header variant="h1">Reject Engagement Invitation</Header>
        <Header variant="h2">RejectEngagementInvitation</Header>
        
        {error && <Alert type="error">{error}</Alert>}
        
        <Container>
          <Header variant="h2">Rejection Details</Header>
          <Form>
            <FormField 
              label="Engagement Invitation ARN"
              description="Enter the ARN of the engagement invitation you want to reject"
            >
              <Input
                value={invitationArn}
                onChange={({ detail }) => setInvitationArn(detail.value)}
                placeholder="Enter engagement invitation ARN (e.g., arn:aws:partnercentral:us-east-1::catalog/AWS/engagement-invitation/engi-0000001abc3de)"
              />
            </FormField>
            
            <FormField 
              label="Rejection Reason"
              description="Enter the reason for rejecting this engagement invitation"
            >
              <Input
                value={rejectionReason}
                onChange={({ detail }) => setRejectionReason(detail.value)}
                placeholder="Enter rejection reason"
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
                Identifier: invitationArn.trim(),
                RejectionReason: rejectionReason.trim()
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
            disabled={!invitationArn.trim() || !rejectionReason.trim()}
          >
            Reject Invitation
          </Button>
        </SpaceBetween>
      </SpaceBetween>
    </Container>
  );
}

export default RejectEngagementInvitation;