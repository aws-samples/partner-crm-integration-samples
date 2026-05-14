import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasCredentials } from '../../../utils/sessionStorage';
import ApiTestInterface from '../../../shared/components/ApiTestInterface';


const ListAgreements = () => {
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

  // Default payload for SearchAgreements
  const getDefaultPayload = () => ({
    "offer_ids": ["offer-hdclyvgpm3dnq"],
    "acceptor_account_ids": ["222222222222"]
  });

  const handleRun = async (payload) => {
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {

      const response = await fetch('http://localhost:3001/search-agreements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });


      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();

      setSuccess(true);
      return responseData;
      
    } catch (err) {
      
      if (err.message === 'Failed to fetch') {
        setError(`Connection Error: Cannot connect to local server.

🚨 SOLUTION: Start the local Express server first!

Run this command in a separate terminal:
npm run server

Or start both server and React app together:
npm run dev

The local server should be running at http://localhost:3001`);
      } else {
        setError(err.message || 'Failed to search agreements');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ApiTestInterface
      title="List Agreements"
      endpoint="http://localhost:3001/search-agreements"
      apiAction="SearchAgreements"
      defaultPayload={getDefaultPayload()}
      onRun={handleRun}
      storageKeyPrefix="offerAutomation_listAgreements"
      isLoading={isLoading}
      error={error}
      success={success}
      instructions="This calls the local Express server which proxies to AWS Marketplace Agreement API. Make sure the local server is running with 'npm run server'."
    />
  );
};

export default ListAgreements;