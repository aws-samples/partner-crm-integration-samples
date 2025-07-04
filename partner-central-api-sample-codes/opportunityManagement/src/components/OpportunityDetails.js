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
        const opportunityData = await getOpportunity(id);
        
        // Try to fetch AWS opportunity summary for additional data
        try {
          const awsSummary = await getAwsOpportunitySummary(id);
          setAwsOpportunity(awsSummary);
          
          // Merge the data with correct field mappings
          setOpportunity({
            ...opportunityData,
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
          {decodeHtmlEntities(JSON.stringify(opportunity, null, 2))}
        </pre>
      </SpaceBetween>
    </Container>

    
  );
}

export default OpportunityDetails;
