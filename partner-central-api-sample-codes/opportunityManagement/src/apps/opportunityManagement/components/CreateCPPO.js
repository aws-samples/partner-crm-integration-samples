import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasCredentials, getCredentials, saveChangeSetId } from '../../../utils/sessionStorage';
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
  Textarea
} from "@cloudscape-design/components";
import { MarketplaceCatalogClient, StartChangeSetCommand } from "@aws-sdk/client-marketplace-catalog";

function CreateCPPO() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [responseData, setResponseData] = useState(null);
  
  useEffect(() => {
    if (!hasCredentials()) {
      navigate('/');
      return;
    }
  }, [navigate]);

  // Calculate default dates (same logic as Create Private Offer)
  const getDefaultAvailabilityEndDate = () => {
    const today = new Date();
    const sevenDaysFromToday = new Date(today);
    sevenDaysFromToday.setDate(today.getDate() + 7);
    return sevenDaysFromToday.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const [formData, setFormData] = useState({
    productId: 'prod-uxaz6zgh52ooa',
    contractDuration: 'P24M',
    buyerId: '222222222222',
    resellerId: '333333333333',
    availabilityEndDate: getDefaultAvailabilityEndDate()
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generatePayload = () => {
    // Calculate charge dates from today (same logic as Create Private Offer)
    const today = new Date();
    
    // ChargeDate 1: 7 days from today
    const firstChargeDate = new Date(today);
    firstChargeDate.setDate(today.getDate() + 7);
    const firstChargeDateStr = firstChargeDate.toISOString().split('T')[0];
    
    // ChargeDate 2: 14 days from today
    const secondChargeDate = new Date(today);
    secondChargeDate.setDate(today.getDate() + 14);
    const secondChargeDateStr = secondChargeDate.toISOString().split('T')[0];

    return {
      "Catalog": "AWSMarketplace",
      "ChangeSet": [
        {
          "ChangeName": "MyCreateResaleAuthorizationChange",
          "ChangeType": "CreateResaleAuthorization",
          "Entity": {
            "Type": "ResaleAuthorization@1.0"
          },
          "DetailsDocument": {
            "ProductId": formData.productId,
            "ResellerAccountId": formData.resellerId,
            "Name": "DemoResaleAuthorization"
          }
        },
        {
          "ChangeType": "UpdateInformation",
          "Entity": {
            "Type": "ResaleAuthorization@1.0",
            "Identifier": "$MyCreateResaleAuthorizationChange.Entity.Identifier"
          },
          "DetailsDocument": {
            "Name": "DemoResaleAuthorization",
            "Description": "Demo Resale Authorization Description"
          }
        },
        {
          "ChangeType": "UpdateAvailability",
          "Entity": {
            "Type": "ResaleAuthorization@1.0",
            "Identifier": "$MyCreateResaleAuthorizationChange.Entity.Identifier"
          },
          "DetailsDocument": {
            "AvailabilityEndDate": formData.availabilityEndDate,
            "OffersMaxQuantity": 1
          }
        },
        {
          "ChangeType": "UpdateLegalTerms",
          "Entity": {
            "Type": "ResaleAuthorization@1.0",
            "Identifier": "$MyCreateResaleAuthorizationChange.Entity.Identifier"
          },
          "DetailsDocument": {
            "Terms": [
              {
                "Type": "BuyerLegalTerm",
                "Documents": [
                  {
                    "Type": "StandardEula"
                  }
                ]
              },
              {
                "Type": "ResaleLegalTerm",
                "Documents": [
                  {
                    "Type": "StandardResellerContract"
                  }
                ]
              }
            ]
          }
        },
        {
          "ChangeType": "UpdatePricingTerms",
          "Entity": {
            "Identifier": "$MyCreateResaleAuthorizationChange.Entity.Identifier",
            "Type": "ResaleAuthorization@1.0"
          },
          "DetailsDocument": {
            "PricingModel": "Contract",
            "Terms": [
              {
                "Type": "ResaleFixedUpfrontPricingTerm",
                "CurrencyCode": "USD",
                "Price": "0",
                "Duration": formData.contractDuration,
                "Grants": [
                  {
                    "DimensionKey": "dimension_1_id",
                    "MaxQuantity": 22000
                  },
                  {
                    "DimensionKey": "dimension_2_id",
                    "MaxQuantity": 22000
                  },
                  {
                    "DimensionKey": "dimension_3_id",
                    "MaxQuantity": 22000
                  }
                ]
              },
              {
                "Type": "ResaleUsageBasedPricingTerm",
                "CurrencyCode": "USD",
                "RateCards": [
                  {
                    "RateCard": [
                      {
                        "DimensionKey": "metered_1_id",
                        "Price": "0.001"
                      },
                      {
                        "DimensionKey": "metered_2_id",
                        "Price": "0.001"
                      },
                      {
                        "DimensionKey": "metered_3_id",
                        "Price": "0.001"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        },
        {
          "ChangeType": "UpdatePaymentScheduleTerms",
          "Entity": {
            "Identifier": "$MyCreateResaleAuthorizationChange.Entity.Identifier",
            "Type": "ResaleAuthorization@1.0"
          },
          "DetailsDocument": {
            "Terms": [
              {
                "Type": "ResalePaymentScheduleTerm",
                "CurrencyCode": "USD",
                "Schedule": [
                  {
                    "ChargeDate": firstChargeDateStr,
                    "ChargeAmount": "30.00"
                  },
                  {
                    "ChargeDate": secondChargeDateStr,
                    "ChargeAmount": "30.00"
                  }
                ]
              }
            ]
          }
        },
        {
          "ChangeType": "ReleaseResaleAuthorization",
          "DetailsDocument": {},
          "Entity": {
            "Identifier": "$MyCreateResaleAuthorizationChange.Entity.Identifier",
            "Type": "ResaleAuthorization@1.0"
          }
        }
      ]
    };
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const client = createMarketplaceCatalogClient();
      const payload = generatePayload();
      
      const command = new StartChangeSetCommand(payload);
      const response = await client.send(command);

      // Save the changeSetId to session storage
      if (response.ChangeSetId) {
        saveChangeSetId(response.ChangeSetId);
      }

      setSuccess('Channel Partner Private Offer (CPPO) created successfully!');
      setResponseData(response);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      header={
        <Header
          variant="h1"
          description="Create a Channel Partner Private Offer (CPPO) using AWS Marketplace Catalog API"
        >
          Create CPPO
        </Header>
      }
    >
      <SpaceBetween direction="vertical" size="l">
        {error && (
          <Alert type="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert type="success" dismissible onDismiss={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {responseData && (
          <Container
            header={
              <Header
                variant="h2"
                description="Response from StartChangeSet API"
              >
                API Response
              </Header>
            }
          >
            <SpaceBetween direction="vertical" size="m">
              <Box>
                <strong>Change Set ID:</strong> {responseData.ChangeSetId}
              </Box>
              
              <Box>
                <Header variant="h3">Complete Response JSON</Header>
                <Textarea
                  value={JSON.stringify(responseData, null, 2)}
                  rows={15}
                  readOnly
                />
              </Box>
            </SpaceBetween>
          </Container>
        )}

        <Container
          header={
            <Header
              variant="h2"
              description="Dates are automatically calculated based on today's date"
            >
              Date Calculation Logic
            </Header>
          }
        >
          <SpaceBetween direction="vertical" size="s">
            <Box>
              <strong>Availability End Date:</strong> Today + 7 days (default, can be modified)
            </Box>
            <Box>
              <strong>First Charge Date:</strong> Today + 7 days
            </Box>
            <Box>
              <strong>Second Charge Date:</strong> Today + 14 days
            </Box>
            <Box>
              <strong>Contract Duration:</strong> User-defined (used in ResaleFixedUpfrontPricingTerm)
            </Box>
          </SpaceBetween>
        </Container>

        <Form
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => navigate('/offers')}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSubmit}
                loading={loading}
                disabled={!formData.productId || !formData.buyerId || !formData.resellerId || !formData.availabilityEndDate}
              >
                Create CPPO
              </Button>
            </SpaceBetween>
          }
        >
          <SpaceBetween direction="vertical" size="l">
            <FormField
              label="Product ID"
              description="The AWS Marketplace product ID for this resale authorization"
            >
              <Input
                value={formData.productId}
                onChange={({ detail }) => handleInputChange('productId', detail.value)}
                placeholder="Enter product ID"
              />
            </FormField>

            <FormField
              label="Availability End Date"
              description="Date when the resale authorization becomes unavailable (defaults to 7 days from today)"
            >
              <Input
                value={formData.availabilityEndDate}
                onChange={({ detail }) => handleInputChange('availabilityEndDate', detail.value)}
                placeholder="YYYY-MM-DD"
                type="date"
              />
            </FormField>

            <FormField
              label="Contract Duration"
              description="Contract duration in ISO 8601 format (e.g., P24M for 24 months)"
            >
              <Input
                value={formData.contractDuration}
                onChange={({ detail }) => handleInputChange('contractDuration', detail.value)}
                placeholder="P24M"
              />
            </FormField>

            <FormField
              label="Buyer Account ID"
              description="AWS Account ID of the buyer"
            >
              <Input
                value={formData.buyerId}
                onChange={({ detail }) => handleInputChange('buyerId', detail.value)}
                placeholder="Enter buyer account ID"
              />
            </FormField>

            <FormField
              label="Reseller Account ID"
              description="AWS Account ID of the reseller/channel partner"
            >
              <Input
                value={formData.resellerId}
                onChange={({ detail }) => handleInputChange('resellerId', detail.value)}
                placeholder="Enter reseller account ID"
              />
            </FormField>

            <Box>
              <Header variant="h3">Generated JSON Payload Preview</Header>
              <Textarea
                value={JSON.stringify(generatePayload(), null, 2)}
                rows={25}
                readOnly
              />
            </Box>
          </SpaceBetween>
        </Form>
      </SpaceBetween>
    </Container>
  );
}

export default CreateCPPO;