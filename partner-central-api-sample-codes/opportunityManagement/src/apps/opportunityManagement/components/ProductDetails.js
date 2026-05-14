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

function ProductDetails() {
  const navigate = useNavigate();
  const { entityId } = useParams();
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!hasCredentials()) {
      navigate('/');
      return;
    }
    if (entityId) {
      fetchProductDetails();
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

  const fetchProductDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const client = createMarketplaceCatalogClient();
      const command = new DescribeEntityCommand({
        Catalog: "AWSMarketplace",
        EntityId: entityId
      });

      const response = await client.send(command);
      setProductData(response);
    } catch (err) {
      setError(err.message || 'Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchProductDetails();
  };

  // Function to remove Details and $metadata attributes from the response
  const getFilteredProductData = () => {
    if (!productData) return null;
    
    const filteredData = { ...productData };
    delete filteredData.Details;
    delete filteredData.$metadata;
    return filteredData;
  };

  return (
    <Container
      header={
        <Header
          variant="h1"
          description={`Complete JSON payload for product: ${entityId}`}
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={handleRefresh} loading={loading}>
                Refresh
              </Button>
              <Button onClick={() => navigate('/products')}>
                Back to Products
              </Button>
            </SpaceBetween>
          }
        >
          Product Details
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
            <Alert type="info">Loading product details...</Alert>
          </Box>
        )}

        {productData && (
          <Container
            header={
              <Header
                variant="h2"
                description="Complete product entity details from DescribeEntity API"
              >
                Product JSON Payload
              </Header>
            }
          >
            <SpaceBetween direction="vertical" size="m">
              <Box>
                <strong>Entity ID:</strong> {productData.EntityIdentifier}
              </Box>
              <Box>
                <strong>Entity Type:</strong> {productData.EntityType}
              </Box>
              <Box>
                <strong>Entity ARN:</strong> {productData.EntityArn || 'N/A'}
              </Box>
              <Box>
                <strong>Last Modified:</strong> {productData.LastModifiedDate ? new Date(productData.LastModifiedDate).toLocaleString() : 'N/A'}
              </Box>
              
              <Box>
                <Header variant="h3">JSON Response (Details and $metadata removed)</Header>
                <Textarea
                  value={JSON.stringify(getFilteredProductData(), null, 2)}
                  rows={30}
                  readOnly
                />
              </Box>
            </SpaceBetween>
          </Container>
        )}

        {!loading && !productData && !error && (
          <Box textAlign="center">
            <Alert type="warning">No product data available</Alert>
          </Box>
        )}
      </SpaceBetween>
    </Container>
  );
}

export default ProductDetails;