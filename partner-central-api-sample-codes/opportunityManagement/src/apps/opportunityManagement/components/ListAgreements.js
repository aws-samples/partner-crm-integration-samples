import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasCredentials } from '../../../utils/sessionStorage';
import {
  Container,
  Header,
  SpaceBetween,
  Button,
  Box,
  Alert,
  Table,
  FormField,
  Input,
  Badge
} from "@cloudscape-design/components";


function ListAgreements() {
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchStartTime, setSearchStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!hasCredentials()) {
      navigate('/');
      return;
    }
  }, [navigate]);

  // Timer for elapsed time during search
  useEffect(() => {
    let interval;
    if (loading && searchStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - searchStartTime) / 1000));
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [loading, searchStartTime]);

  const [formData, setFormData] = useState({
    acceptorAccountId: '222222222222',
    offerId: 'offer-hdclyvgpm3dnq'
  });

  const [serverStatus, setServerStatus] = useState('checking');

  // Check server status on component mount
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch('http://localhost:3001/health');
        if (response.ok) {
          setServerStatus('online');
        } else {
          setServerStatus('offline');
        }
      } catch (error) {
        setServerStatus('offline');
      }
    };

    checkServerStatus();
  }, []);

  const refreshServerStatus = async () => {
    setServerStatus('checking');
    try {
      const response = await fetch('http://localhost:3001/health');
      if (response.ok) {
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } catch (error) {
      setServerStatus('offline');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const searchAgreements = async () => {
    if (!formData.acceptorAccountId || !formData.offerId) {
      setError('Please enter both Acceptor Account ID and Offer ID');
      return;
    }

    setLoading(true);
    setError(null);
    setSearchStartTime(Date.now());

    try {

      // Use your custom API endpoint to bypass CORS restrictions
      const apiPayload = {
        "offer_ids": [formData.offerId],
        "acceptor_account_ids": [formData.acceptorAccountId]
      };


      // Add more detailed logging for debugging

      const response = await fetch('http://localhost:3001/search-agreements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(apiPayload)
      });


      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();

      // Handle the response from your API
      const agreementData = responseData.agreementViewSummaries || responseData.agreements || responseData || [];
      setAgreements(Array.isArray(agreementData) ? agreementData : []);

      if (!agreementData || agreementData.length === 0) {
        setError('No agreements found for the specified criteria.');
      } else {
      }
    } catch (err) {

      if (err.message === 'Failed to fetch') {
        setError(`Connection Error: Cannot connect to local server.

🚨 SOLUTION: Start the local Express server first!

Run this command in a separate terminal:
npm run server

Or start both server and React app together:
npm run dev

The local server should be running at http://localhost:3001

Once the server is running, try the search again.

Alternative: Test the external API with curl:
curl -X POST https://5zu65cuqg2.execute-api.us-east-1.amazonaws.com/Prod/search-agreements \\
  -H "Content-Type: application/json" \\
  -d '{"offer_ids": ["${formData.offerId}"], "acceptor_account_ids": ["${formData.acceptorAccountId}"]}'`);
      } else if (err.code === 'ValidationException') {
        setError(`Validation error: ${err.message}. Please check your offer ID and account ID format.`);
      } else if (err.code === 'AccessDeniedException') {
        setError('Access denied. Please ensure your AWS credentials have the necessary permissions for marketplace:SearchAgreements.');
      } else {
        setError(`Failed to search agreements: ${err.message || err.code || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const columnDefinitions = [
    {
      id: "agreementId",
      header: "Agreement ID",
      cell: item => item.agreementId || 'N/A',
      sortingField: "agreementId"
    },
    {
      id: "agreementType",
      header: "Agreement Type",
      cell: item => <Badge color="blue">{item.agreementType}</Badge>
    },
    {
      id: "status",
      header: "Status",
      cell: item => item.status ? (
        <Badge color={item.status === 'ACTIVE' ? 'green' : 'grey'}>
          {item.status}
        </Badge>
      ) : 'N/A'
    },
    {
      id: "startTime",
      header: "Start Time",
      cell: item => item.startTime ? new Date(item.startTime).toLocaleString() : 'N/A'
    },
    {
      id: "endTime",
      header: "End Time",
      cell: item => item.endTime ? new Date(item.endTime).toLocaleString() : 'N/A'
    },
    {
      id: "acceptorAccountId",
      header: "Acceptor Account ID",
      cell: item => item.acceptor?.accountId || item.acceptorAccountId || 'N/A'
    },
    {
      id: "proposerAccountId",
      header: "Proposer Account ID",
      cell: item => item.proposer?.accountId || item.proposerAccountId || 'N/A'
    },
    {
      id: "acceptanceTime",
      header: "Acceptance Time",
      cell: item => item.acceptanceTime ? new Date(item.acceptanceTime).toLocaleString() : 'N/A'
    },
    {
      id: "offerId",
      header: "Offer ID",
      cell: item => item.proposalSummary?.offerId || item.offerId || 'N/A'
    }
  ];

  return (
    <Container
      header={
        <Header
          variant="h1"
          description="Search and view AWS Marketplace agreements"
        >
          List Agreements
        </Header>
      }
    >
      <SpaceBetween direction="vertical" size="l">
        {/* Server Status Indicator */}
        {serverStatus === 'offline' && (
          <Alert type="warning" action={
            <Button onClick={refreshServerStatus} loading={serverStatus === 'checking'}>
              Refresh Status
            </Button>
          }>
            <Box>
              <strong>⚠️ Local Server Not Running</strong>
              <Box variant="p">
                The local Express server is not running. Start it with:
                <Box
                  padding="s"
                  backgroundColor="grey-100"
                  fontFamily="monospace"
                  fontSize="body-s"
                  style={{
                    border: '1px solid #d5dbdb',
                    borderRadius: '4px',
                    marginTop: '8px'
                  }}
                >
                  npm run server
                </Box>
                Or start both server and React app:
                <Box
                  padding="s"
                  backgroundColor="grey-100"
                  fontFamily="monospace"
                  fontSize="body-s"
                  style={{
                    border: '1px solid #d5dbdb',
                    borderRadius: '4px',
                    marginTop: '8px'
                  }}
                >
                  npm run dev
                </Box>
              </Box>
            </Box>
          </Alert>
        )}

        {serverStatus === 'online' && (
          <Alert type="success" action={
            <Button onClick={refreshServerStatus} loading={serverStatus === 'checking'}>
              Refresh Status
            </Button>
          }>
            <Box>
              <strong>✅ Local Server Online</strong>
              <Box variant="small">Server running at http://localhost:3001</Box>
            </Box>
          </Alert>
        )}

        {serverStatus === 'checking' && (
          <Alert type="info">
            <Box>
              <strong>🔍 Checking Server Status...</strong>
            </Box>
          </Alert>
        )}

        {error && (
          <Alert type="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading && (
          <Alert type="info">
            <Box>
              <strong>Searching agreements...</strong>
              <Box variant="small" color="text-body-secondary">
                Elapsed time: {elapsedTime} seconds
              </Box>
            </Box>
          </Alert>
        )}

        <Container
          header={
            <Header
              variant="h2"
              description="Enter search criteria to find agreements"
            >
              Search Parameters
            </Header>
          }
        >
          <SpaceBetween direction="vertical" size="m">
            <SpaceBetween direction="horizontal" size="l">
              <FormField
                label="Acceptor Account ID"
                description="AWS Account ID of the agreement acceptor"
              >
                <Input
                  value={formData.acceptorAccountId}
                  onChange={({ detail }) => handleInputChange('acceptorAccountId', detail.value)}
                  placeholder="Enter acceptor account ID"
                />
              </FormField>

              <FormField
                label="Offer ID"
                description="The offer ID to search agreements for"
              >
                <Input
                  value={formData.offerId}
                  onChange={({ detail }) => handleInputChange('offerId', detail.value)}
                  placeholder="Enter offer ID"
                />
              </FormField>
            </SpaceBetween>

            <Box>
              <Button
                variant="primary"
                onClick={searchAgreements}
                loading={loading}
                disabled={!formData.acceptorAccountId || !formData.offerId || serverStatus === 'offline'}
              >
                {serverStatus === 'offline' ? 'Server Offline - Cannot Search' : 'Search Agreements'}
              </Button>
            </Box>
          </SpaceBetween>
        </Container>

        <Table
          columnDefinitions={columnDefinitions}
          items={agreements}
          loading={loading}
          loadingText="Searching agreements..."
          sortingDisabled={false}
          empty={
            <Box textAlign="center" color="inherit">
              <b>No agreements found</b>
              <Box
                padding={{ bottom: "s" }}
                variant="p"
                color="inherit"
              >
                No agreements match the search criteria. Try different search parameters.
              </Box>
            </Box>
          }
          header={
            <Header
              counter={`(${agreements.length})`}
              description="Purchase agreements filtered by party type, agreement type, acceptor account, and offer"
            >
              Agreements
            </Header>
          }
        />

        <Container>
          <Box>
            <Header variant="h3">Search Filters Applied</Header>
            <SpaceBetween direction="vertical" size="s">
              <Box><strong>Party Type:</strong> Proposer</Box>
              <Box><strong>Agreement Type:</strong> PurchaseAgreement</Box>
              <Box><strong>Acceptor Account ID:</strong> {formData.acceptorAccountId}</Box>
              <Box><strong>Offer ID:</strong> {formData.offerId}</Box>
            </SpaceBetween>
          </Box>
        </Container>

        <Container>
          <Box>
            <Header variant="h3">API Testing</Header>
            <SpaceBetween direction="vertical" size="m">
              <Box>
                <p><strong>Your Custom API (CORS issue):</strong></p>
                <Box
                  padding="s"
                  backgroundColor="grey-100"
                  fontFamily="monospace"
                  fontSize="body-s"
                  style={{
                    border: '1px solid #d5dbdb',
                    borderRadius: '4px',
                    overflowX: 'auto',
                    whiteSpace: 'pre'
                  }}
                >
                  {`curl -X POST https://5zu65cuqg2.execute-api.us-east-1.amazonaws.com/Prod/search-agreements \\
  -H "Content-Type: application/json" \\
  -d '{"offer_ids": ["${formData.offerId}"], "acceptor_account_ids": ["${formData.acceptorAccountId}"]}'`}
                </Box>
              </Box>

              <Box>
                <p><strong>AWS CLI Alternative:</strong></p>
                <Box
                  padding="s"
                  backgroundColor="grey-100"
                  fontFamily="monospace"
                  fontSize="body-s"
                  style={{
                    border: '1px solid #d5dbdb',
                    borderRadius: '4px',
                    overflowX: 'auto',
                    whiteSpace: 'pre'
                  }}
                >
                  {`aws marketplace-agreement search-agreements \\
  --catalog AWSMarketplace \\
  --filters name=PartyType,values=Proposer \\
            name=AgreementType,values=PurchaseAgreement \\
            name=AcceptorAccountId,values=${formData.acceptorAccountId} \\
            name=OfferId,values=${formData.offerId} \\
  --region us-east-1`}
                </Box>
              </Box>
            </SpaceBetween>
          </Box>
        </Container>
      </SpaceBetween>
    </Container>
  );
}

export default ListAgreements;