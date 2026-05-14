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

function PublishSaaSProduct() {
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

  // Generate a random 4-digit number for product title
  const generateRandomProductTitle = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
    return `Sample Product ${randomNum}`;
  };

  const [formData, setFormData] = useState({
    productTitle: generateRandomProductTitle(),
    shortDescription: 'Brief description',
    longDescription: 'Detailed description',
    buyerId: '222222222222',
    buyerId2: '222222222222',
    fulfillmentUrl: 'https://sample.amazonaws.com/sample-saas-fulfillment-url',
    logoUrl: 'https://awsmp-logos.s3.amazonaws.com/ca60b754fe05a24257176cdbf31c4e0d'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generatePayload = () => {
    return {
      "Catalog": "AWSMarketplace",
      "ChangeSet": [
        {
          "ChangeType": "CreateProduct",
          "Entity": {
            "Type": "SaaSProduct@1.0"
          },
          "ChangeName": "CreateProductChange",
          "DetailsDocument": {}
        },
        {
          "ChangeType": "UpdateInformation",
          "Entity": {
            "Type": "SaaSProduct@1.0",
            "Identifier": "$CreateProductChange.Entity.Identifier"
          },
          "DetailsDocument": {
            "ProductTitle": formData.productTitle,
            "ShortDescription": formData.shortDescription,
            "LongDescription": formData.longDescription,
            "SupportDescription": "Support details goes here.",
            "Highlights": ["Sample highlight"],
            "SearchKeywords": ["Sample keyword"],
            "Categories": ["Data Catalogs"],
            "LogoUrl": formData.logoUrl,
            "AdditionalResources": []
          }
        },
        {
          "ChangeType": "UpdateTargeting",
          "Entity": {
            "Type": "SaaSProduct@1.0",
            "Identifier": "$CreateProductChange.Entity.Identifier"
          },
          "DetailsDocument": {
            "PositiveTargeting": {
              "BuyerAccounts": [formData.buyerId, formData.buyerId2]
            }
          }
        },
        {
          "ChangeType": "AddDeliveryOptions",
          "Entity": {
            "Type": "SaaSProduct@1.0",
            "Identifier": "$CreateProductChange.Entity.Identifier"
          },
          "DetailsDocument": {
            "DeliveryOptions": [
              {
                "Details": {
                  "SaaSUrlDeliveryOptionDetails": {
                    "FulfillmentUrl": formData.fulfillmentUrl
                  }
                }
              }
            ]
          }
        },
        {
          "ChangeType": "AddDimensions",
          "Entity": {
            "Type": "SaaSProduct@1.0",
            "Identifier": "$CreateProductChange.Entity.Identifier"
          },
          "DetailsDocument": [
            {
              "Name": "Dimension 1",
              "Description": "Dimension 1 description goes here",
              "Key": "dimension_1_id",
              "Unit": "Units",
              "Types": ["Entitled"]
            },
            {
              "Name": "Dimension 2",
              "Description": "Dimension 2 description goes here",
              "Key": "dimension_2_id",
              "Unit": "Units",
              "Types": ["Entitled"]
            },
            {
              "Name": "Dimension 3",
              "Description": "Dimension 3 description goes here",
              "Key": "dimension_3_id",
              "Unit": "Units",
              "Types": ["Entitled"]
            },
            {
              "Name": "metered 1",
              "Description": "Metered dimension 1 desc goes here",
              "Key": "metered_1_id",
              "Unit": "Units",
              "Types": ["ExternallyMetered"]
            },
            {
              "Name": "metered 2",
              "Description": "Metered dimension 2 desc goes here",
              "Key": "metered_2_id",
              "Unit": "Units",
              "Types": ["ExternallyMetered"]
            },
            {
              "Name": "metered 3",
              "Description": "Metered dimension 3 desc goes here",
              "Key": "metered_3_id",
              "Unit": "Units",
              "Types": ["ExternallyMetered"]
            }
          ]
        },
        {
          "ChangeType": "ReleaseProduct",
          "Entity": {
            "Type": "SaaSProduct@1.0",
            "Identifier": "$CreateProductChange.Entity.Identifier"
          },
          "DetailsDocument": {}
        },
        {
          "ChangeType": "CreateOffer",
          "Entity": {
            "Type": "Offer@1.0"
          },
          "ChangeName": "CreateOfferChange",
          "DetailsDocument": {
            "ProductId": "$CreateProductChange.Entity.Identifier"
          }
        },
        {
          "ChangeType": "UpdateInformation",
          "Entity": {
            "Type": "Offer@1.0",
            "Identifier": "$CreateOfferChange.Entity.Identifier"
          },
          "DetailsDocument": {
            "Name": "Test public offer for SaaSProduct using AWS Marketplace API Reference Code",
            "Description": "Test public offer with contract pricing for SaaSProduct using AWS Marketplace API Reference Code"
          }
        },
        {
          "ChangeType": "UpdatePricingTerms",
          "Entity": {
            "Type": "Offer@1.0",
            "Identifier": "$CreateOfferChange.Entity.Identifier"
          },
          "DetailsDocument": {
            "PricingModel": "Contract",
            "Terms": [
              {
                "Type": "ConfigurableUpfrontPricingTerm",
                "CurrencyCode": "USD",
                "RateCards": [
                  {
                    "Selector": {
                      "Type": "Duration",
                      "Value": "P1M"
                    },
                    "RateCard": [
                      {
                        "DimensionKey": "dimension_1_id",
                        "Price": "20"
                      },
                      {
                        "DimensionKey": "dimension_2_id",
                        "Price": "25"
                      }
                    ],
                    "Constraints": {
                      "MultipleDimensionSelection": "Allowed",
                      "QuantityConfiguration": "Allowed"
                    }
                  },
                  {
                    "Selector": {
                      "Type": "Duration",
                      "Value": "P12M"
                    },
                    "RateCard": [
                      {
                        "DimensionKey": "dimension_1_id",
                        "Price": "150"
                      },
                      {
                        "DimensionKey": "dimension_2_id",
                        "Price": "300"
                      }
                    ],
                    "Constraints": {
                      "MultipleDimensionSelection": "Allowed",
                      "QuantityConfiguration": "Allowed"
                    }
                  }
                ]
              }
            ]
          }
        },
        {
          "ChangeType": "UpdateRenewalTerms",
          "Entity": {
            "Type": "Offer@1.0",
            "Identifier": "$CreateOfferChange.Entity.Identifier"
          },
          "DetailsDocument": {
            "Terms": [
              {
                "Type": "RenewalTerm"
              }
            ]
          }
        },
        {
          "ChangeType": "UpdateLegalTerms",
          "Entity": {
            "Type": "Offer@1.0",
            "Identifier": "$CreateOfferChange.Entity.Identifier"
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
          "ChangeType": "UpdateSupportTerms",
          "Entity": {
            "Type": "Offer@1.0",
            "Identifier": "$CreateOfferChange.Entity.Identifier"
          },
          "DetailsDocument": {
            "Terms": [
              {
                "Type": "SupportTerm",
                "RefundPolicy": "Absolutely no refund, period."
              }
            ]
          }
        },
        {
          "ChangeType": "ReleaseOffer",
          "Entity": {
            "Type": "Offer@1.0",
            "Identifier": "$CreateOfferChange.Entity.Identifier"
          },
          "DetailsDocument": {}
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

      setSuccess('SaaS Product with Contract pricing published successfully!');
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
          description="Publish a SaaS product with Contract With Consumption pricing model using AWS Marketplace Catalog API"
        >
          Publish SaaS Product
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
              description="This will create a SaaS product and public offer with contract pricing"
            >
              Product & Offer Information
            </Header>
          }
        >
          <SpaceBetween direction="vertical" size="s">
            <Box>
              <strong>Product Creation:</strong> Creates a new SaaS product with basic information and dimensions
            </Box>
            <Box>
              <strong>Offer Creation:</strong> Creates a public offer with ConfigurableUpfrontPricingTerm
            </Box>
            <Box>
              <strong>Pricing Model:</strong> Contract with 1-month ($20/$25) and 12-month ($150/$300) options
            </Box>
            <Box>
              <strong>Dimensions:</strong> BasicService and PremiumService with entitled pricing
            </Box>
          </SpaceBetween>
        </Container>

        <Form
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => navigate('/products')}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={loading}
                disabled={!formData.productTitle || !formData.buyerId || !formData.fulfillmentUrl}
              >
                Publish SaaS Product
              </Button>
            </SpaceBetween>
          }
        >
          <SpaceBetween direction="vertical" size="l">
            <FormField
              label="Product Title"
              description="The title of your SaaS product"
            >
              <Input
                value={formData.productTitle}
                onChange={({ detail }) => handleInputChange('productTitle', detail.value)}
                placeholder="Enter product title"
              />
            </FormField>

            <FormField
              label="Short Description"
              description="Brief description of your product"
            >
              <Input
                value={formData.shortDescription}
                onChange={({ detail }) => handleInputChange('shortDescription', detail.value)}
                placeholder="Enter short description"
              />
            </FormField>

            <FormField
              label="Long Description"
              description="Detailed description of your product"
            >
              <Textarea
                value={formData.longDescription}
                onChange={({ detail }) => handleInputChange('longDescription', detail.value)}
                placeholder="Enter detailed description"
                rows={3}
              />
            </FormField>

            <FormField
              label="Fulfillment URL"
              description="SaaS fulfillment URL for your product"
            >
              <Input
                value={formData.fulfillmentUrl}
                onChange={({ detail }) => handleInputChange('fulfillmentUrl', detail.value)}
                placeholder="https://your-saas-app.com/fulfillment"
              />
            </FormField>

            <FormField
              label="Logo URL"
              description="URL to your product logo"
            >
              <Input
                value={formData.logoUrl}
                onChange={({ detail }) => handleInputChange('logoUrl', detail.value)}
                placeholder="https://s3.amazonaws.com/logos/your-logo.png"
              />
            </FormField>

            <FormField
              label="Buyer Account ID 1"
              description="First AWS Account ID for targeting"
            >
              <Input
                value={formData.buyerId}
                onChange={({ detail }) => handleInputChange('buyerId', detail.value)}
                placeholder="Enter buyer account ID"
              />
            </FormField>

            <FormField
              label="Buyer Account ID 2"
              description="Second AWS Account ID for targeting"
            >
              <Input
                value={formData.buyerId2}
                onChange={({ detail }) => handleInputChange('buyerId2', detail.value)}
                placeholder="Enter second buyer account ID"
              />
            </FormField>

            <Box>
              <Header variant="h3">Generated JSON Payload Preview</Header>
              <Textarea
                value={JSON.stringify(generatePayload(), null, 2)}
                rows={30}
                readOnly
              />
            </Box>
          </SpaceBetween>
        </Form>
      </SpaceBetween>
    </Container>
  );
}

export default PublishSaaSProduct;