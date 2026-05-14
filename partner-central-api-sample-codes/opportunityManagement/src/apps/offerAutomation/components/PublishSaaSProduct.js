import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasCredentials, getCredentials, saveChangeSetId } from '../../../utils/sessionStorage';
import { createMarketplaceCatalogClient } from '../../../shared/utils/awsClients';
import { publishSaaSProductPayload } from '../../../shared/utils/payloadTemplates';
import ApiTestInterface from '../../../shared/components/ApiTestInterface';
import { StartChangeSetCommand } from '@aws-sdk/client-marketplace-catalog';

const PublishSaaSProduct = () => {
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
      const command = new StartChangeSetCommand(payload);
      const response = await client.send(command);

      // Save the changeSetId to session storage
      if (response.ChangeSetId) {
        saveChangeSetId(response.ChangeSetId);
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
      title="Publish SaaS Product"
      endpoint="https://catalog.marketplace.us-east-1.amazonaws.com/"
      apiAction="StartChangeSet"
      defaultPayload={publishSaaSProductPayload()}
      onRun={handleRun}
      storageKeyPrefix="offerAutomation_publishSaaS"
      isLoading={isLoading}
      error={error}
      success={success}
    />
  );
};

export default PublishSaaSProduct;