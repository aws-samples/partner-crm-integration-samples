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
  FormField,
  Input,
  Alert,
  Badge
} from "@cloudscape-design/components";
import { MarketplaceCatalogClient, ListEntitiesCommand } from "@aws-sdk/client-marketplace-catalog";

function OffersList() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [afterValue, setAfterValue] = useState('2023-10-01T00:00:00Z');
  
  useEffect(() => {
    if (!hasCredentials()) {
      navigate('/');
      return;
    }
    fetchOffers();
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

  const fetchOffers = async () => {
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
        EntityType: "Offer",
        EntityTypeFilters: {
          OfferFilters: {
            Targeting: {
              ValueList: ["BuyerAccounts"]
            },
            State: {
              ValueList: ["Released"]
            },
            AvailabilityEndDate: {
              DateRange: {
                AfterValue: afterValue
              }
            },
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
      const sortedOffers = (response.EntitySummaryList || []).sort((a, b) => {
        const dateA = new Date(a.LastModifiedDate || 0);
        const dateB = new Date(b.LastModifiedDate || 0);
        return dateB - dateA; // Descending order (latest first)
      });
      
      setOffers(sortedOffers);
    } catch (err) {
      setError(err.message || 'Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (value) => {
    setAfterValue(value);
  };

  const handleRefresh = () => {
    fetchOffers();
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
            navigate(`/offer/${item.EntityId}`);
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
      cell: item => <Badge color="blue">{item.EntityType}</Badge>
    },
    {
      id: "name",
      header: "Name",
      cell: item => {
        // Name is in OfferSummary.Name based on the API response
        return item.OfferSummary?.Name || item.Name || 'N/A';
      }
    },
    {
      id: "lastModified",
      header: "Last Modified",
      cell: item => item.LastModifiedDate ? new Date(item.LastModifiedDate).toLocaleString() : 'N/A'
    },
    {
      id: "state",
      header: "State",
      cell: item => item.OfferSummary?.State ? (
        <Badge color={item.OfferSummary.State === 'Released' ? 'green' : 'grey'}>
          {item.OfferSummary.State}
        </Badge>
      ) : 'N/A'
    },
    {
      id: "availabilityEndDate",
      header: "Availability End Date",
      cell: item => item.OfferSummary?.AvailabilityEndDate ? 
        new Date(item.OfferSummary.AvailabilityEndDate).toLocaleDateString() : 'N/A'
    },
    {
      id: "buyerAccounts",
      header: "Buyer Accounts",
      cell: item => item.OfferSummary?.BuyerAccounts?.length > 0 ? 
        `${item.OfferSummary.BuyerAccounts.length} account(s)` : 'N/A'
    }
  ];

  return (
    <Container
      header={
        <Header
          variant="h1"
          description="View and manage your AWS Marketplace private offers"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={handleRefresh} loading={loading}>
                Refresh
              </Button>
              <Button 
                variant="primary" 
                onClick={() => navigate('/create-private-offer')}
              >
                Create Private Offer
              </Button>
            </SpaceBetween>
          }
        >
          Private Offers
        </Header>
      }
    >
      <SpaceBetween direction="vertical" size="l">
        {error && (
          <Alert type="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Container
          header={
            <Header
              variant="h2"
              description="Filter offers by availability end date"
            >
              Filter Options
            </Header>
          }
        >
          <SpaceBetween direction="horizontal" size="l">
            <FormField
              label="Availability End Date (After)"
              description="Show offers available after this date"
            >
              <Input
                value={afterValue}
                onChange={({ detail }) => handleDateChange(detail.value)}
                placeholder="2023-10-01T00:00:00Z"
              />
            </FormField>
            <Box>
              <Button onClick={handleRefresh} loading={loading}>
                Apply Filter
              </Button>
            </Box>
          </SpaceBetween>
        </Container>

        <Table
          columnDefinitions={columnDefinitions}
          items={offers}
          loading={loading}
          loadingText="Loading private offers..."
          sortingDisabled={false}
          empty={
            <Box textAlign="center" color="inherit">
              <b>No private offers found</b>
              <Box
                padding={{ bottom: "s" }}
                variant="p"
                color="inherit"
              >
                No offers match the current filter criteria. Try adjusting the availability end date or create a new private offer.
              </Box>
              <Button onClick={() => navigate('/create-private-offer')}>
                Create Private Offer
              </Button>
            </Box>
          }
          header={
            <Header
              counter={`(${offers.length})`}
              description="Private offers filtered by targeting buyer accounts and released state"
            >
              Private Offers
            </Header>
          }
        />
      </SpaceBetween>
    </Container>
  );
}

export default OffersList;