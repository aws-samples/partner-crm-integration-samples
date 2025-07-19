// src/services/api.js
import { PartnerCentralSellingClient, ListOpportunitiesCommand, GetOpportunityCommand, GetAwsOpportunitySummaryCommand } from "@aws-sdk/client-partnercentral-selling";
import { getCredentials } from '../utils/sessionStorage';

// Create a Partner Central client with credentials from session storage
const createPartnerCentralClient = () => {
  const credentials = getCredentials();
  
  const clientConfig = {
    region: credentials.region || 'us-east-1',
    credentials: {
      accessKeyId: credentials.accessKey,
      secretAccessKey: credentials.secretKey,
      sessionToken: credentials.sessionToken
    }
  };
  
  // Use CSP-allowed endpoint for harmony environment, direct endpoint otherwise
  // if (window.location.hostname.includes('harmony.a2z.com')) {
  //   // Use the opportunity-management endpoint that's explicitly allowed in CSP
  //   clientConfig.endpoint = 'https://opportunity-management.us-east-1.beta.api.harmony.a2z.com';
  // } else {
    // Use direct endpoint for local development
    if (credentials.endpointUrl && credentials.endpointUrl.trim()) {
      clientConfig.endpoint = credentials.endpointUrl.trim();
    }
 // }
  
  console.log("endpoint", clientConfig.endpoint);

  return new PartnerCentralSellingClient(clientConfig);
};

// List opportunities
export const listOpportunities = async () => {
  try {
    console.log('Listing opportunities...');
    
    const credentials = getCredentials();
    const client = createPartnerCentralClient();
    const command = new ListOpportunitiesCommand({
      Catalog: credentials.catalog || "Sandbox"
    });
    
    const response = await client.send(command);
    //console.log('List opportunities response:', JSON.stringify(response, null, 2));
    
    // Return the entire response for processing in the component
    return response;
  } catch (error) {
    console.error('Error listing opportunities:', error);
    throw error;
  }
};

// Get opportunity details
export const getOpportunity = async (opportunityId) => {
  try {
    console.log(`Getting opportunity details for ${opportunityId}...`);
    
    const credentials = getCredentials();
    const client = createPartnerCentralClient();
    const command = new GetOpportunityCommand({
      Catalog: credentials.catalog || "Sandbox",
      Identifier: opportunityId
    });
    
    const response = await client.send(command);
    console.log('Get opportunity response:', JSON.stringify(response, null, 2));
    
    return response;
  } catch (error) {
    console.error('Error getting opportunity details:', error);
    throw error;
  }
};

// Get AWS opportunity summary
export const getAwsOpportunitySummary = async (opportunityId) => {
  try {
    console.log(`Getting AWS opportunity summary for ${opportunityId}...`);
    
    const credentials = getCredentials();
    const client = createPartnerCentralClient();
    const command = new GetAwsOpportunitySummaryCommand({
      Catalog: credentials.catalog || "Sandbox",
      RelatedOpportunityIdentifier: opportunityId
    });
    
    const response = await client.send(command);
    console.log('Get AWS opportunity summary response:', JSON.stringify(response, null, 2));
    
    // Log the specific fields we're interested in
    console.log('Origin field:', response.Origin);
    console.log('Full response keys:', Object.keys(response));
    
    return response;
  } catch (error) {
    console.error('Error getting AWS opportunity summary:', error);
    throw error;
  }
};