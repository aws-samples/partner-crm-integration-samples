import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Header,
  Form,
  FormField,
  Input,
  Select,
  SpaceBetween,
  Button,
  Box,
  Alert,
  Spinner,
  Table,
  Checkbox
} from "@cloudscape-design/components";
import { hasCredentials, getOpportunityId } from '../utils/sessionStorage';

function AssociateOpportunityMenu() {
  const navigate = useNavigate();
  
  // Get opportunity ID from session storage
  const [opportunityId, setOpportunityId] = useState(getOpportunityId() || '');
  const catalog = 'Sandbox';
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const [awsProducts, setAwsProducts] = useState([]);
  const [submissionSuccessful, setSubmissionSuccessful] = useState(false);
  const [associatePayload, setAssociatePayload] = useState(null);

  const [formData, setFormData] = useState({
    selectedEntityType: '',
    selectedSolution: '',
    selectedAwsProduct: '',
    marketplacePrivateOffer: ''
  });
  
  // Fetch solutions and AWS products on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Import AWS SDK
        const { PartnerCentralSellingClient, ListSolutionsCommand } = await import("@aws-sdk/client-partnercentral-selling");
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
        
        // Fetch solutions using AWS SDK
        const solutionsPayload = {
        MaxResults: 3,
        Catalog: catalog,
        Sort: {
            SortBy: "CreatedDate",
            SortOrder: "DESCENDING"
        },
        Status: ["Active"]
        };

        const command = new ListSolutionsCommand(solutionsPayload);
        const solutionsResponse = await client.send(command);

        console.log('List solutions response:', solutionsResponse);

        // Format solutions for select component - use SolutionSummaries instead of Solutions
        const formattedSolutions = (solutionsResponse.SolutionSummaries || []).map(solution => ({
        value: solution.Id,
        label: solution.Name
        }));

        setSolutions(formattedSolutions);

        
       // Fetch AWS products from GitHub raw file
        const awsProductsResponse = await fetch('https://raw.githubusercontent.com/aws-samples/partner-crm-integration-samples/main/resources/aws_products.json');

        if (!awsProductsResponse.ok) {
        throw new Error(`HTTP error! status: ${awsProductsResponse.status}`);
        }

        const awsProductsData = await awsProductsResponse.json();

        // Format AWS products for select component using the correct field names
        const formattedAwsProducts = awsProductsData.map(product => ({
        value: product.Identifier,
        label: product.Name
        }));

        setAwsProducts(formattedAwsProducts);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError(`Error: ${error.message || 'Failed to fetch data'}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [catalog]);

  // Update payloads whenever form data changes
  useEffect(() => {
    // Import v4 from uuid
    const generatePayloads = async () => {
        const { v4: uuidv4 } = await import('uuid');
        
        // Generate associate payload based on selected entity type
        let entityIdentifier = '';
        let entityType = '';
        
        if (formData.selectedEntityType === 'Solutions' && formData.selectedSolution) {
            entityIdentifier = formData.selectedSolution;
            entityType = 'Solutions';
        } else if (formData.selectedEntityType === 'AwsProducts' && formData.selectedAwsProduct) {
            entityIdentifier = formData.selectedAwsProduct;
            entityType = 'AwsProducts';
        } else if (formData.selectedEntityType === 'AwsMarketplace' && formData.marketplacePrivateOffer) {
            entityIdentifier = formData.marketplacePrivateOffer;
            entityType = 'AwsMarketplace';
        }
        
        if (entityIdentifier && entityType) {
            const newAssociatePayload = {
                Catalog: catalog,
                OpportunityIdentifier: opportunityId,
                RelatedEntityIdentifier: entityIdentifier,
                RelatedEntityType: entityType
            };
            setAssociatePayload(newAssociatePayload);
        } else {
            setAssociatePayload(null);
        }
    };
    
    generatePayloads();
  }, [formData, catalog, opportunityId]);

  
  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        // Import AWS SDK
        const { 
        PartnerCentralSellingClient, 
        AssociateOpportunityCommand
        } = await import("@aws-sdk/client-partnercentral-selling");
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
        
        // Step 1: Associate the selected entity to the opportunity
        let entityIdentifier = '';
        let entityType = '';
        
        if (formData.selectedEntityType === 'Solutions' && formData.selectedSolution) {
            entityIdentifier = formData.selectedSolution;
            entityType = 'Solutions';
        } else if (formData.selectedEntityType === 'AwsProducts' && formData.selectedAwsProduct) {
            entityIdentifier = formData.selectedAwsProduct;
            entityType = 'AwsProducts';
        } else if (formData.selectedEntityType === 'AwsMarketplace' && formData.marketplacePrivateOffer) {
            entityIdentifier = formData.marketplacePrivateOffer;
            entityType = 'AwsMarketplace';
        }
        
        if (entityIdentifier && entityType) {
            const associatePayload = {
                Catalog: catalog,
                OpportunityIdentifier: opportunityId,
                RelatedEntityIdentifier: entityIdentifier,
                RelatedEntityType: entityType
            };
            
            setAssociatePayload(associatePayload);
            
            console.log('Associate entity payload:', associatePayload);
            
            const associateCommand = new AssociateOpportunityCommand(associatePayload);
            const associateResponse = await client.send(associateCommand);
            
            console.log('Associate entity response:', associateResponse);
            setSubmissionSuccessful(true);
        }
    } catch (error) {
        console.error('Error processing opportunity:', error);
        setError(`Error: ${error.message || 'Failed to process opportunity'}`);
        setSubmissionSuccessful(false);
    } finally {
        setLoading(false);
    }
  };


  
  // Render the associate payload in a tabular format
  const renderAssociatePayload = () => {
    if (!associatePayload) return null;

    return (
        <Container>
        <Header variant="h2">Associate Opportunity Payload</Header>
        <pre style={{ 
            backgroundColor: '#f9f9f9', 
            padding: '15px', 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            overflowX: 'auto'
        }}>
            {JSON.stringify(associatePayload, null, 2)}
        </pre>
        </Container>
    );
  };



  useEffect(() => {
    if (!hasCredentials()) {
      navigate('/');
      return;
    }
  }, [navigate]);

  if (loading) {
    return (
      <Container>
        <Box textAlign="center" padding={{ top: 'l' }}>
          <Spinner size="large" />
          <div>Loading...</div>
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
  
  if (submissionSuccessful) {
    return (
        <Container>
        <SpaceBetween size="l">
            <Alert type="success">Opportunity processed successfully!</Alert>
            
            <Container>
            <Header variant="h2">Opportunity Details</Header>
            <Box margin={{ top: 'l' }}>
              <Box variant="awsui-key-label">Opportunity ID</Box>
              <Box variant="samp">
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/opportunity/${opportunityId}`);
                  }}
                >
                  {opportunityId}
                </a>
              </Box>
            </Box>
            </Container>
            
            {renderAssociatePayload()}
            <Box padding={{ top: 'l' }}>
            <Button onClick={() => navigate('/opportunities')}>Back to Opportunities</Button>
            </Box>
        </SpaceBetween>
        </Container>
    );
  }

  return (
    <Container>
      <SpaceBetween size="l">
        <Header variant="h1">Associate Opportunity</Header>
        
        <Container>
          <Header variant="h2">Opportunity Details</Header>
          <Box margin={{ top: 'l' }}>
          <Form>
            <FormField label="Opportunity ID">
              <Input 
                value={opportunityId} 
                onChange={({ detail }) => setOpportunityId(detail.value)}
                placeholder="Enter opportunity ID"
              />
            </FormField>
            
            <FormField label="Catalog">
              <Input value={catalog} disabled />
            </FormField>
          </Form>
          </Box>
        </Container>
        
        <Container>
          <Header variant="h2">Associate Opportunity with Solutions, AWS Products and AWS Marketplace Private Offer</Header>
          <Box margin={{ top: 'l' }}>
            <Form>
              <SpaceBetween size="l">
                <FormField>
                <SpaceBetween size="m">
                  <Checkbox
                    checked={formData.selectedEntityType === 'Solutions'}
                    onChange={({ detail }) => {
                      if (detail.checked) {
                        handleChange('selectedEntityType', 'Solutions');
                      } else {
                        handleChange('selectedEntityType', '');
                      }
                    }}
                  >
                    Solutions offered
                  </Checkbox>
                  {formData.selectedEntityType === 'Solutions' && (
                    <Select
                      selectedOption={
                        formData.selectedSolution 
                          ? solutions.find(s => s.value === formData.selectedSolution) 
                          : null
                      }
                      onChange={({ detail }) => 
                        handleChange('selectedSolution', detail.selectedOption ? detail.selectedOption.value : '')
                      }
                      options={solutions}
                      placeholder="Choose a solution"
                    />
                  )}
                </SpaceBetween>
              </FormField>
              
              <FormField>
                <SpaceBetween size="m">
                  <Checkbox
                    checked={formData.selectedEntityType === 'AwsProducts'}
                    onChange={({ detail }) => {
                      if (detail.checked) {
                        handleChange('selectedEntityType', 'AwsProducts');
                      } else {
                        handleChange('selectedEntityType', '');
                      }
                    }}
                  >
                    AWS products
                  </Checkbox>
                  {formData.selectedEntityType === 'AwsProducts' && (
                    <Select
                      selectedOption={
                        formData.selectedAwsProduct 
                          ? awsProducts.find(p => p.value === formData.selectedAwsProduct) 
                          : null
                      }
                      onChange={({ detail }) => 
                        handleChange('selectedAwsProduct', detail.selectedOption ? detail.selectedOption.value : '')
                      }
                      options={awsProducts}
                      placeholder="Choose an AWS product"
                    />
                  )}
                </SpaceBetween>
              </FormField>
              
              <FormField>
                <SpaceBetween size="m">
                  <Checkbox
                    checked={formData.selectedEntityType === 'AwsMarketplace'}
                    onChange={({ detail }) => {
                      if (detail.checked) {
                        handleChange('selectedEntityType', 'AwsMarketplace');
                      } else {
                        handleChange('selectedEntityType', '');
                      }
                    }}
                  >
                    AWS Marketplace Private offer
                  </Checkbox>
                  {formData.selectedEntityType === 'AwsMarketplace' && (
                    <Input
                      value={formData.marketplacePrivateOffer}
                      onChange={({ detail }) => handleChange('marketplacePrivateOffer', detail.value)}
                      placeholder="Enter AWS Marketplace Private offer ARN"
                    />
                  )}
                </SpaceBetween>
              </FormField>
            </SpaceBetween>
          </Form>
        </Box>
      </Container>

        {/* Display payload */}
        {renderAssociatePayload()}
        
        <SpaceBetween direction="horizontal" size="xs" alignItems="center">
          <Button variant="link" onClick={() => navigate('/opportunities')}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>{loading ? 'Processing...' : 'Associate Opportunity'}</Button>
        </SpaceBetween>
      </SpaceBetween>
    </Container>
  );
}

export default AssociateOpportunityMenu;