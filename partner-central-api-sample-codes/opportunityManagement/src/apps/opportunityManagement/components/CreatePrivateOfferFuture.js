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

function CreatePrivateOfferFuture() {
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

  // Calculate default dates based on today's date
  const getDefaultAvailabilityEndDate = () => {
    const today = new Date();
    const sevenDaysFromToday = new Date(today);
    sevenDaysFromToday.setDate(today.getDate() + 7);
    return sevenDaysFromToday.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const calculateDatesFromToday = () => {
    const today = new Date();
    
    // AGREEMENT_START_DATE: 8 days from today
    const agreementStartDate = new Date(today);
    agreementStartDate.setDate(today.getDate() + 8);
    
    // AGREEMENT_END_DATE: 38 days from today
    const agreementEndDate = new Date(today);
    agreementEndDate.setDate(today.getDate() + 38);
    
    return {
      agreementStartDate: agreementStartDate.toISOString().split('T')[0],
      agreementEndDate: agreementEndDate.toISOString().split('T')[0]
    };
  };

  const [formData, setFormData] = useState({
    productId: 'prod-uxaz6zgh52ooa',
    buyerId: '222222222222',
    availabilityEndDate: getDefaultAvailabilityEndDate()
  });

  // Calculate agreement dates from today (fixed dates)
  const { agreementStartDate, agreementEndDate } = calculateDatesFromToday();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generatePayload = () => {
    // Calculate charge dates from today
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
          "ChangeName": "MyCreateOfferChange",
          "ChangeType": "CreateOffer",
          "Entity": {
            "Type": "Offer@1.0"
          },
          "DetailsDocument": {
            "ProductId": formData.productId
          }
        },
        {
          "ChangeType": "UpdateInformation",
          "Entity": {
            "Type": "Offer@1.0",
            "Identifier": "$MyCreateOfferChange.Entity.Identifier"
          },
          "DetailsDocument": {
            "Name": "Demo Private Offer with Future Service Date",
            "Description": "Demo Private Offer with Future Service Date Description"
          }
        },
        {
          "ChangeType": "UpdateTargeting",
          "Entity": {
            "Type": "Offer@1.0",
            "Identifier": "$MyCreateOfferChange.Entity.Identifier"
          },
          "DetailsDocument": {
            "PositiveTargeting": {
              "BuyerAccounts": [formData.buyerId]
            }
          }
        },
        {
          "ChangeType": "UpdateAvailability",
          "Entity": {
            "Type": "Offer@1.0",
            "Identifier": "$MyCreateOfferChange.Entity.Identifier"
          },
          "DetailsDocument": {
            "AvailabilityEndDate": formData.availabilityEndDate
          }
        },
        {
          "ChangeType": "UpdateLegalTerms",
          "Entity": {
            "Identifier": "$MyCreateOfferChange.Entity.Identifier",
            "Type": "Offer@1.0"
          },
          "DetailsDocument": {
            "Terms": [
              {
                "Type": "LegalTerm",
                "Documents": [
                  {
                    "Type": "StandardEula",
                    "Version": "2022-07-14"
                  }
                ]
              }
            ]
          }
        },
        {
          "ChangeType": "UpdatePricingTerms",
          "Entity": {
            "Type": "Offer@1.0",
            "Identifier": "$MyCreateOfferChange.Entity.Identifier"
          },
          "DetailsDocument": {
            "PricingModel": "Contract",
            "Terms": [
              {
                "Type": "FixedUpfrontPricingTerm",
                "CurrencyCode": "USD",
                "Price": "0",
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
                "Type": "UsageBasedPricingTerm",
                "CurrencyCode": "USD",
                "RateCards": [
                  {
                    "RateCard": [
                      {
                        "DimensionKey": "metered_1_id",
                        "Price": "0"
                      },
                      {
                        "DimensionKey": "metered_2_id",
                        "Price": "0"
                      },
                      {
                        "DimensionKey": "metered_3_id",
                        "Price": "0"
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
            "Identifier": "$MyCreateOfferChange.Entity.Identifier",
            "Type": "Offer@1.0"
          },
          "DetailsDocument": {
            "Terms": [
              {
                "Type": "PaymentScheduleTerm",
                "CurrencyCode": "USD",
                "Schedule": [
                  {
                    "ChargeDate": firstChargeDateStr,
                    "ChargeAmount": "0"
                  },
                  {
                    "ChargeDate": secondChargeDateStr,
                    "ChargeAmount": "0"
                  }
                ]
              }
            ]
          }
        },
        {
          "ChangeType": "UpdateValidityTerms",
          "Entity": {
            "Type": "Offer@1.0",
            "Identifier": "$MyCreateOfferChange.Entity.Identifier"
          },
          "DetailsDocument": {
            "Terms": [
              {
                "Type": "ValidityTerm",
                "AgreementStartDate": agreementStartDate,
                "AgreementEndDate": agreementEndDate
              }
            ]
          }
        },
        {
          "ChangeType": "ReleaseOffer",
          "DetailsDocument": {},
          "Entity": {
            "Type": "Offer@1.0",
            "Identifier": "$MyCreateOfferChange.Entity.Identifier"
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

      setSuccess('Private offer with future service date created successfully!');
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
          description="Create a private offer with future service date using AWS Marketplace Catalog API"
        >
          Create Private Offer with Future Service Date
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
              description="All dates are automatically calculated based on the Availability End Date"
            >
              Date Calculation Logic
            </Header>
          }
        >
          <SpaceBetween direction="vertical" size="s">
            <Box>
              <strong>Availability End Date:</strong> Today + 7 days
            </Box>
            <Box>
              <strong>Agreement Start Date:</strong> Today + 8 days
            </Box>
            <Box>
              <strong>Agreement End Date:</strong> Today + 38 days
            </Box>
            <Box>
              <strong>First Charge Date:</strong> Today + 7 days
            </Box>
            <Box>
              <strong>Second Charge Date:</strong> Today + 14 days
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
                disabled={!formData.productId || !formData.availabilityEndDate || !formData.buyerId}
              >
                Create Offer
              </Button>
            </SpaceBetween>
          }
        >
          <SpaceBetween direction="vertical" size="l">
            <FormField
              label="Product ID"
              description="The AWS Marketplace product ID for this offer"
            >
              <Input
                value={formData.productId}
                onChange={({ detail }) => handleInputChange('productId', detail.value)}
                placeholder="Enter product ID"
              />
            </FormField>

            <FormField
              label="Availability End Date"
              description="Date when the offer becomes unavailable (defaults to one month from today)"
            >
              <Input
                value={formData.availabilityEndDate}
                onChange={({ detail }) => handleInputChange('availabilityEndDate', detail.value)}
                placeholder="YYYY-MM-DD"
                type="date"
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
              label="Agreement Start Date"
              description="Calculated as 8 days from today"
            >
              <Input
                value={agreementStartDate}
                readOnly
                placeholder="Auto-calculated"
              />
            </FormField>

            <FormField
              label="Agreement End Date"
              description="Calculated as 38 days from today"
            >
              <Input
                value={agreementEndDate}
                readOnly
                placeholder="Auto-calculated"
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

export default CreatePrivateOfferFuture;