import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOpportunityId, hasCredentials } from '../utils/sessionStorage';
import { decodeHtmlEntities } from '../utils/commonUtils';
import {
  Container,
  Header,
  Form,
  FormField,
  RadioGroup,
  SpaceBetween,
  Button,
  Box,
  Alert,
  Spinner
} from "@cloudscape-design/components";

function SimulateReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  // Use the ID from URL params or from session storage
  const opportunityId = id || getOpportunityId();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [opportunity, setOpportunity] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("Approved");
  const [updatePayload, setUpdatePayload] = useState(null);
  const [updateResponse, setUpdateResponse] = useState(null);
  
  // Check authentication first
  useEffect(() => {
    if (!hasCredentials()) {
      navigate('/');
      return;
    }
  }, [navigate]);
  
  // Fetch opportunity details on component mount
  useEffect(() => {
  const fetchOpportunity = async () => {
    try {
      setLoading(true);
      
      // If no ID is provided, redirect to opportunities list
      if (!opportunityId) {
        navigate('/opportunities?review=true');
        return;
      }
      
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
      
      // Fetch opportunity details
      const command = new GetOpportunityCommand({
        Catalog: credentials.catalog || "Sandbox",
        Identifier: opportunityId
      });
      
      const response = await client.send(command);
      setOpportunity(response);
      
      // Prepare update payload
      const payload = { ...response };
      
      // Decode HTML entities in string fields only
      if (payload.Project?.CustomerUseCase) {
        payload.Project.CustomerUseCase = decodeHtmlEntities(payload.Project.CustomerUseCase);
      }
      if (payload.Project?.CustomerBusinessProblem) {
        payload.Project.CustomerBusinessProblem = decodeHtmlEntities(payload.Project.CustomerBusinessProblem);
      }
      
      // Replace Id with Identifier
      payload.Identifier = payload.Id;
      delete payload.Id;
      
      // Remove fields that should not be included
      delete payload.CreatedDate;
      delete payload.OpportunityTeam;
      delete payload.RelatedEntityIdentifiers;
      delete payload.$metadata;
      
      setUpdatePayload(payload);
    } catch (error) {
      console.error('Error fetching opportunity:', error);
      setError(`Error: ${error.message || 'Failed to fetch opportunity'}`);
    } finally {
      setLoading(false);
    }
  };
  
  fetchOpportunity();
  }, [opportunityId, navigate]);

  
  // Update payload when review status changes
  useEffect(() => {
    if (updatePayload) {
        const newPayload = { ...updatePayload };
        if (newPayload.LifeCycle) {
        newPayload.LifeCycle.ReviewStatus = reviewStatus;
        }
        setUpdatePayload(newPayload);
    }
  }, [reviewStatus, updatePayload]);

  
  // Handle review submission
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      // Import AWS SDK
      const { PartnerCentralSellingClient, UpdateOpportunityCommand, GetOpportunityCommand } = await import("@aws-sdk/client-partnercentral-selling");
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
      
      // Update opportunity with new review status
      const updateCommand = new UpdateOpportunityCommand(updatePayload);
      await client.send(updateCommand);
      
      // Fetch updated opportunity details
      const getCommand = new GetOpportunityCommand({
        Catalog: credentials.catalog || "Sandbox",
        Identifier: id
      });
      
      const updatedOpportunity = await client.send(getCommand);
      setUpdateResponse(updatedOpportunity);
    } catch (error) {
      console.error('Error updating opportunity:', error);
      setError(`Error: ${error.message || 'Failed to update opportunity'}`);
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
        <Alert type="error">{error}</Alert>
        <Box padding={{ top: 'l' }}>
          <Button onClick={() => navigate('/opportunities')}>Back to Opportunities</Button>
        </Box>
      </Container>
    );
  }
  
  if (updateResponse) {
    return (
      <Container>
        <SpaceBetween size="l">
          <Alert type="success">Review Status is updated by AWS to {reviewStatus}</Alert>
          
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
              {decodeHtmlEntities(JSON.stringify(updateResponse, null, 2))}
            </pre>
          </Container>
          
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
        <Header variant="h1">[Simulate] Review from AWS</Header>
        
        <Container>
          <Header variant="h2">Opportunity Details</Header>
          <Form>
            <FormField label="Opportunity ID">
              <Box>{opportunity?.Id || id}</Box>
            </FormField>
            
            <FormField label="Current Review Status">
              <Box>{opportunity?.LifeCycle?.ReviewStatus || 'Unknown'}</Box>
            </FormField>
          </Form>
        </Container>
        
        <Container>
          <Header variant="h2">Review Options</Header>
          <Form>
            <FormField label="Select Review Status">
              <RadioGroup
                value={reviewStatus}
                onChange={({ detail }) => setReviewStatus(detail.value)}
                items={[
                  { value: "Approved", label: "Approved" },
                  { value: "Action Required", label: "Action Required" },
                  { value: "Rejected", label: "Rejected" }
                ]}
              />
            </FormField>
          </Form>
        </Container>
        
        <Container>
          <Header variant="h2">Update Payload</Header>
          <pre style={{ 
            backgroundColor: '#f9f9f9', 
            padding: '15px', 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            overflowX: 'auto',
            maxHeight: '400px'
          }}>
            {decodeHtmlEntities(JSON.stringify(updatePayload, null, 2))}
          </pre>
        </Container>
        
        <SpaceBetween direction="horizontal" size="xs" alignItems="center">
          <Button variant="link" onClick={() => navigate('/opportunities')}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={submitting}>Review</Button>
        </SpaceBetween>
      </SpaceBetween>
    </Container>
  );
}

export default SimulateReview;
