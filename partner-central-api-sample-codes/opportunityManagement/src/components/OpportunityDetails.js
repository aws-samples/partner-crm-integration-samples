import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container,
  Header,
  SpaceBetween,
  Box,
  Button,
  Alert,
  Spinner
} from "@cloudscape-design/components";
import { getOpportunity, getAwsOpportunitySummary } from '../services/api';
import { cleanOpportunityData, enhanceWithAwsSummary } from '../utils/opportunityUtils';
import { hasCredentials } from '../utils/sessionStorage';
import { decodeHtmlEntities } from '../utils/commonUtils';
import Overview from './Overview';
import NextSteps from './NextSteps';
import TabsSection from './TabsSection';

function OpportunityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState(null);
  const [awsOpportunity, setAwsOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if credentials exist
    if (!hasCredentials()) {
      navigate('/');
      return;
    }

    
    // Fetch opportunity details
    const fetchOpportunityData = async () => {
      try {
        setLoading(true);
        
        // Fetch basic opportunity data
        const rawOpportunityData = await getOpportunity(id);
        
        // Clean the opportunity data
        const opportunityData = cleanOpportunityData(rawOpportunityData);
        
        // Only call getAwsOpportunitySummary for approved opportunities
        if (opportunityData.LifeCycle?.ReviewStatus === 'Approved') {
          try {
            const awsSummary = await getAwsOpportunitySummary(id);
            setAwsOpportunity(awsSummary);
            
            // Enhance the opportunity data with AWS summary
            setOpportunity(enhanceWithAwsSummary(opportunityData, awsSummary));
          } catch (awsErr) {
            console.log('Skipping AWS opportunity summary for approved opportunity due to error:', awsErr.message);
            // Still use the basic opportunity data
            setOpportunity({
              ...opportunityData,
              Origin: 'Partner referral' // Default value
            });
          }
        } else {
          // For non-approved opportunities, just use the basic data
          setOpportunity({
            ...opportunityData,
            Origin: 'Partner referral' // Default value
          });
        }
        
        setError('');
      } catch (err) {
        console.error('Error fetching opportunity:', err);
        setError('Failed to load opportunity: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOpportunityData();
  }, [id, navigate]);

  if (loading) {
    return (
      <Container>
        <Box textAlign="center" padding={{ top: 'l' }}>
          <Spinner size="large" />
          <div>Loading opportunity details...</div>
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

  if (!opportunity) {
    return (
      <Container>
        <Alert type="warning">Opportunity not found</Alert>
        <Box padding={{ top: 'l' }}>
          <Button onClick={() => navigate('/opportunities')}>Back to Opportunities</Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <SpaceBetween size="l">
        {/* Header Section */}
        <Header
          variant="h1" 
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={() => navigate('/opportunities')}>Back to Opportunities</Button>
              <Button onClick={() => navigate(`/edit-opportunity/${id}`)}>Edit opportunity</Button>
            </SpaceBetween>
          }
        >
          {opportunity.Id || id}
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
            const displayData = JSON.parse(JSON.stringify(opportunity));
            
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
            
            return decodeHtmlEntities(JSON.stringify(displayData, null, 2));
          })()}
        </pre>
      </SpaceBetween>
    </Container>

    
  );
}

export default OpportunityDetails;
