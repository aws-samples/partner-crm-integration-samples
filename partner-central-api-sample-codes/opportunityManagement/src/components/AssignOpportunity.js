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
  Alert,
  Box
} from "@cloudscape-design/components";
import { hasCredentials, getOpportunityId } from '../utils/sessionStorage';

function AssignOpportunity() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  
  const [formData, setFormData] = useState({
    Catalog: 'Sandbox',
    Identifier: '',
    BusinessTitle: '',
    Email: '',
    FirstName: '',
    LastName: '',

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
      const { PartnerCentralSellingClient, AssignOpportunityCommand } = await import("@aws-sdk/client-partnercentral-selling");
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
        Assignee: {
          BusinessTitle: formData.BusinessTitle,
          Email: formData.Email,
          FirstName: formData.FirstName,
          LastName: formData.LastName,

        }
      };

      console.log('AssignOpportunity payload:', payload);

      const command = new AssignOpportunityCommand(payload);
      const apiResponse = await client.send(command);

      console.log('AssignOpportunity response:', apiResponse);
      setResponse(apiResponse);

    } catch (error) {
      console.error('Error assigning opportunity:', error);
      setError(`Error: ${error.message || 'Failed to assign opportunity'}`);
    } finally {
      setLoading(false);
    }
  };

  if (response) {
    return (
      <Container>
        <SpaceBetween size="l">
          <Alert type="success">Opportunity assigned successfully!</Alert>
          
          <Container>
            <Header variant="h2">AssignOpportunity Response</Header>
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
            <Button variant="primary" onClick={() => window.location.reload()}>Assign Another</Button>
          </SpaceBetween>
        </SpaceBetween>
      </Container>
    );
  }

  return (
    <Container>
      <SpaceBetween size="l">
        <Header variant="h1">Assign Opportunity</Header>
        
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
          <Header variant="h2">Assignee Details</Header>
          <Form>
            <SpaceBetween size="l">
              <FormField label="Business Title">
                <Select
                  selectedOption={formData.BusinessTitle ? { value: formData.BusinessTitle, label: formData.BusinessTitle } : null}
                  onChange={({ detail }) => handleChange('BusinessTitle', detail.selectedOption?.value || '')}
                  options={[
                    { value: 'PartnerAccountManager', label: 'PartnerAccountManager' },
                    { value: 'OpportunityOwner', label: 'OpportunityOwner' }
                  ]}
                  placeholder="Select business title"
                />
              </FormField>
              
              <FormField label="Email">
                <Input
                  value={formData.Email}
                  onChange={({ detail }) => handleChange('Email', detail.value)}
                  placeholder="Enter email address"
                />
              </FormField>
              
              <FormField label="First Name">
                <Input
                  value={formData.FirstName}
                  onChange={({ detail }) => handleChange('FirstName', detail.value)}
                  placeholder="Enter first name"
                />
              </FormField>
              
              <FormField label="Last Name">
                <Input
                  value={formData.LastName}
                  onChange={({ detail }) => handleChange('LastName', detail.value)}
                  placeholder="Enter last name"
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
                Assignee: {
                  BusinessTitle: formData.BusinessTitle,
                  Email: formData.Email,
                  FirstName: formData.FirstName,
                  LastName: formData.LastName
                }
              }, null, 2)}
            </pre>
          </Box>
        </Container>
        
        <SpaceBetween direction="horizontal" size="xs" alignItems="center">
          <Button variant="link" onClick={() => navigate('/opportunities')}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {loading ? 'Assigning...' : 'Assign Opportunity'}
          </Button>
        </SpaceBetween>
      </SpaceBetween>
    </Container>
  );
}

export default AssignOpportunity;