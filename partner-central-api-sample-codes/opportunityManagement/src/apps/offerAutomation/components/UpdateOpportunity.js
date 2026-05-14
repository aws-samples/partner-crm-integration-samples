import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOpportunityId, hasCredentials } from '../../../utils/sessionStorage';
import { decodeServerEntities } from '../../../utils/commonUtils';
import {
  Container,
  Header,
  Form,
  FormField,
  SpaceBetween,
  Button,
  Box,
  Alert,
  Spinner,
  Input,
  Textarea
} from "@cloudscape-design/components";

function UpdateOpportunity() {
  const { id } = useParams();
  const navigate = useNavigate();
  // Use the ID from URL params or from session storage
  const opportunityId = id || getOpportunityId();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [opportunity, setOpportunity] = useState(null);
  const [editablePayload, setEditablePayload] = useState('');
  const [updateResponse, setUpdateResponse] = useState(null);
  const [inputOpportunityId, setInputOpportunityId] = useState('');

  // Check authentication first
  useEffect(() => {
    if (!hasCredentials()) {
      navigate('/');
      return;
    }
  }, [navigate]);

  // Fetch opportunity details - EXACTLY like EditOpportunity
  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        setLoading(true);
        
        // If no ID is provided, show error instead of redirecting
        if (!opportunityId) {
          setError('No opportunity ID provided. Please provide an opportunity ID to update.');
          setLoading(false);
          return;
        }
        
        // Import AWS SDK
        const { PartnerCentralSellingClient, GetOpportunityCommand } = await import("@aws-sdk/client-partnercentral-selling");
        const { getCredentials } = await import('../../../utils/sessionStorage');
        
        const credentials = getCredentials();
        
        const client = new PartnerCentralSellingClient({
          region: credentials.region || 'us-east-1',
          credentials: {
            accessKeyId: credentials.accessKey,
            secretAccessKey: credentials.secretKey,
            sessionToken: credentials.sessionToken
          }
        });
        
        // Fetch opportunity details
        const command = new GetOpportunityCommand({
          Catalog: credentials.catalog || "Sandbox",
          Identifier: opportunityId
        });
        
        const response = await client.send(command);
        setOpportunity(response);
        
        // Prepare update payload - EXACTLY like EditOpportunity
        const updatePayload = { ...response };
        
        // Decode HTML entities in string fields only
        if (updatePayload.Project?.CustomerUseCase) {
          updatePayload.Project.CustomerUseCase = decodeServerEntities(updatePayload.Project.CustomerUseCase);
        }
        if (updatePayload.Project?.CustomerBusinessProblem) {
          updatePayload.Project.CustomerBusinessProblem = decodeServerEntities(updatePayload.Project.CustomerBusinessProblem);
        }
        if (updatePayload.Customer?.Account?.CompanyName) {
          updatePayload.Customer.Account.CompanyName = decodeServerEntities(updatePayload.Customer.Account.CompanyName);
        }
        updatePayload.Identifier = updatePayload.Id;
        delete updatePayload.Id;
        delete updatePayload.CreatedDate;
        delete updatePayload.OpportunityTeam;
        delete updatePayload.RelatedEntityIdentifiers;
        delete updatePayload.$metadata;
        
        // Remove __type fields from ExpectedCustomerSpend - EXACTLY like EditOpportunity
        if (updatePayload.Project?.ExpectedCustomerSpend) {
          updatePayload.Project.ExpectedCustomerSpend.forEach(spend => {
            delete spend.__type;
          });
        }
        
        // Set editable payload - EXACTLY like EditOpportunity
        const jsonString = JSON.stringify(updatePayload, null, 2).replace(/&amp;/g, '&');
        setEditablePayload(jsonString);
        
      } catch (error) {
        setError(`Error: ${error.message || 'Failed to fetch opportunity'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunity();
  }, [opportunityId, navigate]);

  // Handle form submission - Parse JSON as "form fields" and use EditOpportunity algorithm
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      // Parse the edited JSON to extract field values (treat as form data)
      let editedData;
      try {
        editedData = JSON.parse(editablePayload.replace(/&/g, '&amp;'));
      } catch (parseError) {
        throw new Error(`JSON Parse Error: ${parseError.message}. Please check your JSON syntax.`);
      }
      
      // Extract field values from JSON like they were form fields
      const formData = {
        ReviewStatus: editedData.LifeCycle?.ReviewStatus || '',
        Stage: editedData.LifeCycle?.Stage || '',
        TargetCloseDate: editedData.LifeCycle?.TargetCloseDate || '',
        NextSteps: editedData.LifeCycle?.NextSteps || '',
        CustomerUseCase: editedData.Project?.CustomerUseCase || '',
        CustomerBusinessProblem: editedData.Project?.CustomerBusinessProblem || '',
        CompetitorName: editedData.Project?.CompetitorName || '',
        ExpectedAmount: editedData.Project?.ExpectedCustomerSpend?.[0]?.Amount || '',
        CompanyName: editedData.Customer?.Account?.CompanyName || '',
        CustomerFirstName: editedData.Customer?.Contacts?.[0]?.FirstName || '',
        CustomerLastName: editedData.Customer?.Contacts?.[0]?.LastName || '',
        CustomerEmail: editedData.Customer?.Contacts?.[0]?.Email || ''
      };
      
      // Now use EditOpportunity's algorithm to construct payload
      const updatePayload = { ...opportunity };
      
      // Apply form data changes to the payload - EXACTLY like EditOpportunity
      if (updatePayload.LifeCycle) {
        updatePayload.LifeCycle.ReviewStatus = formData.ReviewStatus;
        updatePayload.LifeCycle.Stage = formData.Stage;
        updatePayload.LifeCycle.TargetCloseDate = formData.TargetCloseDate;
        updatePayload.LifeCycle.NextSteps = formData.NextSteps;
      }
      
      if (updatePayload.Project) {
        updatePayload.Project.CustomerUseCase = formData.CustomerUseCase;
        updatePayload.Project.CustomerBusinessProblem = formData.CustomerBusinessProblem;
        updatePayload.Project.CompetitorName = formData.CompetitorName;
        if (updatePayload.Project.ExpectedCustomerSpend?.[0]) {
          updatePayload.Project.ExpectedCustomerSpend[0].Amount = formData.ExpectedAmount;
        }
      }
      
      if (updatePayload.Customer?.Account) {
        updatePayload.Customer.Account.CompanyName = formData.CompanyName;
      }
      
      if (updatePayload.Customer?.Contacts?.[0]) {
        updatePayload.Customer.Contacts[0].FirstName = formData.CustomerFirstName;
        updatePayload.Customer.Contacts[0].LastName = formData.CustomerLastName;
        updatePayload.Customer.Contacts[0].Email = formData.CustomerEmail;
      }
      
      // Decode HTML entities in string fields only - EXACTLY like EditOpportunity
      if (updatePayload.Project?.CustomerUseCase) {
        updatePayload.Project.CustomerUseCase = decodeServerEntities(updatePayload.Project.CustomerUseCase);
      }
      if (updatePayload.Project?.CustomerBusinessProblem) {
        updatePayload.Project.CustomerBusinessProblem = decodeServerEntities(updatePayload.Project.CustomerBusinessProblem);
      }
      
      // Replace Id with Identifier - EXACTLY like EditOpportunity
      updatePayload.Identifier = updatePayload.Id;
      delete updatePayload.Id;
      
      // Remove fields that should not be included - EXACTLY like EditOpportunity
      delete updatePayload.CreatedDate;
      delete updatePayload.OpportunityTeam;
      delete updatePayload.RelatedEntityIdentifiers;
      delete updatePayload.$metadata;
      
      // Import AWS SDK
      const { PartnerCentralSellingClient, UpdateOpportunityCommand, GetOpportunityCommand } = await import("@aws-sdk/client-partnercentral-selling");
      const { getCredentials } = await import('../../../utils/sessionStorage');
      
      const credentials = getCredentials();
      
      const client = new PartnerCentralSellingClient({
        region: credentials.region || 'us-east-1',
        credentials: {
          accessKeyId: credentials.accessKey,
          secretAccessKey: credentials.secretKey,
          sessionToken: credentials.sessionToken
        }
      });
      
      // Update opportunity with new data - EXACTLY like EditOpportunity
      const updateCommand = new UpdateOpportunityCommand(updatePayload);
      await client.send(updateCommand);
      
      // Fetch updated opportunity details
      const getCommand = new GetOpportunityCommand({
        Catalog: credentials.catalog || "Sandbox",
        Identifier: opportunityId
      });
      
      const updatedOpportunity = await client.send(getCommand);
      setUpdateResponse(updatedOpportunity);
      
    } catch (error) {
      if (error.name === 'SyntaxError') {
        setError(`JSON Parse Error: ${error.message}. Please check your JSON syntax.`);
      } else {
        setError(`Error: ${error.message || 'Failed to update opportunity'}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

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
        <SpaceBetween size="l">
          <Header variant="h1">Update Opportunity</Header>
          <Alert type="error">{error}</Alert>
          
          {error.includes('No opportunity ID provided') && (
            <Container>
              <Header variant="h2">Enter Opportunity ID</Header>
              <Form>
                <FormField label="Opportunity ID" description="Enter the opportunity ID you want to update">
                  <SpaceBetween direction="horizontal" size="s">
                    <Input 
                      value={inputOpportunityId}
                      placeholder="e.g., O1234567890123456789"
                      onChange={({ detail }) => setInputOpportunityId(detail.value)}
                    />
                    <Button 
                      variant="primary"
                      disabled={!inputOpportunityId.trim()}
                      onClick={() => {
                        if (inputOpportunityId.trim()) {
                          navigate(`/offerautomation/update-opportunity/${inputOpportunityId.trim()}`);
                        }
                      }}
                    >
                      Load Opportunity
                    </Button>
                  </SpaceBetween>
                </FormField>
              </Form>
            </Container>
          )}
          
          <Box padding={{ top: 'l' }}>
            <Button onClick={() => navigate('/offerautomation')}>Back to Offer Automation</Button>
          </Box>
        </SpaceBetween>
      </Container>
    );
  }

  if (updateResponse) {
    return (
      <Container>
        <SpaceBetween size="l">
          <Alert type="success">Opportunity updated successfully!</Alert>
          
          <Container>
            <Header variant="h2">Updated Opportunity</Header>
            <pre style={{ 
              backgroundColor: '#f9f9f9', 
              padding: '15px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              overflowX: 'auto',
              maxHeight: '400px'
            }}>
              {decodeServerEntities(JSON.stringify(updateResponse, null, 2))}
            </pre>
          </Container>
          
          <Box padding={{ top: 'l' }}>
            <Button onClick={() => navigate('/offerautomation')}>Back to Offer Automation</Button>
          </Box>
        </SpaceBetween>
      </Container>
    );
  }
  
  return (
    <Container>
      <SpaceBetween size="l">
        <Header variant="h1">Update Opportunity</Header>
        
        <Container>
          <Header variant="h2">Opportunity Details</Header>
          <Form>
            <FormField label="Opportunity ID">
              <Box>{opportunity?.Id || opportunityId}</Box>
            </FormField>
          </Form>
        </Container>
        
        <Container>
          <Header variant="h2">Update Payload</Header>
          <FormField 
            label="JSON Payload" 
            description="You can modify the JSON payload below before submitting the update"
          >
            <Textarea
              value={editablePayload}
              onChange={({ detail }) => setEditablePayload(detail.value)}
              rows={Math.min(Math.max(editablePayload.split('\n').length, 15), 30)}
              placeholder="JSON payload will appear here..."
            />
          </FormField>
        </Container>
        
        <SpaceBetween direction="horizontal" size="xs" alignItems="center">
          <Button variant="link" onClick={() => navigate('/offerautomation')}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={submitting}>Update</Button>
        </SpaceBetween>
      </SpaceBetween>
    </Container>
  );
}

export default UpdateOpportunity;