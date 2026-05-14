# Local Agreement API Server

A Node.js Express server that provides a local endpoint for AWS Marketplace Agreement searches, eliminating the need for external API Gateway calls. This server supports both the **Opportunity Management** and **Offer Automation** applications in the dual-app architecture.

## 🚀 Quick Start

### Option 1: Run Both Server and React App Together (Recommended)

```bash
# Install dependencies (if not already done)
npm install

# Run both server and React app concurrently
npm run dev
```

This will start:
- **Express server** at `http://localhost:3001`
- **React app** at `http://localhost:3000`

### Option 2: Run Server Only

```bash
# Start just the Express server
npm run server
```

### Option 3: Manual Setup

```bash
# Terminal 1: Start the server
npm run server

# Terminal 2: Start React app
npm start
```

## 📡 API Endpoints

### Health Check
```bash
GET http://localhost:3001/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-22T13:00:00.000Z",
  "service": "AWS Marketplace Agreement API Proxy"
}
```

### Search Agreements
```bash
POST http://localhost:3001/search-agreements
Content-Type: application/json

{
  "offer_ids": ["offer-hdclyvgpm3dnq"],
  "acceptor_account_ids": ["222222222222"]
}
```

Response:
```json
{
  "agreementViewSummaries": [
    {
      "acceptanceTime": "2025-09-03T19:28:17.594Z",
      "acceptor": {
        "accountId": "222222222222"
      },
      "agreementId": "agmt-4iuqmo9rrn0si5lyykt6rfchi",
      "agreementType": "PurchaseAgreement",
      "endTime": "2025-09-04T21:39:50.093Z",
      "proposalSummary": {
        "offerId": "offer-hdclyvgpm3dnq",
        "resources": [
          {
            "id": "prod-uxaz6zgh52ooa",
            "type": "SaaSProduct"
          }
        ]
      },
      "proposer": {
        "accountId": "222222222222"
      },
      "startTime": "2025-09-03T19:28:17.594Z",
      "status": "REPLACED"
    }
  ]
}
```

## 🔧 Configuration

### AWS Credentials

The server uses your local AWS credentials. Ensure you have one of:

1. **AWS credentials file** (`~/.aws/credentials`):
   ```ini
   [default]
   aws_access_key_id = YOUR_ACCESS_KEY
   aws_secret_access_key = YOUR_SECRET_KEY
   aws_session_token = YOUR_SESSION_TOKEN
   region = us-east-1
   ```

2. **Environment variables**:
   ```bash
   export AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
   export AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
   export AWS_SESSION_TOKEN=YOUR_SESSION_TOKEN
   export AWS_REGION=us-east-1
   ```

### Server Configuration

Default configuration:
- **Port**: 3001
- **CORS**: Enabled for all origins
- **Region**: us-east-1
- **Endpoint**: AWS Marketplace Agreement API

## 🛠️ How It Works

1. **Receives Request**: Express server receives POST request with offer IDs and account IDs
2. **Validates Input**: Checks for required parameters and proper format
3. **Calls AWS API**: Makes authenticated call to AWS Marketplace Agreement API
4. **Returns Response**: Proxies the AWS response back to the React app

## 🔍 Benefits Over API Gateway

- ✅ **No External Dependencies**: Runs locally, no need for deployed Lambda
- ✅ **Easy Development**: Simple to modify and debug
- ✅ **Cost Effective**: No AWS Lambda or API Gateway costs
- ✅ **Fast Iteration**: Immediate changes without deployment
- ✅ **Full Control**: Complete control over error handling and logging
- ✅ **Multi-App Support**: Serves both Opportunity Management and Offer Automation apps
- ✅ **Shared Infrastructure**: Single server supports all 55 components across both apps

## 🐛 Troubleshooting

### Server Won't Start
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill process using port 3001
kill -9 $(lsof -t -i:3001)
```

### AWS Credentials Issues
```bash
# Test AWS credentials
aws sts get-caller-identity

# Sync credentials from ~/.aws/credentials
npm run sync-creds
```

### CORS Issues
The server includes CORS middleware, but if you encounter issues:
```javascript
// server.js - CORS is already configured
app.use(cors());
```

### API Call Failures
Check server logs for detailed error messages:
```bash
npm run server
# Server logs will show AWS API calls and responses
```

## 📊 Monitoring

The server provides detailed logging:
- **Request logging**: All incoming requests with payloads
- **AWS API calls**: Outgoing AWS API requests and responses
- **Error handling**: Detailed error messages and stack traces
- **Health checks**: Server status and uptime

## 🔒 Security Notes

- **Local Development Only**: This server is designed for local development
- **AWS Credentials**: Uses your local AWS credentials (same as AWS CLI)
- **No Authentication**: No additional authentication layer (relies on AWS credentials)
- **CORS Enabled**: Allows requests from any origin (development convenience)

## 🚀 Production Considerations

For production use, consider:
- **Authentication**: Add proper authentication middleware
- **Rate Limiting**: Implement rate limiting for API calls
- **CORS Restrictions**: Limit CORS to specific origins
- **Error Handling**: Enhanced error handling and monitoring
- **Logging**: Structured logging with log levels
- **Health Checks**: More comprehensive health check endpoints

## 🏗️ Architecture Integration

### Dual-App Support
This Express server seamlessly supports both applications in the project:

- **Opportunity Management App** (39 components): Full agreement search functionality
- **Offer Automation App** (15 components): Streamlined agreement lookup
- **Shared Services**: Single server instance serves both apps efficiently

### Component Integration
The server provides API endpoints used by:
- `src/apps/opportunityManagement/components/ListAgreements.js`
- Any future agreement-related components in the offer automation app
- Shared components that need agreement data

### Development Workflow
```bash
# Start server for both apps
npm run dev

# Both apps can now access:
# - http://localhost:3001/health
# - http://localhost:3001/search-agreements
```

---

**This local server replicates your Python Lambda function functionality in Node.js for easier development across both applications!** 🎉