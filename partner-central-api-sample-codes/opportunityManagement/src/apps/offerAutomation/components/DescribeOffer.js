import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasCredentials, getCredentials } from '../../../utils/sessionStorage';
import { MarketplaceCatalogClient, DescribeEntityCommand } from "@aws-sdk/client-marketplace-catalog";
import ApiTestInterface from '../../../shared/components/ApiTestInterface';

const DescribeOffer = () => {
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

  // Default payload for DescribeEntity
  const getDefaultPayload = () => ({
    Catalog: "AWSMarketplace",
    EntityId: "offer-1234567890abcdef0"
  });

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
      
      const client = new MarketplaceCatalogClient({
        region: credentials.region || 'us-east-1',
        credentials: {
          accessKeyId: credentials.accessKey,
          secretAccessKey: credentials.secretKey,
          sessionToken: credentials.sessionToken
        }
      });
      
      
      // Create and send the command
      const command = new DescribeEntityCommand(payload);
      const response = await client.send(command);
      
      // Log the raw response for debugging
      
      // Clean the response by removing $metadata
      const cleanedResponse = { ...response };
      delete cleanedResponse.$metadata;

      setSuccess(true);
      return cleanedResponse;
      
    } catch (err) {
      setError(err.message || 'Failed to fetch offer');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const credentials = getCredentials();
  const region = credentials?.region || 'us-east-1';

  return (
    <ApiTestInterface
      title="Describe Offer"
      endpoint={`https://marketplace-catalog.${region}.amazonaws.com/`}
      apiAction="DescribeEntity"
      defaultPayload={getDefaultPayload()}
      onRun={handleRun}
      storageKeyPrefix="offerAutomation_describeOffer"
      isLoading={isLoading}
      error={error}
      success={success}
      instructions="Enter the Offer ID in the EntityId field to describe an offer from AWS Marketplace."
    />
  );
};

export default DescribeOffer;