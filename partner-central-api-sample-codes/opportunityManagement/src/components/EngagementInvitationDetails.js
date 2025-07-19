import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Header,
  SpaceBetween,
  Box,
  Button,
  Alert,
  Spinner,
  ColumnLayout,
  FormField
} from "@cloudscape-design/components";
import { hasCredentials } from '../utils/sessionStorage';

function EngagementInvitationDetails({ invitationId: propInvitationId }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invitationId, setInvitationId] = useState(null);
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  console.log('EngagementInvitationDetails component rendered');
  console.log('Current URL:', window.location.href);
  console.log('URL param id:', id);
  
  useEffect(() => {
    console.log('useEffect running with id:', id);
    
    if (!id) {
      console.log('No ID in URL, setting error');
      setError('No engagement invitation ID provided');
      setLoading(false);
      return;
    }
    
    const decodedId = decodeURIComponent(id);
    console.log('Using decoded ID for API call:', decodedId);
    
    const fetchInvitationDetails = async () => {
      try {
        setLoading(true);
        
        // Import AWS SDK
        const { PartnerCentralSellingClient, GetEngagementInvitationCommand } = await import("@aws-sdk/client-partnercentral-selling");
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
          Identifier: decodedId
        };
        
        console.log('GetEngagementInvitation payload:', payload);
        
        // Create and send the command
        const command = new GetEngagementInvitationCommand(payload);
        const response = await client.send(command);
        
        console.log('GetEngagementInvitation response:', response);
        
        setInvitation(response);
        
      } catch (error) {
        console.error('Error fetching engagement invitation:', error);
        setError(`Error: ${error.message || 'Failed to fetch engagement invitation'}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvitationDetails();
  }, [id]);

  if (loading) {
    return (
      <Container>
        <Box textAlign="center" padding={{ top: 'l' }}>
          <Spinner size="large" />
          <div>Loading engagement invitation details...</div>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert type="error">{error}</Alert>
        <Box padding={{ top: 'l' }}>
          <Button onClick={() => navigate('/engagement-invitations')}>Back to Engagement Invitations</Button>
        </Box>
      </Container>
    );
  }

  if (!invitation) {
    return (
      <Container>
        <Alert type="warning">Engagement invitation not found</Alert>
        <Box padding={{ top: 'l' }}>
          <Button onClick={() => navigate('/engagement-invitations')}>Back to Engagement Invitations</Button>
        </Box>
      </Container>
    );
  }

  const customer = invitation.Payload?.OpportunityInvitation?.Customer || {};
  const project = invitation.Payload?.OpportunityInvitation?.Project || {};
  const senderContacts = invitation.Payload?.OpportunityInvitation?.SenderContacts || [];

  console.log('About to render engagement invitation details');
  console.log('Invitation data:', invitation);
  
  return (
    <Container>
      <SpaceBetween size="l">
        {/* Header Section */}
        <Header
          variant="h1"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={() => navigate('/engagement-invitations')}>Back to Engagement Invitations</Button>
              <Button variant="primary" onClick={() => navigate('/accept-engagement-invitation', { state: { invitationId } })}>Accept Invitation</Button>
              <Button onClick={() => navigate('/reject-engagement-invitation', { state: { invitationId } })}>Reject Invitation</Button>
            </SpaceBetween>
          }
        >
          {invitation.EngagementTitle || invitation.Id}
        </Header>

        {/* Overview Section */}
        <Container>
          <Header variant="h2">Overview</Header>
          <ColumnLayout columns={2} variant="text-grid">
            <div>
              <FormField label="Engagement ID">
                <Box>{invitation.EngagementId || '-'}</Box>
              </FormField>
              <FormField label="ARN">
                <Box>{invitation.Arn || '-'}</Box>
              </FormField>
              <FormField label="ID">
                <Box>{invitation.Id || '-'}</Box>
              </FormField>
              <FormField label="Engagement Title">
                <Box>{invitation.EngagementTitle || '-'}</Box>
              </FormField>
            </div>
            <div>
              <FormField label="Invitation Date">
                <Box>{invitation.InvitationDate ? new Date(invitation.InvitationDate).toLocaleString() : '-'}</Box>
              </FormField>
              <FormField label="Expiration Date">
                <Box>{invitation.ExpirationDate ? new Date(invitation.ExpirationDate).toLocaleString() : '-'}</Box>
              </FormField>
              <FormField label="Invitation Message">
                <Box>{invitation.InvitationMessage || '-'}</Box>
              </FormField>
              <FormField label="Status">
                <Box>{invitation.Status || '-'}</Box>
              </FormField>
            </div>
          </ColumnLayout>
        </Container>

        {/* Customer Section */}
        <Container>
          <Header variant="h2">Customer</Header>
          <ColumnLayout columns={2} variant="text-grid">
            <div>
              <FormField label="Company Name">
                <Box>{customer.CompanyName || '-'}</Box>
              </FormField>
              <FormField label="Country Code">
                <Box>{customer.CountryCode || '-'}</Box>
              </FormField>
            </div>
            <div>
              <FormField label="Industry">
                <Box>{customer.Industry || '-'}</Box>
              </FormField>
              <FormField label="Website URL">
                <Box>{customer.WebsiteUrl || '-'}</Box>
              </FormField>
            </div>
          </ColumnLayout>
        </Container>

        {/* Project Section */}
        <Container>
          <Header variant="h2">Project</Header>
          <ColumnLayout columns={2} variant="text-grid">
            <div>
              <FormField label="Title">
                <Box>{project.Title || '-'}</Box>
              </FormField>
              <FormField label="Business Problem">
                <Box>{project.BusinessProblem || '-'}</Box>
              </FormField>
            </div>
            <div>
              <FormField label="Expected Customer Spend">
                <Box>
                  {project.ExpectedCustomerSpend && project.ExpectedCustomerSpend.length > 0 
                    ? `${project.ExpectedCustomerSpend[0].Amount} ${project.ExpectedCustomerSpend[0].CurrencyCode} (${project.ExpectedCustomerSpend[0].Frequency})`
                    : '-'
                  }
                </Box>
              </FormField>
              <FormField label="Target Completion Date">
                <Box>{project.TargetCompletionDate ? new Date(project.TargetCompletionDate).toLocaleDateString() : '-'}</Box>
              </FormField>
            </div>
          </ColumnLayout>
        </Container>

        {/* Sender Contacts Section */}
        <Container>
          <Header variant="h2">Sender Contacts</Header>
          {senderContacts.length > 0 ? (
            <SpaceBetween size="m">
              {senderContacts.map((contact, index) => (
                <Container key={index}>
                  <Header variant="h3">Contact {index + 1}</Header>
                  <ColumnLayout columns={2} variant="text-grid">
                    <div>
                      <FormField label="First Name">
                        <Box>{contact.FirstName || '-'}</Box>
                      </FormField>
                      <FormField label="Last Name">
                        <Box>{contact.LastName || '-'}</Box>
                      </FormField>
                    </div>
                    <div>
                      <FormField label="Business Title">
                        <Box>{contact.BusinessTitle || '-'}</Box>
                      </FormField>
                      <FormField label="Email">
                        <Box>{contact.Email || '-'}</Box>
                      </FormField>
                      <FormField label="Phone">
                        <Box>{contact.Phone || '-'}</Box>
                      </FormField>
                    </div>
                  </ColumnLayout>
                </Container>
              ))}
            </SpaceBetween>
          ) : (
            <Box>No sender contacts available</Box>
          )}
        </Container>
      </SpaceBetween>
    </Container>
  );
}

export default EngagementInvitationDetails;