// Shared API testing interface component
import React, { useState, useEffect } from 'react';
import {
  Container,
  Header,
  SpaceBetween,
  Box,
  Button,
  Textarea,
  Alert,
  ExpandableSection
} from '@cloudscape-design/components';

const ApiTestInterface = ({
  title,
  endpoint,
  apiAction,
  defaultPayload,
  onRun,
  storageKeyPrefix,
  isLoading = false,
  error = '',
  success = false,
  instructions = null
}) => {
  const [requestPayload, setRequestPayload] = useState(
    typeof defaultPayload === 'string' ? defaultPayload : JSON.stringify(defaultPayload, null, 2)
  );
  const [responsePayload, setResponsePayload] = useState('');

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedRequest = localStorage.getItem(`${storageKeyPrefix}_request`);
    const savedResponse = localStorage.getItem(`${storageKeyPrefix}_response`);
    
    if (savedRequest) {
      setRequestPayload(savedRequest);
    }
    if (savedResponse) {
      setResponsePayload(savedResponse);
    }
  }, [storageKeyPrefix]);

  // Save request payload to localStorage whenever it changes
  const handleRequestChange = (value) => {
    setRequestPayload(value);
    localStorage.setItem(`${storageKeyPrefix}_request`, value);
  };

  // Save response payload to localStorage
  const saveResponse = (response) => {
    setResponsePayload(response);
    localStorage.setItem(`${storageKeyPrefix}_response`, response);
  };

  const handleRun = async () => {
    try {
      const parsedPayload = JSON.parse(requestPayload);
      const response = await onRun(parsedPayload);
      saveResponse(JSON.stringify(response, null, 2));
    } catch (err) {
      saveResponse('');
      throw err;
    }
  };

  return (
    <SpaceBetween size="l">
      <Header variant="h1">
        {title}
      </Header>

      <Container>
        <SpaceBetween size="m">
          <ExpandableSection headerText="API Information" defaultExpanded>
            <SpaceBetween size="s">
              <Box>
                <strong>Endpoint:</strong> {endpoint}
              </Box>
              <Box>
                <strong>API Action:</strong> {apiAction}
              </Box>
              {instructions && (
                <Box>
                  <strong>Instructions:</strong> {instructions}
                </Box>
              )}
            </SpaceBetween>
          </ExpandableSection>

          <Box variant="h3">Request JSON Payload</Box>
          <Textarea
            value={requestPayload}
            onChange={({ detail }) => handleRequestChange(detail.value)}
            rows={Math.min(Math.max(requestPayload.split('\n').length, 10), 30)}
            placeholder="Enter JSON payload here..."
          />

          <SpaceBetween size="s" direction="horizontal">
            <Button 
              variant="primary" 
              onClick={handleRun}
              loading={isLoading}
            >
              RUN
            </Button>
          </SpaceBetween>

          {error && (
            <Alert type="error" header="API Error">
              {error}
            </Alert>
          )}

          {success && responsePayload && !error && (
            <Alert type="success" header="API Call Successful">
              {apiAction} API executed successfully. Check the response below for details.
            </Alert>
          )}

          <Box variant="h3">Response JSON Payload</Box>
          <Textarea
            value={responsePayload}
            readOnly={true}
            rows={Math.min(Math.max(responsePayload.split('\n').length, 10), 25)}
            placeholder="Response will appear here after running the API..."
          />
        </SpaceBetween>
      </Container>
    </SpaceBetween>
  );
};

export default ApiTestInterface;