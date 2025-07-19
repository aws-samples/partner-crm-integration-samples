import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Header,
  Table,
  Button,
  SpaceBetween,
  Box,
  Alert,
  Spinner
} from "@cloudscape-design/components";
import { hasCredentials } from '../utils/sessionStorage';

// Function to save engagement invitation ID to session storage
const saveEngagementInvitationId = (id) => {
  sessionStorage.setItem('engagementInvitationId', id);
};

function ListEngagementInvitations() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [detailedInvitations, setDetailedInvitations] = useState([]);


  useEffect(() => {
    // Check if credentials exist
    if (!hasCredentials()) {
      navigate('/');
      return;
    }

    const fetchInvitations = async () => {
      try {
        setLoading(true);
        
        // Import AWS SDK
        const { PartnerCentralSellingClient, ListEngagementInvitationsCommand } = await import("@aws-sdk/client-partnercentral-selling");
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
          MaxResults: 10,
          NextToken: null,
          ParticipantType: "RECEIVER",
          PayloadType: ["OpportunityInvitation"],
          Sort: {
            SortBy: "InvitationDate",
            SortOrder: "DESCENDING"
          }
        };
        
        console.log('ListEngagementInvitations payload:', payload);
        
        // Create and send the command
        const command = new ListEngagementInvitationsCommand(payload);
        const response = await client.send(command);
        
        console.log('ListEngagementInvitations response:', response);
        
        const invitationsList = response.EngagementInvitationSummaries || [];
        setInvitations(invitationsList);
        
        // Save the first invitation's ARN as engagementInvitationId
        if (invitationsList.length > 0) {
          saveEngagementInvitationId(invitationsList[0].Arn);
        }
        
        // Import GetEngagementInvitation command
        const { GetEngagementInvitationCommand } = await import("@aws-sdk/client-partnercentral-selling");
        
        // Fetch details for each invitation
        const detailedInvitationsPromises = invitationsList.map(async (invitation) => {
          try {
            const detailCommand = new GetEngagementInvitationCommand({
              Catalog: "Sandbox",
              Identifier: invitation.Id
            });
            
            const detailResponse = await client.send(detailCommand);
            const countryCode = detailResponse?.Payload?.OpportunityInvitation?.Customer?.CountryCode || '-';
            
            return {
              ...invitation,
              countryCode
            };
          } catch (error) {
            console.error(`Error fetching details for invitation ${invitation.Id}:`, error);
            return {
              ...invitation,
              countryCode: '-'
            };
          }
        });
        
        const detailedResults = await Promise.all(detailedInvitationsPromises);
        setDetailedInvitations(detailedResults);
        
      } catch (error) {
        console.error('Error fetching engagement invitations:', error);
        setError(`Error: ${error.message || 'Failed to fetch engagement invitations'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, [navigate]);

  // Table column definitions
  const columnDefinitions = [
    {
      id: "id",
      header: "Invitation ID",
      cell: item => (
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            saveEngagementInvitationId(item.Arn || item.Id);
            navigate(`/engagement-invitation/${item.Id}`);
          }}
        >
          {item.Id}
        </a>
      )
    },
    {
      id: "engagementTitle",
      header: "Engagement Title",
      cell: item => item.EngagementTitle || '-'
    },
    {
      id: "invitationDate",
      header: "Invitation Date",
      cell: item => {
        if (item.InvitationDate) {
          return new Date(item.InvitationDate).toLocaleDateString();
        }
        return '-';
      }
    },
    {
      id: "status",
      header: "Status",
      cell: item => item.Status || '-'
    },
    {
      id: "senderCompanyName",
      header: "Sender",
      cell: item => item.SenderCompanyName || '-'
    },
    {
      id: "expirationDate",
      header: "Expiration Date",
      cell: item => {
        if (item.ExpirationDate) {
          return new Date(item.ExpirationDate).toLocaleDateString();
        }
        return '-';
      }
    },
    {
      id: "countryCode",
      header: "Country Code",
      cell: item => item.countryCode || '-'
    }
  ];

  if (loading) {
    return (
      <Container>
        <Box textAlign="center" padding={{ top: 'l' }}>
          <Spinner size="large" />
          <div>Loading engagement invitations...</div>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert type="error">{error}</Alert>
        <Box padding={{ top: 'l' }}>
          <Button onClick={() => navigate('/opportunities')}>Back to Opportunities</Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <SpaceBetween size="l">
        <Header
          variant="h1"
          counter={`(${invitations.length})`}
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={() => window.location.reload()}>Refresh</Button>
            </SpaceBetween>
          }
        >
          Engagement Invitations
        </Header>



        <Table
          columnDefinitions={columnDefinitions}
          items={detailedInvitations.length > 0 ? detailedInvitations : invitations}

          loading={loading}
          loadingText="Loading invitations"
          empty={
            <Box textAlign="center" padding="l">
              <b>No engagement invitations</b>
              <Box padding={{ top: 's' }}>
                No engagement invitations found.
              </Box>
            </Box>
          }

        />

        {invitations.length === 0 && !loading && (
          <Alert type="info">
            No engagement invitations found. Create an AWS-originated opportunity to generate invitations.
          </Alert>
        )}
      </SpaceBetween>
    </Container>
  );
}

export default ListEngagementInvitations;