import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasCredentials, getCredentials } from '../../../utils/sessionStorage';
import {
  Container,
  Header,
  SpaceBetween,
  Button,
  Box,
  Table,
  Alert,
  Badge
} from "@cloudscape-design/components";
import { MarketplaceCatalogClient, ListEntitiesCommand } from "@aws-sdk/client-marketplace-catalog";

function ProductsList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!hasCredentials()) {
      navigate('/');
      return;
    }
    fetchProducts();
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

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const client = createMarketplaceCatalogClient();
      
      // Calculate a date range for LastModifiedDate filter (e.g., from 1 year ago to now)
      const now = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      
      // Format dates to 'YYYY-MM-DDThh:mm:ssZ' format (without milliseconds)
      const formatDateForAPI = (date) => {
        return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
      };
      
      const command = new ListEntitiesCommand({
        Catalog: "AWSMarketplace",
        EntityType: "SaaSProduct",
        EntityTypeFilters: {
          SaaSProductFilters: {
            LastModifiedDate: {
              DateRange: {
                AfterValue: formatDateForAPI(oneYearAgo),
                BeforeValue: formatDateForAPI(now)
              }
            }
          }
        }
      });

      const response = await client.send(command);
      
      // Sort the results client-side by LastModifiedDate (latest first)
      const sortedProducts = (response.EntitySummaryList || []).sort((a, b) => {
        const dateA = new Date(a.LastModifiedDate || 0);
        const dateB = new Date(b.LastModifiedDate || 0);
        return dateB - dateA; // Descending order (latest first)
      });
      
      setProducts(sortedProducts);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchProducts();
  };

  const columnDefinitions = [
    {
      id: "entityId",
      header: "Entity ID",
      cell: item => item.EntityId ? (
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            navigate(`/product/${item.EntityId}`);
          }}
          style={{ color: '#0073bb', textDecoration: 'underline' }}
        >
          {item.EntityId}
        </a>
      ) : 'N/A',
      sortingField: "EntityId"
    },
    {
      id: "entityType",
      header: "Type",
      cell: item => <Badge color="green">{item.EntityType}</Badge>
    },
    {
      id: "name",
      header: "Name",
      cell: item => {
        // Name is directly available in the Name field based on API response
        return item.Name || item.SaaSProductSummary?.ProductTitle || 'N/A';
      }
    },
    {
      id: "lastModified",
      header: "Last Modified",
      cell: item => item.LastModifiedDate ? new Date(item.LastModifiedDate).toLocaleString() : 'N/A'
    },
    {
      id: "visibility",
      header: "Visibility",
      cell: item => item.Visibility || item.SaaSProductSummary?.Visibility || 'N/A'
    },
    {
      id: "entityArn",
      header: "Entity ARN",
      cell: item => item.EntityArn ? (
        <Box fontSize="body-s" color="text-status-inactive">
          {item.EntityArn}
        </Box>
      ) : 'N/A'
    }
  ];

  return (
    <Container
      header={
        <Header
          variant="h1"
          description="View and manage your AWS Marketplace SaaS products"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={handleRefresh} loading={loading}>
                Refresh
              </Button>
            </SpaceBetween>
          }
        >
          SaaS Products
        </Header>
      }
    >
      <SpaceBetween direction="vertical" size="l">
        {error && (
          <Alert type="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Table
          columnDefinitions={columnDefinitions}
          items={products}
          loading={loading}
          loadingText="Loading SaaS products..."
          sortingDisabled={false}
          empty={
            <Box textAlign="center" color="inherit">
              <b>No SaaS products found</b>
              <Box
                padding={{ bottom: "s" }}
                variant="p"
                color="inherit"
              >
                No SaaS products found in your catalog. Products may need to be created or published first.
              </Box>
            </Box>
          }
          header={
            <Header
              counter={`(${products.length})`}
              description="SaaS products sorted by last modified date (latest first)"
            >
              SaaS Products
            </Header>
          }
        />
      </SpaceBetween>
    </Container>
  );
}

export default ProductsList;