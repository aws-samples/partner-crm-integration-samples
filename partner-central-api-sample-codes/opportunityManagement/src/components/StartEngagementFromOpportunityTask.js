import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  Container,
  Header,
  Form,
  FormField,
  Input,
  Select,
  SpaceBetween,
  Button,
  Alert,
  Box
} from "@cloudscape-design/components";
import { hasCredentials, getOpportunityId } from '../utils/sessionStorage';

function StartEngagementFromOpportunityTask() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const [clientToken] = useState(uuidv4());
  
  const [formData, setFormData] = useState({
    Catalog: 'Sandbox',
    Identifier: '',
    InvolvementType: 'Co-Sell',
    Visibility: 'Full'
  });

  useEffect(() => {
    if (!hasCredentials()) {
      navigate('/');
      return;
    }

    const savedOpportunityId = getOpportunityId();
    if (savedOpportunityId) {
      setFormData(prev => ({ ...prev, Identifier: savedOpportunityId }));
    }
  }, [navigate]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { PartnerCentralSellingClient, StartEngagementFromOpportunityTaskCommand } = await import("@aws-sdk/client-partnercentral-selling");
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

      const payload = {
        Catalog: formData.Catalog,
        Identifier: formData.Identifier,
        ClientToken: clientToken,
        AwsSubmission: {
          InvolvementType: formData.InvolvementType,
          Visibility: formData.Visibility
        }
      };

      console.log('StartEngagementFromOpportunityTask payload:', payload);

      const command = new StartEngagementFromOpportunityTaskCommand(payload);
      const apiResponse = await client.send(command);

      console.log('StartEngagementFromOpportunityTask response:', apiResponse);
      setResponse(apiResponse);

    } catch (error) {
      console.error('Error starting engagement:', error);
      setError(`Error: ${error.message || 'Failed to start engagement'}`);
    } finally {
      setLoading(false);
    }
  };

  if (response) {
    return (
      <Container>
        <SpaceBetween size="l">
          <Alert type="success">Engagement started successfully!</Alert>
          
          <Container>
            <Header variant="h2">Opportunity Details</Header>
            <Box margin={{ top: 'l' }}>
              <Box variant="awsui-key-label">Opportunity ID</Box>
              <Box variant="samp">
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/opportunity/${formData.Identifier}`);
                  }}
                >
                  {formData.Identifier}
                </a>
              </Box>
            </Box>
          </Container>
          
          <Container>
            <Header variant="h2">StartEngagementFromOpportunityTask Response</Header>
            <pre style={{ 
              backgroundColor: '#f9f9f9', 
              padding: '15px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              overflowX: 'auto',
              maxHeight: '400px',
              fontSize: '12px'
            }}>
              {JSON.stringify(response, null, 2)}
            </pre>
          </Container>
          
          <SpaceBetween direction="horizontal" size="xs" alignItems="center">
            <Button onClick={() => navigate('/opportunities')}>Back to Opportunities</Button>
            <Button onClick={() => navigate(`/opportunity/${formData.Identifier}`)}>Return to Opportunity {formData.Identifier}</Button>
            <Button variant="primary" onClick={() => window.location.reload()}>Start Another</Button>
          </SpaceBetween>
        </SpaceBetween>
      </Container>
    );
  }

  return (
    <Container>
      <SpaceBetween size="l">
        <Header variant="h1">Start Engagement From Opportunity Task</Header>
        <Header variant="h2">StartEngagementFromOpportunityTask</Header>
        
        {error && <Alert type="error">{error}</Alert>}
        
        <Container>
          <Header variant="h2">Opportunity Details</Header>
          <Form>
            <SpaceBetween size="l">
              <FormField label="Catalog">
                <Input value={formData.Catalog} disabled />
              </FormField>
              
              <FormField label="Opportunity ID">
                <Input
                  value={formData.Identifier}
                  onChange={({ detail }) => handleChange('Identifier', detail.value)}
                  placeholder="Enter opportunity ID"
                />
              </FormField>
            </SpaceBetween>
          </Form>
        </Container>

        <Container>
          <Header variant="h2">AWS Submission Details</Header>
          <Form>
            <SpaceBetween size="l">
              <FormField label="Involvement Type">
                <Select
                  selectedOption={formData.InvolvementType ? { value: formData.InvolvementType, label: formData.InvolvementType } : null}
                  onChange={({ detail }) => handleChange('InvolvementType', detail.selectedOption?.value || '')}
                  options={[
                    { value: 'Co-Sell', label: 'Co-Sell' },
                    { value: 'For Visibility Only', label: 'For Visibility Only' }
                  ]}
                  placeholder="Select involvement type"
                />
              </FormField>
              
              <FormField label="Visibility">
                <Select
                  selectedOption={formData.Visibility ? { value: formData.Visibility, label: formData.Visibility } : null}
                  onChange={({ detail }) => handleChange('Visibility', detail.selectedOption?.value || '')}
                  options={[
                    { value: 'Full', label: 'Full' },
                    { value: 'Limited', label: 'Limited' }
                  ]}
                  placeholder="Select visibility"
                />
              </FormField>
            </SpaceBetween>
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
                Catalog: formData.Catalog,
                Identifier: formData.Identifier,
                ClientToken: clientToken,
                AwsSubmission: {
                  InvolvementType: formData.InvolvementType,
                  Visibility: formData.Visibility
                }
              }, null, 2)}
            </pre>
          </Box>
        </Container>
        
        <SpaceBetween direction="horizontal" size="xs" alignItems="center">
          <Button variant="link" onClick={() => navigate('/opportunities')}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {loading ? 'Starting...' : 'Start Engagement'}
          </Button>
        </SpaceBetween>
      </SpaceBetween>
    </Container>
  );
}

export default StartEngagementFromOpportunityTask;