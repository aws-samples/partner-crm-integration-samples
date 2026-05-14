import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasCredentials, getCredentials, getChangeSetId } from '../../../utils/sessionStorage';
import {
  Container,
  Header,
  SpaceBetween,
  Button,
  Box,
  Alert,
  Textarea,
  FormField,
  Input
} from "@cloudscape-design/components";
import { MarketplaceCatalogClient, DescribeChangeSetCommand } from "@aws-sdk/client-marketplace-catalog";

function DescribeChangeSet() {
  const navigate = useNavigate();
  const [changeSetId, setChangeSetId] = useState('');
  const [changeSetData, setChangeSetData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryMessage, setRetryMessage] = useState('');
  
  useEffect(() => {
    if (!hasCredentials()) {
      navigate('/');
      return;
    }
    
    // Pre-populate with session changeSetId if exists
    const sessionChangeSetId = getChangeSetId();
    if (sessionChangeSetId) {
      setChangeSetId(sessionChangeSetId);
    }
  }, [navigate]);

  const createMarketplaceCatalogClient = () => {
    const credentials = getCredentials();
    
    const clientConfig = {
      region: credentials.region || 'us-east-1',
      credentials: {
        accessKeyId: credentials.accessKey,
        secretAccessKey: credentials.secretKey,
        sessionToken: credentials.sessionToken
      }
    };
    
    return new MarketplaceCatalogClient(clientConfig);
  };

  const fetchChangeSetDetails = async (showRetryMessage = false) => {
    if (!changeSetId.trim()) {
      setError('Please enter a Change Set ID');
      return;
    }

    setLoading(true);
    setError(null);
    
    if (showRetryMessage) {
      setRetryMessage('Waiting 4 seconds to retry until SUCCEEDED...');
    }
    
    try {
      const client = createMarketplaceCatalogClient();
      const command = new DescribeChangeSetCommand({
        Catalog: "AWSMarketplace",
        ChangeSetId: changeSetId.trim()
      });

      const response = await client.send(command);
      setChangeSetData(response);
      setRetryMessage('');

      // Check if status is not SUCCEEDED and not FAILED
      if (response.Status && response.Status !== 'SUCCEEDED' && response.Status !== 'FAILED') {
        // Wait 4 seconds and retry only if not failed
        setTimeout(() => {
          fetchChangeSetDetails(true);
        }, 4000);
      } else if (response.Status === 'SUCCEEDED') {
        setRetryMessage('');
      } else if (response.Status === 'FAILED') {
        setRetryMessage('');
        setError('Change set has failed. No further retries will be attempted.');
      }
    } catch (err) {
      // If API call fails, stop retrying
      setError(err.message || 'Failed to fetch change set details');
      setRetryMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    fetchChangeSetDetails();
  };

  return (
    <Container
      header={
        <Header
          variant="h1"
          description="Describe change set details using AWS Marketplace Catalog API"
        >
          Describe Change Set
        </Header>
      }
    >
      <SpaceBetween direction="vertical" size="l">
        {error && (
          <Alert type="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {retryMessage && (
          <Alert type="info">
            {retryMessage}
          </Alert>
        )}

        <Container
          header={
            <Header
              variant="h2"
              description="Enter the Change Set ID to retrieve details"
            >
              Change Set Information
            </Header>
          }
        >
          <SpaceBetween direction="vertical" size="m">
            <FormField
              label="Change Set ID"
              description="The Change Set ID returned from StartChangeSet API"
            >
              <Input
                value={changeSetId}
                onChange={({ detail }) => setChangeSetId(detail.value)}
                placeholder="Enter Change Set ID"
              />
            </FormField>
            
            <Box>
              <Button 
                variant="primary" 
                onClick={handleSubmit}
                loading={loading}
                disabled={!changeSetId.trim()}
              >
                Describe Change Set
              </Button>
            </Box>
          </SpaceBetween>
        </Container>

        {changeSetData && (
          <Container
            header={
              <Header
                variant="h2"
                description="Change set details from DescribeChangeSet API"
              >
                Change Set Details
              </Header>
            }
          >
            <SpaceBetween direction="vertical" size="m">
              <Box>
                <strong>Change Set ID:</strong> {changeSetData.ChangeSetId}
              </Box>
              <Box>
                <strong>Status:</strong> {changeSetData.Status}
              </Box>
              {changeSetData.Status === 'SUCCEEDED' && (
                <Alert type="success">
                  Status is SUCCEEDED
                </Alert>
              )}
              <Box>
                <strong>Start Time:</strong> {changeSetData.StartTime ? new Date(changeSetData.StartTime).toLocaleString() : 'N/A'}
              </Box>
              <Box>
                <strong>End Time:</strong> {changeSetData.EndTime ? new Date(changeSetData.EndTime).toLocaleString() : 'N/A'}
              </Box>
              
              <Box>
                <Header variant="h3">Complete Change Set JSON</Header>
                <Textarea
                  value={JSON.stringify(changeSetData, null, 2)}
                  rows={25}
                  readOnly
                />
              </Box>
            </SpaceBetween>
          </Container>
        )}
      </SpaceBetween>
    </Container>
  );
}

export default DescribeChangeSet;