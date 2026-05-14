import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasCredentials, getCredentials, saveOpportunityId } from '../../../utils/sessionStorage';
import { createPartnerCentralClient } from '../../../shared/utils/awsClients';
import { createOpportunityPayload } from '../../../shared/utils/payloadTemplates';
import ApiTestInterface from '../../../shared/components/ApiTestInterface';
import { CreateOpportunityCommand } from '@aws-sdk/client-partnercentral-selling';

const CreateOpportunity = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Check credentials on component mount
  useEffect(() => {
    if (!hasCredentials()) {
      navigate('/');
      return;
    }
  }, [navigate]);

  const handleRun = async (payload) => {
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Check credentials before making API call
      if (!hasCredentials()) {
        throw new Error('No AWS credentials found. Please log in first.');
      }

      const credentials = getCredentials();
      const client = createPartnerCentralClient(credentials);
      const command = new CreateOpportunityCommand(payload);
      const response = await client.send(command);

      // Save the opportunityId to session storage
      if (response.Id) {
        saveOpportunityId(response.Id);
      }

      setSuccess(true);
      return response;
    } catch (err) {
      setError(err.message || 'An error occurred while calling the AWS API');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ApiTestInterface
      title="Create Partner Originated Opportunity"
      endpoint="https://partnercentral-selling.us-east-1.amazonaws.com/"
      apiAction="CreateOpportunity"
      defaultPayload={createOpportunityPayload()}
      onRun={handleRun}
      storageKeyPrefix="offerAutomation_createOpportunity"
      isLoading={isLoading}
      error={error}
      success={success}
    />
  );
};

export default CreateOpportunity;