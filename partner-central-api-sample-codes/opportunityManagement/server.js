const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AWS Marketplace Agreement API Proxy'
  });
});

// Search agreements endpoint - matches your Python Lambda exactly
app.post('/search-agreements', async (req, res) => {
  console.log('Received request:', JSON.stringify(req.body, null, 2));

  try {
    const { offer_ids, acceptor_account_ids } = req.body;

    // Validate required parameters (same as Python)
    if (!offer_ids || !Array.isArray(offer_ids) || offer_ids.length === 0) {
      return res.status(400).json({
        error: 'offer_ids array is required'
      });
    }

    // Use AWS SDK v3 to match the Python boto3 approach
    const { MarketplaceAgreementClient, SearchAgreementsCommand } = require('@aws-sdk/client-marketplace-agreement');
    const { fromIni } = require('@aws-sdk/credential-providers');

    // Create client with explicit credentials from ~/.aws/credentials
    const client = new MarketplaceAgreementClient({
      region: 'us-east-1',
      credentials: fromIni({ profile: 'default' })
    });

    // Build filters exactly like Python
    const filters = [
      { name: 'PartyType', values: ['Proposer'] },
      { name: 'AgreementType', values: ['PurchaseAgreement'] },
      { name: 'OfferId', values: offer_ids }
    ];

    if (acceptor_account_ids && acceptor_account_ids.length > 0) {
      filters.push({
        name: 'AcceptorAccountId',
        values: acceptor_account_ids
      });
    }

    // Call AWS API (equivalent to client.search_agreements())
    const command = new SearchAgreementsCommand({
      catalog: 'AWSMarketplace',
      filters: filters
    });

    console.log('Calling AWS with filters:', JSON.stringify(filters, null, 2));

    const response = await client.send(command);

    console.log('AWS response received:', JSON.stringify(response, null, 2));

    // Return response (Python returns the whole response)
    res.json(response);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
});

// Marketplace Catalog API endpoints for Offer Automation
app.post('/api/marketplace/start-changeset', async (req, res) => {
  console.log('Start ChangeSet request:', JSON.stringify(req.body, null, 2));

  try {
    const { MarketplaceCatalogClient, StartChangeSetCommand } = require('@aws-sdk/client-marketplace-catalog');
    const { fromIni } = require('@aws-sdk/credential-providers');

    // Create client with explicit credentials from ~/.aws/credentials
    const client = new MarketplaceCatalogClient({
      region: 'us-east-1',
      credentials: fromIni({ profile: 'default' })
    });

    const command = new StartChangeSetCommand(req.body);
    const response = await client.send(command);

    console.log('AWS StartChangeSet response:', JSON.stringify(response, null, 2));
    res.json(response);

  } catch (error) {
    console.error('StartChangeSet Error:', error);
    res.status(500).json({
      error: error.message || 'Internal server error',
      details: error.name || 'Unknown error'
    });
  }
});

app.post('/api/marketplace/describe-changeset', async (req, res) => {
  console.log('Describe ChangeSet request:', JSON.stringify(req.body, null, 2));

  try {
    const { MarketplaceCatalogClient, DescribeChangeSetCommand } = require('@aws-sdk/client-marketplace-catalog');
    const { fromIni } = require('@aws-sdk/credential-providers');

    // Create client with explicit credentials from ~/.aws/credentials
    const client = new MarketplaceCatalogClient({
      region: 'us-east-1',
      credentials: fromIni({ profile: 'default' })
    });

    const command = new DescribeChangeSetCommand(req.body);
    const response = await client.send(command);

    console.log('AWS DescribeChangeSet response:', JSON.stringify(response, null, 2));
    res.json(response);

  } catch (error) {
    console.error('DescribeChangeSet Error:', error);
    res.status(500).json({
      error: error.message || 'Internal server error',
      details: error.name || 'Unknown error'
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`📊 Health: http://localhost:${port}/health`);
  console.log(`🔍 Search: http://localhost:${port}/search-agreements`);
  console.log(`🛠️  Start ChangeSet: http://localhost:${port}/api/marketplace/start-changeset`);
  console.log(`📋 Describe ChangeSet: http://localhost:${port}/api/marketplace/describe-changeset`);
});

module.exports = app;