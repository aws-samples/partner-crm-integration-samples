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
import { hasCredentials, getOpportunityId } from '../utils/sessionStorage';
import { decodeHtmlEntities } from '../utils/commonUtils';
import Overview from './Overview';
import NextSteps from './NextSteps';
import TabsSection from './TabsSection';

function GetOpportunity() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [opportunityId, setOpportunityId] = useState('');
  const [opportunity, setOpportunity] = useState(null);
  const [awsOpportunity, setAwsOpportunity] = useState(null);

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

    try {
      // Import AWS SDK
      const { PartnerCentralSellingClient, GetOpportunityCommand } = await import("@aws-sdk/client-partnercentral-selling");
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
      
      // Prepare the payload
      const payload = {
        Catalog: "Sandbox",
        Identifier: opportunityId.trim()
      };
      
      console.log('GetOpportunity payload:', payload);
      
      // Create and send the command
      const command = new GetOpportunityCommand(payload);
      const response = await client.send(command);
      
      console.log('GetOpportunity response:', response);
      
      // Store opportunity ID in session storage
      const { saveOpportunityId } = await import('../utils/sessionStorage');
      saveOpportunityId(opportunityId.trim());
      
      // Try to fetch AWS opportunity summary for additional data
      try {
        const { getAwsOpportunitySummary } = await import('../services/api');
        const awsSummary = await getAwsOpportunitySummary(opportunityId.trim());
        setAwsOpportunity(awsSummary);
        
        // Merge the data with correct field mappings
        setOpportunity({
          ...response,
          Origin: awsSummary.Origin || 'Partner referral',
          EngagementScore: awsSummary.Insights?.EngagementScore || '-',
          NextBestActions: awsSummary.Insights?.NextBestActions || '-',
          InvolvementType: awsSummary.InvolvementType || '-',
          AwsProducts: awsSummary.RelatedEntityIds?.AwsProducts || [],
          Solutions: awsSummary.RelatedEntityIds?.Solutions || [],
          ExpectedCustomerSpend: awsSummary.Project?.ExpectedCustomerSpend || []
        });
      } catch (awsErr) {
        console.error('Error fetching AWS opportunity summary:', awsErr);
        // Still use the basic opportunity data
        setOpportunity({
          ...response,
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
            {decodeHtmlEntities(JSON.stringify(opportunity, null, 2))}
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
                Catalog: "Sandbox",
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