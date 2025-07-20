import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Spinner,
  ColumnLayout
} from "@cloudscape-design/components";
import { hasCredentials, getOpportunityId, getCredentials, saveOpportunityId } from '../utils/sessionStorage';
import { decodeHtmlEntities } from '../utils/commonUtils';
import { getAwsOpportunitySummary } from '../services/api';
import { cleanOpportunityData, enhanceWithAwsSummary } from '../utils/opportunityUtils';
import { PartnerCentralSellingClient, GetOpportunityCommand } from "@aws-sdk/client-partnercentral-selling";
import Overview from './Overview';
import NextSteps from './NextSteps';
import TabsSection from './TabsSection';

// Helper function to clean the response by removing __type attributes
const cleanResponse = (obj) => {
  if (!obj) return obj;
  
  if (typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => cleanResponse(item));
  }
  
  const result = {};
  for (const key in obj) {
    if (key !== '__type') {
      result[key] = cleanResponse(obj[key]);
    }
  }
  
  return result;
};

function GetOpportunity() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [opportunityId, setOpportunityId] = useState('');
  const [opportunity, setOpportunity] = useState(null);
  const [awsOpportunity, setAwsOpportunity] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);

  useEffect(() => {
    // Check if credentials exist
    if (!hasCredentials()) {
      navigate('/');
      return;
    }

    // Pre-populate with saved opportunity ID
    const savedOpportunityId = getOpportunityId();
    if (savedOpportunityId) {
      setOpportunityId(savedOpportunityId);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!opportunityId.trim()) {
      setError('Please enter an opportunity ID');
      return;
    }

    setLoading(true);
    setError(null);
    setOpportunity(null);
    setAwsOpportunity(null);
    setRawResponse(null);

    try {
      const credentials = getCredentials();
      
      const client = new PartnerCentralSellingClient({
        region: credentials.region || 'us-east-1',
        credentials: {
          accessKeyId: credentials.accessKey,
          secretAccessKey: credentials.secretKey,
          sessionToken: credentials.sessionToken
        }
      });
      
      // Prepare the payload
      const payload = {
        Catalog: credentials.catalog || "Sandbox",
        Identifier: opportunityId.trim()
      };
      
      console.log('GetOpportunity payload:', payload);
      
      // Create and send the command
      const command = new GetOpportunityCommand(payload);
      const response = await client.send(command);
      
      // Log the raw response for debugging
      console.log('GetOpportunity raw response:', response);
      
      // Specifically log the ExpectedCustomerSpend section
      if (response.Project?.ExpectedCustomerSpend) {
        console.log('Raw ExpectedCustomerSpend:', response.Project.ExpectedCustomerSpend);
        
        // Log each item in the ExpectedCustomerSpend array
        response.Project.ExpectedCustomerSpend.forEach((item, index) => {
          console.log(`ExpectedCustomerSpend item ${index}:`, item);
          console.log(`ExpectedCustomerSpend item ${index} keys:`, Object.keys(item));
          console.log(`ExpectedCustomerSpend item ${index} __type:`, item.__type);
          console.log(`ExpectedCustomerSpend item ${index} EstimationUrl:`, item.EstimationUrl);
        });
      }
      
      // Clean the opportunity data using the shared utility function
      const responseClone = cleanOpportunityData(response);
      
      // Log the cleaned response for debugging
      console.log('Cleaned response:', responseClone);
      
      // Log the ExpectedCustomerSpend section after cleaning
      if (responseClone.Project?.ExpectedCustomerSpend) {
        console.log('Cleaned ExpectedCustomerSpend:', responseClone.Project.ExpectedCustomerSpend);
      }
      
      // Create the rawResponse object from the cleaned response
      const newRawResponse = {
        Arn: responseClone.Arn,
        Catalog: responseClone.Catalog,
        CreatedDate: responseClone.CreatedDate,
        Customer: responseClone.Customer,
        Id: responseClone.Id,
        LastModifiedDate: responseClone.LastModifiedDate,
        LifeCycle: responseClone.LifeCycle,
        Marketing: responseClone.Marketing,
        NationalSecurity: responseClone.NationalSecurity,
        OpportunityTeam: responseClone.OpportunityTeam,
        OpportunityType: responseClone.OpportunityType,
        PartnerOpportunityIdentifier: responseClone.PartnerOpportunityIdentifier,
        PrimaryNeedsFromAws: responseClone.PrimaryNeedsFromAws,
        Project: responseClone.Project,
        RelatedEntityIdentifiers: responseClone.RelatedEntityIdentifiers,
        SoftwareRevenue: responseClone.SoftwareRevenue
      };
      
      // Log the final rawResponse object
      console.log('Final rawResponse object:', newRawResponse);
      
      // Specifically check if __type is still present in ExpectedCustomerSpend
      if (newRawResponse.Project?.ExpectedCustomerSpend) {
        console.log('Final ExpectedCustomerSpend in rawResponse:', newRawResponse.Project.ExpectedCustomerSpend);
        
        // Log each item in the ExpectedCustomerSpend array
        newRawResponse.Project.ExpectedCustomerSpend.forEach((item, index) => {
          console.log(`Final ExpectedCustomerSpend item ${index}:`, item);
          console.log(`Final ExpectedCustomerSpend item ${index} keys:`, Object.keys(item));
        });
      }
      
      setRawResponse(newRawResponse);
      
      // Store opportunity ID in session storage
      saveOpportunityId(opportunityId.trim());
      
      // Only call GetAwsOpportunitySummary for approved opportunities
      if (responseClone.LifeCycle?.ReviewStatus === 'Approved') {
        try {
          const awsSummary = await getAwsOpportunitySummary(opportunityId.trim());
          setAwsOpportunity(awsSummary);
          
          // Enhance the opportunity data with AWS summary
          setOpportunity(enhanceWithAwsSummary(responseClone, awsSummary));
        } catch (awsErr) {
          // If there's an error, just use the basic opportunity data
          console.log('Skipping AWS opportunity summary for approved opportunity due to error:', awsErr.message);
          setOpportunity({
            ...responseClone,
            Origin: 'Partner referral' // Default value
          });
        }
      } else {
        // For non-approved opportunities, just use the basic data
        setOpportunity({
          ...responseClone,
          Origin: 'Partner referral' // Default value
        });
      }
      
    } catch (error) {
      console.error('Error fetching opportunity:', error);
      setError(`Error: ${error.message || 'Failed to fetch opportunity'}`);
    } finally {
      setLoading(false);
    }
  };

  if (opportunity) {
    return (
      <Container>
        <SpaceBetween size="l">
          {/* Header Section */}
          <Header
            variant="h1" 
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => {
                  setOpportunity(null);
                  setAwsOpportunity(null);
                  setRawResponse(null);
                  setError(null);
                }}>Search Another</Button>
                <Button onClick={() => navigate('/opportunities')}>Back to Opportunities</Button>
                <Button variant="primary" onClick={() => navigate(`/edit-opportunity/${opportunity.Id}`)}>Edit Opportunity</Button>
              </SpaceBetween>
            }
          >
            {opportunity.Id || opportunityId}
          </Header>

          {/* Overview Section */}
          <Overview opportunity={opportunity} />
          
          {/* Next Steps Section */}
          <NextSteps opportunity={opportunity} />

          {/* Tabs Section */}
          <TabsSection opportunity={opportunity} awsOpportunity={awsOpportunity} />

          <Header variant="h2">Complete JSON Payload</Header>
          <pre style={{ 
            backgroundColor: '#f9f9f9', 
            padding: '15px', 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            overflowX: 'auto',
            maxHeight: '400px',
            fontSize: '12px'
          }}>
            {(() => {
              // Create a clean copy of the opportunity object for display
              const displayData = JSON.parse(JSON.stringify(rawResponse));
              
              // Remove $metadata if it exists
              if (displayData.$metadata) {
                delete displayData.$metadata;
              }
              
              // Ensure ExpectedCustomerSpend is properly formatted
              if (displayData.Project?.ExpectedCustomerSpend) {
                displayData.Project.ExpectedCustomerSpend = displayData.Project.ExpectedCustomerSpend.map(spend => ({
                  Amount: spend.Amount,
                  CurrencyCode: spend.CurrencyCode,
                  EstimationUrl: null,
                  Frequency: spend.Frequency,
                  TargetCompany: spend.TargetCompany
                }));
              }
              
              return decodeHtmlEntities(JSON.stringify(displayData, null, 4));
            })()}
          </pre>
        </SpaceBetween>
      </Container>
    );
  }

  return (
    <Container>
      <SpaceBetween size="l">
        <Header variant="h1">Get Opportunity</Header>
        <Header variant="h2">GetOpportunity</Header>
        
        {error && <Alert type="error">{error}</Alert>}
        
        <Container>
          <Header variant="h2">Opportunity Details</Header>
          <Form>
            <FormField 
              label="Opportunity ID"
              description="Enter the ID of the opportunity you want to retrieve"
            >
              <Input
                value={opportunityId}
                onChange={({ detail }) => setOpportunityId(detail.value)}
                placeholder="Enter opportunity ID (e.g., O7820301)"
              />
            </FormField>
          </Form>
        </Container>
        
        {/* JSON Payload Preview */}
        <Container>
          <Header variant="h2">JSON Payload Preview</Header>
          <Box variant="code">
            <pre style={{ 
              backgroundColor: '#f9f9f9', 
              padding: '15px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              overflowX: 'auto',
              maxHeight: '400px',
              fontSize: '12px'
            }}>
              {JSON.stringify({
                Catalog: getCredentials().catalog || "Sandbox",
                Identifier: opportunityId.trim()
              }, null, 2)}
            </pre>
          </Box>
        </Container>
        
        <SpaceBetween direction="horizontal" size="xs" alignItems="center">
          <Button variant="link" onClick={() => navigate('/opportunities')}>Cancel</Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit} 
            loading={loading}
            disabled={!opportunityId.trim()}
          >
            Get Opportunity
          </Button>
        </SpaceBetween>
      </SpaceBetween>
    </Container>
  );
}

export default GetOpportunity;