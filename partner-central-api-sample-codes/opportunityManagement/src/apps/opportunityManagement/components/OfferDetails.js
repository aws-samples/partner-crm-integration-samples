import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { hasCredentials, getCredentials } from '../../../utils/sessionStorage';
import {
  Container,
  Header,
  SpaceBetween,
  Button,
  Box,
  Alert,
  Textarea
} from "@cloudscape-design/components";
import { MarketplaceCatalogClient, DescribeEntityCommand } from "@aws-sdk/client-marketplace-catalog";

function OfferDetails() {
  const navigate = useNavigate();
  const { entityId } = useParams();
  const [offerData, setOfferData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!hasCredentials()) {
      navigate('/');
      return;
    }
    if (entityId) {
      fetchOfferDetails();
    }
  }, [navigate, entityId]);

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

  const fetchOfferDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const client = createMarketplaceCatalogClient();
      const command = new DescribeEntityCommand({
        Catalog: "AWSMarketplace",
        EntityId: entityId
      });

      const response = await client.send(command);
      setOfferData(response);
    } catch (err) {
      setError(err.message || 'Failed to fetch offer details');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchOfferDetails();
  };

  // Function to remove Details and $metadata attributes from the response
  const getFilteredOfferData = () => {
    if (!offerData) return null;
    
    const filteredData = { ...offerData };
    delete filteredData.Details;
    delete filteredData.$metadata;
    return filteredData;
  };

  return (
    <Container
      header={
        <Header
          variant="h1"
          description={`Complete JSON payload for offer: ${entityId}`}
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={handleRefresh} loading={loading}>
                Refresh
              </Button>
              <Button onClick={() => navigate('/offers')}>
                Back to Offers
              </Button>
            </SpaceBetween>
          }
        >
          Offer Details
        </Header>
      }
    >
      <SpaceBetween direction="vertical" size="l">
        {error && (
          <Alert type="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box textAlign="center">
            <Alert type="info">Loading offer details...</Alert>
          </Box>
        )}

        {offerData && (
          <Container
            header={
              <Header
                variant="h2"
                description="Complete offer entity details from DescribeEntity API"
              >
                Offer JSON Payload
              </Header>
            }
          >
            <SpaceBetween direction="vertical" size="m">
              <Box>
                <strong>Entity ID:</strong> {offerData.EntityIdentifier}
              </Box>
              <Box>
                <strong>Entity Type:</strong> {offerData.EntityType}
              </Box>
              <Box>
                <strong>Entity ARN:</strong> {offerData.EntityArn || 'N/A'}
              </Box>
              <Box>
                <strong>Last Modified:</strong> {offerData.LastModifiedDate ? new Date(offerData.LastModifiedDate).toLocaleString() : 'N/A'}
              </Box>
              
              <Box>
                <Header variant="h3">JSON Response (Details and $metadata removed)</Header>
                <Textarea
                  value={JSON.stringify(getFilteredOfferData(), null, 2)}
                  rows={30}
                  readOnly
                />
              </Box>
            </SpaceBetween>
          </Container>
        )}

        {!loading && !offerData && !error && (
          <Box textAlign="center">
            <Alert type="warning">No offer data available</Alert>
          </Box>
        )}
      </SpaceBetween>
    </Container>
  );
}

export default OfferDetails;