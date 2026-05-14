import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasCredentials, getCredentials } from '../../../utils/sessionStorage';
import { startEngagementFromOpportunityTaskPayload } from '../../../shared/utils/payloadTemplates';
import ApiTestInterface from '../../../shared/components/ApiTestInterface';
import { StartEngagementFromOpportunityTaskCommand } from '@aws-sdk/client-partnercentral-selling';
import { createPartnerCentralClient } from '../../../shared/utils/awsClients';

const StartEngagementFromOpportunityTaskApi = () => {
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
      const command = new StartEngagementFromOpportunityTaskCommand(payload);
      const response = await client.send(command);

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
      title="Start Engagement From Opportunity Task"
      endpoint="https://partnercentral-selling.us-east-1.amazonaws.com/"
      apiAction="StartEngagementFromOpportunityTask"
      defaultPayload={startEngagementFromOpportunityTaskPayload()}
      onRun={handleRun}
      storageKeyPrefix="opportunityManagement_startEngagementFromOpportunityTask"
      isLoading={isLoading}
      error={error}
      success={success}
      instructions="Update the Identifier field with your opportunity ID to start an engagement from the opportunity task."
    />
  );
};

export default StartEngagementFromOpportunityTaskApi;