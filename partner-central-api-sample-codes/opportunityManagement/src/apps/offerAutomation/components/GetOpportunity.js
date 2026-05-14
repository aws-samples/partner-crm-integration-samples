import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasCredentials, getCredentials, getOpportunityId } from '../../../utils/sessionStorage';
import { createPartnerCentralClient } from '../../../shared/utils/awsClients';
import { getOpportunityPayload } from '../../../shared/utils/payloadTemplates';
import ApiTestInterface from '../../../shared/components/ApiTestInterface';
import { GetOpportunityCommand } from '@aws-sdk/client-partnercentral-selling';

const GetOpportunity = () => {
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

  // Get saved opportunity ID or use example
  const getSavedOpportunityId = () => {
    const savedId = getOpportunityId();
    return savedId || 'O-1234567890abcdef';
  };

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
      const command = new GetOpportunityCommand(payload);
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
      title="Get Opportunity"
      endpoint="https://partnercentral-selling.us-east-1.amazonaws.com/"
      apiAction="GetOpportunity"
      defaultPayload={getOpportunityPayload(getSavedOpportunityId())}
      onRun={handleRun}
      storageKeyPrefix="offerAutomation_getOpportunity"
      isLoading={isLoading}
      error={error}
      success={success}
    />
  );
};

export default GetOpportunity;