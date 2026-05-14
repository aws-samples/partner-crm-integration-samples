import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasCredentials, getCredentials } from '../../../utils/sessionStorage';
import { createMarketplaceCatalogClient } from '../../../shared/utils/awsClients';
import { describeChangeSetPayload } from '../../../shared/utils/payloadTemplates';
import ApiTestInterface from '../../../shared/components/ApiTestInterface';
import { DescribeChangeSetCommand } from '@aws-sdk/client-marketplace-catalog';

const DescribeChangeSet = () => {
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
      const client = createMarketplaceCatalogClient(credentials);
      const command = new DescribeChangeSetCommand(payload);
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
      title="Describe Change Set"
      endpoint="https://catalog.marketplace.us-east-1.amazonaws.com/"
      apiAction="DescribeChangeSet"
      defaultPayload={describeChangeSetPayload()}
      onRun={handleRun}
      storageKeyPrefix="offerAutomation_describeChangeSet"
      isLoading={isLoading}
      error={error}
      success={success}
    />
  );
};

export default DescribeChangeSet;