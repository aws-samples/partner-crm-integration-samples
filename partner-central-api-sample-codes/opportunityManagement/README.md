# AWS Partner Central API - Opportunity Management Sample

A comprehensive React-based web application demonstrating AWS Partner Central API integration for opportunity management, marketplace operations, and partner workflows.

## 🚀 Features

### Core Functionality
- **🏢 Products Management**: Complete AWS Marketplace SaaS product lifecycle - view existing products, publish new products with contract pricing, configure multiple dimensions (entitled/metered), set renewal terms, and manage legal/support terms
- **💼 Offers Management**: Full offer creation suite including private offers, CPPO (Channel Partner Private Offers), future service date offers, custom pricing, buyer targeting, and real-time change set monitoring
- **🎯 Opportunity Management**: End-to-end partner opportunity workflows - create, view, edit, list opportunities, associate with solutions/AWS products/marketplace offers, and manage opportunity lifecycle stages
- **🤝 Engagement Invitations**: Complete partner collaboration system - handle engagement invitations, accept/reject workflows, start engagements from opportunities, and manage partner relationships
- **📊 Agreements**: Advanced AWS Marketplace agreement search and management with custom Lambda API integration, offer-based filtering, account-based searches, and comprehensive agreement details display
- **🔄 Change Set Tracking**: Real-time monitoring of AWS Marketplace API operations with automatic status polling, retry logic, error handling, and success confirmation

### Advanced Features
- **🔐 Auto-Login**: Secure credential management using React environment variables
- **⚡ Credentials Sync**: Automated sync from `~/.aws/credentials` to React environment
- **🔄 Real-time Updates**: Automatic status polling for long-running operations
- **📡 Comprehensive API Coverage**: Full AWS Marketplace Catalog and Partner Central API integration
- **🛡️ Security Best Practices**: Secure credential handling and session management
- **🎨 Modern UI**: AWS Cloudscape Design System with responsive layouts

## 📋 Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Special AWS Credentials** with AWS Marketplace and Partner Central API access
- **AWS CLI** (optional, for credential management)
- **Note**: Regular AWS Workshop Studio credentials will NOT work - you need marketplace-specific credentials

## 🛠️ Quick Start

### Step 1: Clone and Setup

```bash
# Clone this repository
git clone https://github.com/YOUR_USERNAME/opportunityManagement.git
cd opportunityManagement

# Install dependencies
npm install
```

### Step 2: Configure Credentials

#### Method A: Automated Sync (Recommended) 🎯

This method automatically syncs credentials from your AWS CLI configuration:

1. **Set up AWS credentials** in `~/.aws/credentials`:
   ```ini
   [default]
   aws_access_key_id = AKIAIOSFODNN7EXAMPLE
   aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   aws_session_token = IQoJb3JpZ2luX2VjEHoaCXVzLWVhc3QtMSJHMEUCIQDEXAMPLETOKEN...
   region = us-east-1
   ```

2. **Sync credentials to React app**:
   ```bash
   npm run sync-creds
   ```

3. **Ready for Step 3**: Credentials are now synced and ready to use

#### Method B: Manual Environment Setup

Create a `.env.local` file in the project root:

```bash
# .env.local
REACT_APP_AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
REACT_APP_AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
REACT_APP_AWS_SESSION_TOKEN=IQoJb3JpZ2luX2VjEHoaCXVzLWVhc3QtMSJHMEUCIQDEXAMPLETOKEN...
REACT_APP_AWS_REGION=us-east-1
```

#### Method C: Manual Login

Set `SkipLogin: false` in `src/config/config.js`:

```javascript
export const config = {
  Internal: true,
  SkipLogin: false  // Use manual login form
};
```

### Step 3: Start Development Server

#### ⭐ **Recommended: Start Both Services Together**
```bash
npm run dev
```

This automatically starts:
- **React App**: `http://localhost:3000` 
- **Express Server**: `http://localhost:3001` (required for List Agreements)

#### Alternative: Start Services Separately
```bash
# Terminal 1: Start Express server
npm run server

# Terminal 2: Start React app  
npm start
```

#### ⚠️ **Important Notes:**
- **`npm start` alone is NOT enough** - it only starts the React app
- **List Agreements feature requires the Express server** running on port 3001
- **Use `npm run dev`** to ensure both services start correctly
- If you only run `npm start`, the agreements search will show "Server Offline" warning

The application will be available at `http://localhost:3000`

---

## 🚀 **TL;DR - Quick Start Summary**

```bash
# 1. Install dependencies
npm install

# 2. Sync AWS credentials (if you have ~/.aws/credentials)
npm run sync-creds

# 3. Start BOTH services (React app + Express server)
npm run dev
```

**✅ That's it!** Both applications will be running with full functionality including List Agreements.

**❌ Don't use `npm start` alone** - it won't start the Express server needed for agreements.

### 🛑 **Stop Services:**
```bash
# Normal stop
Ctrl+C

# Kill stuck servers (macOS/Linux)
lsof -ti:3000,3001 | xargs kill -9

# Kill stuck servers (Windows)
taskkill /F /IM node.exe
```

---

### 🧭 Navigating Between Applications

The dual-app architecture provides seamless navigation:

#### **Opportunity Management App** (Default)
- **Access**: `http://localhost:3000` (default route)
- **Features**: Full opportunity lifecycle management
- **Components**: 39 specialized components
- **Use Case**: Comprehensive partner workflows

#### **Offer Automation App**  
- **Access**: `http://localhost:3000/#/offer-automation` 
- **Features**: Streamlined offer creation
- **Components**: 11 focused components  
- **Use Case**: Quick, automated workflows

#### **Shared Navigation**
- **Unified Header**: Same navigation experience
- **Shared Session**: Login once, access both apps
- **Consistent UI**: Same AWS Cloudscape design system
- **Seamless Switching**: Easy navigation between applications

## 🖥️ Local Development Server

### Overview

The application includes a local Express.js server that acts as a proxy for AWS Marketplace Agreement API calls. This eliminates CORS restrictions and provides a seamless development experience without requiring external API Gateway deployments.

### Architecture Flow

```
React App (3000) → Express Server (3001) → AWS Marketplace Agreement API
     ↓                    ↓                           ↓
  Browser UI         Local Proxy              AWS Cloud Service
```

### Server Features

- **🚀 Express.js Server**: Lightweight Node.js server on port 3001
- **🔐 AWS SDK Integration**: Uses AWS SDK v3 with credentials from `~/.aws/credentials`
- **🌐 CORS Enabled**: Allows React app to make requests without CORS issues
- **📊 Health Monitoring**: Health check endpoint for server status
- **🛡️ Error Handling**: Comprehensive error handling with proper HTTP status codes
- **📝 Request Logging**: Detailed logging of all API requests and responses

### Quick Start

#### Option 1: Run Both Services Together (Recommended)
```bash
# Install dependencies
npm install

# Start both React app and Express server
npm run dev
```

This starts:
- **React App**: `http://localhost:3000`
- **Express Server**: `http://localhost:3001`

#### Option 2: Run Services Separately
```bash
# Terminal 1: Start Express server
npm run server

# Terminal 2: Start React app
npm start
```

### Server Endpoints

#### Health Check
```bash
GET http://localhost:3001/health

Response:
{
  "status": "healthy",
  "timestamp": "2025-09-24T05:11:47.434Z",
  "service": "AWS Marketplace Agreement API Proxy"
}
```

#### Search Agreements
```bash
POST http://localhost:3001/search-agreements
Content-Type: application/json

{
  "offer_ids": ["offer-1234567890abcdef"],
  "acceptor_account_ids": ["123456789012"]
}
```

### Implementation Details

The local server (`server.js`) replicates the functionality of the Python Lambda function:

- **Same API Contract**: Accepts `offer_ids` and `acceptor_account_ids` arrays
- **AWS SDK Integration**: Uses `@aws-sdk/client-marketplace-agreement` (equivalent to Python's `boto3`)
- **Credential Management**: Reads from `~/.aws/credentials` using `@aws-sdk/credential-providers`
- **Error Handling**: Returns proper HTTP status codes and error messages
- **Response Format**: Returns the complete AWS API response

### Benefits Over External API Gateway

- ✅ **No External Dependencies**: Runs completely locally
- ✅ **Fast Development**: Immediate changes without deployment
- ✅ **Cost Effective**: No AWS Lambda or API Gateway costs
- ✅ **Easy Debugging**: Full control over logging and error handling
- ✅ **CORS Free**: No browser CORS restrictions
- ✅ **Credential Sharing**: Uses same credentials as other AWS CLI tools

## 🔄 Credentials Management

### Automated Sync Workflow

When your AWS credentials expire (common with temporary credentials):

1. **Get new credentials** from your AWS source (Workshop Studio, Console, etc.)
2. **Update `~/.aws/credentials`** with the new credentials
3. **Sync to React app**:
   ```bash
   npm run sync-creds
   ```
4. **Restart the application**:
   ```bash
   # Stop current app (Ctrl+C)
   npm run dev
   ```

### Sync Script Features

- ✅ **Automatic parsing** of `~/.aws/credentials` file
- ✅ **Multi-line session token support** (handles long tokens correctly)
- ✅ **React environment variable format** conversion
- ✅ **Default region handling** (uses `us-east-1` if not specified)
- ✅ **Error handling** with helpful messages

### Manual Credential Update

If you prefer manual updates, edit `.env.local` directly:

```bash
# Update these values when credentials expire
REACT_APP_AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
REACT_APP_AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
REACT_APP_AWS_SESSION_TOKEN=IQoJb3JpZ2luX2VjEHoaCXVzLWVhc3QtMSJHMEUCIQDEXAMPLETOKEN...
REACT_APP_AWS_REGION=us-east-1
```

## 🏗️ Application Architecture

### Technology Stack
- **React 18** - Modern React with hooks and concurrent features
- **AWS SDK v3** - Latest AWS SDK for JavaScript with marketplace clients
- **Cloudscape Design System** - AWS-native UI components
- **React Router v6** - Client-side routing with HashRouter for GitHub Pages
- **Express.js Server** - Local API proxy for development
- **Custom API Integration** - Direct Lambda function calls for agreement search

### Project Structure
```
src/
├── apps/                           # Application modules
│   ├── opportunityManagement/      # Opportunity Management App
│   │   └── components/            # 39 components for opportunity workflows
│   │       ├── OpportunitiesList.js
│   │       ├── CreateOpportunity.js
│   │       ├── OffersList.js
│   │       ├── CreatePrivateOffer.js
│   │       ├── ListEngagementInvitations.js
│   │       ├── ProductsList.js
│   │       ├── ListAgreements.js
│   │       └── ... (32 more components)
│   └── offerAutomation/            # Offer Automation App
│       └── components/            # 15 components for offer automation
│           ├── Home.js
│           ├── Layout.js
│           ├── CreatePrivateOffer.js
│           ├── PublishSaaSProduct.js
│           └── ... (7 more components)
├── shared/                         # Shared resources
│   ├── components/                # Shared UI components
│   │   └── ApiTestInterface.js
│   └── utils/                     # Shared utilities
│       ├── payloadTemplates.js
│       └── awsClients.js
├── utils/                          # Core utilities
│   ├── sessionStorage.js
│   ├── commonUtils.js
│   └── opportunityUtils.js
├── config/                         # Application configuration
│   └── config.js
├── services/                       # API service layer
│   └── api.js
└── App.js                         # Main application router
```

### Application Architecture Benefits

#### **🎯 Clean Separation of Concerns**
- **App-Specific Components**: Each app has its own dedicated component directory
- **Shared Resources**: Common utilities and components in shared directories
- **Zero Duplication**: No duplicate code between applications
- **Clear Boundaries**: Easy to understand which components belong to which app

#### **🚀 Scalable Development**
- **Independent Development**: Teams can work on different apps simultaneously
- **Modular Architecture**: Easy to add new apps or modify existing ones
- **Future-Ready**: Simple to extract apps into separate repositories
- **Maintainable**: Clear file organization makes debugging and updates easier

#### **📦 Component Distribution**
- **Opportunity Management**: 39 components handling the full opportunity lifecycle
- **Offer Automation**: 15 components focused on streamlined offer creation
- **Shared Components**: 1 shared component for common functionality
- **Total**: 55 components organized across logical boundaries

### Security Architecture
- **Environment Variables**: Sensitive data in `.env.local` (never committed)
- **Session Storage**: Temporary credential storage, cleared on logout
- **Git Ignore**: All sensitive files automatically excluded
- **Local API Server**: Express.js server for AWS API proxy (eliminates CORS issues)
- **Production Security**: Auto-login disabled in production builds
- **Credential Isolation**: Development credentials never embedded in deployed builds

### Local Development Architecture
- **React App** (Port 3000): Frontend application with AWS Cloudscape UI
- **Express Server** (Port 3001): Local API proxy for AWS Marketplace Agreement API
- **AWS Integration**: Direct AWS SDK calls from local server (bypasses browser CORS restrictions)
- **Credential Management**: Shared credentials between React app and Express server
- **Modular Apps**: Two distinct applications with shared utilities
- **Hot Reloading**: Both server and React app support live development

## 🏢 Dual-App Architecture

This application features a **dual-app architecture** with two distinct applications sharing common utilities:

### 🎯 **Opportunity Management App** (39 Components)
**Primary Focus**: Complete AWS Partner Central opportunity lifecycle management

**Key Features**:
- Full opportunity CRUD operations (Create, Read, Update, Delete)
- AWS Marketplace offer creation and management
- Partner engagement invitation workflows
- Product catalog management and SaaS publishing
- Agreement search and analysis
- Real-time change set monitoring

**Target Users**: AWS Partners managing complex opportunity workflows

### ⚡ **Offer Automation App** (15 Components)  
**Primary Focus**: Streamlined, automated offer creation workflows

**Key Features**:
- Simplified offer creation interface
- Automated workflow templates
- Quick opportunity-to-offer conversion
- Opportunity management (create, get, update, associate)
- AWS review simulation and workflow testing
- Solution discovery and listing
- Streamlined product publishing
- Agreement search and analysis
- Focused automation tools

**Target Users**: Partners needing fast, efficient offer creation

### 🔄 **Shared Infrastructure**
Both apps share:
- **Common Utilities**: Session management, AWS clients, payload templates
- **Shared Services**: API layer, configuration management
- **UI Components**: Reusable interface elements
- **Security Model**: Unified credential and session management

### 🚀 **Benefits of This Architecture**
- **Specialized Workflows**: Each app optimized for specific use cases
- **Code Reusability**: Shared utilities eliminate duplication
- **Independent Development**: Teams can work on apps separately
- **Scalable Growth**: Easy to add new apps or extract existing ones
- **User Choice**: Users can access the app that best fits their needs

## 📱 Application Features

### 🏢 Products Section - AWS Marketplace SaaS Product Management

#### **📋 Products List**
- **View All Products**: Complete catalog of your SaaS products in AWS Marketplace
- **Product Status**: Active, draft, and published product states
- **Quick Actions**: Navigate to product details, edit, or create offers
- **Search & Filter**: Find products by name, ID, or status
- **Real-time Data**: Live product information from AWS Marketplace Catalog API

#### **📄 Product Details**
- **Comprehensive Information**: Product title, descriptions, categories, and metadata
- **Pricing Models**: Contract, subscription, and usage-based pricing details
- **Dimensions**: View entitled and metered dimensions with pricing
- **Offer History**: All offers created for this product
- **Change Set Tracking**: Monitor product updates and modifications
- **Logo & Media**: Product logos and additional resources display

#### **🚀 Publish SaaS Product** - Complete Product Creation Workflow
- **Product Information**:
  - Product title and descriptions (short/long)
  - Support descriptions and contact information
  - Product categories and search keywords
  - Product highlights and key features
  - Logo URL integration (AWS S3 hosted)

- **Pricing Configuration**:
  - **Contract Pricing Model**: ConfigurableUpfrontPricingTerm
  - **Multiple Rate Cards**: 1-month ($20/$25) and 12-month ($150/$300) options
  - **Flexible Constraints**: Multiple dimension selection and quantity configuration
  - **Currency Support**: USD pricing with extensible currency options

- **Dimensions Management** (6 Total Dimensions):
  - **Entitled Dimensions** (3):
    - `dimension_1_id` - "Dimension 1" 
    - `dimension_2_id` - "Dimension 2"
    - `dimension_3_id` - "Dimension 3"
  - **Externally Metered Dimensions** (3):
    - `metered_1_id` - "metered 1"
    - `metered_2_id` - "metered 2" 
    - `metered_3_id` - "metered 3"

- **Delivery Options**:
  - SaaS URL delivery with fulfillment endpoint configuration
  - Custom fulfillment URL setup for your SaaS application
  - Integration with AWS Marketplace SaaS integration APIs

- **Legal & Compliance**:
  - **Legal Terms**: Standard EULA (2022-07-14 version)
  - **Support Terms**: Custom refund policies and support descriptions
  - **Renewal Terms**: Auto-renewal configuration (disabled by default)

- **Targeting & Availability**:
  - **Buyer Account Targeting**: Specific AWS account targeting
  - **Geographic Availability**: Region-based availability controls
  - **Release Management**: Automatic product and offer release

### 💼 Offers Section - AWS Marketplace Offer Management

#### **📋 Offers List**
- **Complete Offer Catalog**: All private and public offers across your products
- **Offer Types**: Private offers, CPPO, public offers, and future-dated offers
- **Status Tracking**: Draft, active, expired, and pending offers
- **Buyer Information**: Target buyer accounts and contact details
- **Pricing Summary**: Quick pricing overview and terms
- **Change Set Status**: Real-time offer creation and modification status

#### **💼 Create Private Offer** - Standard Private Offer Creation
- **Buyer Targeting**: Specific AWS account ID targeting
- **Product Selection**: Choose from your published SaaS products
- **Custom Pricing**: Override standard pricing with private rates
- **Flexible Terms**: Custom contract lengths and payment terms
- **Availability Windows**: Set offer start and end dates
- **Legal Customization**: Custom legal terms and conditions

#### **📅 Create Private Offer (Future Service Date)**
- **Deferred Start Dates**: Offers that activate on future dates
- **Service Commencement**: Specify when service delivery begins
- **Payment Scheduling**: Align payments with service start dates
- **Buyer Communication**: Automated notifications for future activations
- **Contract Management**: Handle pre-service contract negotiations

#### **🏢 Create CPPO (Channel Partner Private Offers)**
- **Channel Partner Integration**: Offers specifically for AWS channel partners
- **Reseller Pricing**: Special pricing for authorized resellers
- **Partner Margins**: Configure partner commission structures
- **Volume Discounts**: Tiered pricing based on commitment levels
- **Partner Onboarding**: Streamlined partner enrollment process

#### **📊 Offer Details**
- **Complete Offer Information**: All offer terms, pricing, and conditions
- **Buyer Journey**: Track offer acceptance and activation status
- **Payment Terms**: Detailed payment schedules and billing information
- **Legal Documentation**: Access to all legal terms and agreements
- **Modification History**: Complete audit trail of offer changes

#### **🔍 Describe Change Set** - Real-time Operation Monitoring
- **Change Set Tracking**: Monitor AWS Marketplace API operations
- **Status Updates**: Real-time progress of offer creation and modifications
- **Error Handling**: Detailed error messages and resolution guidance
- **Retry Logic**: Automatic retry for transient failures
- **Success Confirmation**: Verification of successful operations

### Opportunities Section
- **📋 List Opportunities**: View all partner opportunities
- **👁️ Get Opportunity**: Detailed opportunity information with update capability
- **➕ Create Opportunity**: Partner-originated opportunity creation
- **🔄 Simulate Review**: AWS review simulation
- **🏢 Create AWS Opportunity**: AWS-originated opportunities
- **👥 Assign Opportunity**: Opportunity assignment workflows
- **🔗 Associate Opportunity**: Link opportunities with:
  - Solutions
  - AWS Products
  - AWS Marketplace Private Offers (with correct `AwsMarketplaceOffers` entity type)

### Engagements Section
- **📋 List Engagement Invitations**: View all invitations
- **👁️ Get Engagement Invitation**: Detailed invitation information
- **✅ Accept Engagement**: Accept collaboration invitations
- **❌ Reject Engagement**: Decline invitations with reasons
- **🚀 Start Engagement**: Initiate engagement from opportunities

### 📊 Agreements Section - AWS Marketplace Agreement Management

#### **🔍 Search Agreements** - Advanced Agreement Discovery
- **Custom Lambda API Integration**:
  - **CORS Bypass**: Custom Lambda function at `https://5zu65cuqg2.execute-api.us-east-1.amazonaws.com/Prod/search-agreements`
  - **Direct AWS Integration**: Lambda function calls AWS Marketplace Agreement API directly
  - **Real-time Results**: Fast agreement search without browser CORS restrictions
  - **Secure Authentication**: Lambda handles AWS credentials and authentication

- **Search Capabilities**:
  - **Offer ID Filtering**: Find agreements for specific marketplace offers
  - **Account ID Filtering**: Search by acceptor (buyer) AWS account ID
  - **Agreement Type Filtering**: Focus on PurchaseAgreements specifically
  - **Party Type Filtering**: Search from proposer (seller) perspective
  - **Combined Filters**: Multiple filter criteria for precise results

- **Agreement Information Display**:
  - **Agreement ID**: Unique identifier for each marketplace agreement
  - **Agreement Type**: PurchaseAgreement, SubscriptionAgreement, etc.
  - **Status**: ACTIVE, EXPIRED, TERMINATED, REPLACED agreement states
  - **Timeline Information**:
    - **Start Time**: When the agreement became effective
    - **End Time**: Agreement expiration or termination date
    - **Acceptance Time**: When the buyer accepted the offer
  - **Party Details**:
    - **Proposer Account**: Seller AWS account information
    - **Acceptor Account**: Buyer AWS account information
  - **Offer Context**: Related offer ID and product information

- **User Experience Features**:
  - **Real-time Search**: Instant results as you type search criteria
  - **Responsive Table**: Sortable columns and responsive design
  - **Status Indicators**: Color-coded badges for agreement status
  - **Date Formatting**: Human-readable date and time displays
  - **Error Handling**: Clear error messages for invalid searches
  - **Loading States**: Progress indicators during API calls

- **Technical Implementation**:
  - **AWS SDK Integration**: Uses AWS Marketplace Agreement API
  - **JSON Payload**: `{"offer_ids": ["offer-id"], "acceptor_account_ids": ["account-id"]}`
  - **Response Processing**: Handles `agreementViewSummaries` response structure
  - **Error Recovery**: Graceful handling of API failures and timeouts

## 🚀 Deployment Options

### 🚨 **CRITICAL SECURITY WARNING**

**NEVER deploy with auto-login enabled!** Your AWS credentials would be publicly accessible to anyone on the internet.

### Security-First Deployment Process

#### Before Deploying to GitHub Pages:

1. **Verify Auto-Login is Disabled**:
   ```bash
   # Check that auto-login is properly configured for production
   grep -n "SkipLogin.*NODE_ENV" src/config/config.js
   # Should show: SkipLogin: process.env.NODE_ENV === 'development' && process.env.REACT_APP_AWS_ACCESS_KEY_ID
   ```

2. **Verify .env.local is Git-Ignored**:
   ```bash
   # Ensure credentials file is not tracked by git
   git check-ignore .env.local && echo "✅ .env.local is safely ignored" || echo "⚠️ WARNING: .env.local is not ignored!"
   ```

3. **Use Safe Build Command**:
   ```bash
   # This removes .env.local before building (prevents credential embedding)
   npm run build-safe
   ```

4. **Verify No Credentials in Build**:
   ```bash
   # Check that no credentials are embedded in the build files
   grep -r "ASIA\|AKIA\|aws_access_key" build/ || echo "✅ No credentials found in build - safe to deploy"
   ```

5. **Test Production Build Locally** (Optional):
   ```bash
   # Serve the build locally to test that login form appears
   npx serve -s build -l 8080
   # Visit http://localhost:8080 - should show manual login form, not auto-login
   ```

### Option 1: GitHub Pages (Secure Deployment)

Perfect for sharing demos and prototypes:

1. **Update package.json** - Set the homepage URL:
   ```json
   {
     "homepage": "https://YOUR_USERNAME.github.io/YOUR_REPO_NAME"
   }
   ```

2. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Under "Source", select "GitHub Actions"

3. **Secure Build and Deploy**:
   ```bash
   # Step 1: Final security verification
   echo "🔍 Running final security checks..."
   grep -n "SkipLogin.*NODE_ENV" src/config/config.js
   git check-ignore .env.local && echo "✅ Credentials file ignored"
   
   # Step 2: Build without credentials
   echo "🏗️ Building safely..."
   npm run build-safe
   
   # Step 3: Verify build security
   echo "🔒 Verifying build security..."
   grep -r "ASIA\|AKIA\|aws_access_key" build/ || echo "✅ Build is secure"
   
   # Step 4: Commit and deploy
   echo "🚀 Deploying to GitHub Pages..."
   git add .
   git commit -m "Secure deployment without credentials"
   git push origin main
   ```

4. **Access your app**: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`
   - ✅ **Auto-login will be disabled** (secure)
   - ✅ **Users must enter their own credentials** via login form
   - ✅ **No credentials embedded** in the deployed code
   - ✅ **Both apps included** in single deployment
   - ✅ **All 55 components** available in production build

### 📋 **Deployment Security Checklist**

Before every deployment, verify:

- [ ] **Config Check**: `grep -n "SkipLogin.*NODE_ENV" src/config/config.js` shows environment detection
- [ ] **Git Ignore**: `git check-ignore .env.local` returns success
- [ ] **Safe Build**: Used `npm run build-safe` (not `npm run build`)
- [ ] **Credential Scan**: `grep -r "ASIA\|AKIA" build/` returns no results
- [ ] **Test Locally**: `npx serve -s build -l 8080` shows manual login form
- [ ] **Repository Clean**: No `.env.local` or credential files in git history

### 🚨 **If You Accidentally Deploy with Credentials**

If you accidentally deployed with credentials embedded:

1. **Immediate Action**:
   ```bash
   # Rotate your AWS credentials immediately
   aws iam create-access-key --user-name YOUR_USERNAME
   aws iam delete-access-key --access-key-id OLD_ACCESS_KEY --user-name YOUR_USERNAME
   ```

2. **Clean Deployment**:
   ```bash
   # Remove credentials and redeploy
   rm -f .env.local
   npm run build-safe
   git add . && git commit -m "Remove credentials" && git push
   ```

3. **Verify Security**: Check that the new deployment shows manual login form

### Option 2: Local Development

```bash
npm start  # Development server at http://localhost:3000
npm run build  # Production build (includes both apps)
```

### Build Architecture

The production build process:
- **Compiles Both Apps**: All components from both applications included
- **Optimizes Shared Code**: Shared utilities automatically deduplicated  
- **Single Bundle**: One deployable package containing both applications
- **Route-Based Access**: Users access different apps via URL routes
- **Shared Assets**: Common resources optimized for minimal bundle size

**Build Output**:
- Total Components: 50 (39 + 11)
- Shared Utilities: Automatically optimized
- Bundle Size: Optimized with code splitting
- Deployment: Single static site deployment

## ⚙️ Configuration

### Auto-Login Configuration

Edit `src/config/config.js`:

```javascript
export const config = {
  Internal: true,        // Enable advanced features
  SkipLogin: true       // Enable auto-login with .env.local
};
```

### Environment Variables

All environment variables for React must be prefixed with `REACT_APP_`:

```bash
# Required for auto-login
REACT_APP_AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
REACT_APP_AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
REACT_APP_AWS_SESSION_TOKEN=IQoJb3JpZ2luX2VjEHoaCXVzLWVhc3QtMSJHMEUCIQDEXAMPLETOKEN...
REACT_APP_AWS_REGION=us-east-1
```

## 🔄 Complete Development Workflow

### Daily Development Process

1. **Start Development Environment**:
   ```bash
   # Option A: Start both services together (RECOMMENDED)
   npm run dev
   
   # Option B: Start separately
   npm run server  # Terminal 1
   npm start       # Terminal 2
   ```

   **Stop Services**:
   ```bash
   # Normal stop: Press Ctrl+C
   # Kill stuck servers: lsof -ti:3000,3001 | xargs kill -9
   ```

2. **When Credentials Expire** (Common with temporary credentials):
   ```bash
   # Step 1: Get new credentials from AWS source
   # Step 2: Update ~/.aws/credentials with new credentials
   # Step 3: Sync credentials to React app
   npm run sync-creds
   # Step 4: Restart React app (server will pick up new creds automatically)
   ```

3. **Testing Agreement Search**:
   - Navigate to "Agreements" section in the app
   - Enter offer ID and acceptor account ID
   - Search should return results from local server
   - Check browser network tab to confirm calls to `localhost:3001`

4. **Debugging Issues**:
   - Check server terminal for AWS API logs
   - Test server health: `http://localhost:3001/health`
   - Verify credentials: `aws sts get-caller-identity`
   - Check React app console for client-side errors

### Development vs Production

| Environment | Agreement API | Credentials | CORS |
|-------------|---------------|-------------|------|
| **Development** | Local Express Server (port 3001) | `~/.aws/credentials` | No issues |
| **Production** | External API Gateway + Lambda | Embedded in build | Custom headers |

### File Structure for Local Development

```
opportunityManagement/
├── server.js                                    # Express server for local development
├── src/
│   ├── apps/
│   │   ├── opportunityManagement/components/   # 39 opportunity management components
│   │   └── offerAutomation/components/         # 11 offer automation components
│   ├── shared/                                 # Shared components and utilities
│   ├── utils/                                  # Core utilities (sessionStorage, etc.)
│   ├── config/                                 # Application configuration
│   └── services/                               # API service layer
├── ~/.aws/credentials                          # AWS credentials (shared)
├── .env.local                                  # React environment variables
└── package.json                                # Scripts for server and dev workflow
```

## 🎓 Workshop Studio Integration

### Important: Credential Requirements

This application requires **special AWS credentials** with AWS Marketplace and Partner Central API permissions. Regular AWS Workshop Studio credentials will **NOT** work.

#### Credential Sources:
- **AWS Marketplace Seller Account**: Registered seller account credentials
- **AWS Partner Central Access**: Through AWS Partner Network (APN)
- **Workshop Instructor**: Pre-configured marketplace credentials
- **AWS Support**: Marketplace API access setup

#### Workshop Setup Process:

1. **Get marketplace credentials** (separate from Workshop Studio)
2. **Add to `~/.aws/credentials`**:
   ```ini
   [default]
   aws_access_key_id = AKIAIOSFODNN7EXAMPLE
   aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   aws_session_token = IQoJb3JpZ2luX2VjEHoaCXVzLWVhc3QtMSJHMEUCIQDEXAMPLETOKEN...
   region = us-east-1
   ```
3. **Sync credentials**:
   ```bash
   npm run sync-creds
   ```
4. **Start application**:
   ```bash
   npm run dev
   ```

## 🛠️ Available Scripts

```bash
# Development (RECOMMENDED)
npm run dev           # ⭐ Start both React app (3000) + Express server (3001)

# Development (Individual Services)
npm start             # ⚠️  Start ONLY React app (3000) - List Agreements won't work
npm run server        # Start ONLY Express server (3001)

# Stop Services
# Normal stop: Press Ctrl+C when running "npm run dev"
# Kill stuck servers: lsof -ti:3000,3001 | xargs kill -9  # macOS/Linux
# Kill stuck servers: taskkill /F /IM node.exe             # Windows

# Build & Test
npm run build         # Create production build (includes both apps)
npm run build-safe    # Secure production build (removes credentials)
npm test              # Run tests

# Credentials Management
npm run sync-creds    # Sync AWS credentials from ~/.aws/credentials

# Deployment
npm run deploy        # Deploy to GitHub Pages
npm run build-harmony-app  # Build for AWS Harmony

# ⚠️ IMPORTANT NOTES:
# - Use "npm run dev" for full functionality
# - "npm start" alone will NOT start the Express server
# - List Agreements feature requires Express server on port 3001
# - The build process compiles both apps into a single deployable bundle
```

## 🐛 Troubleshooting

### Common Issues

#### ❌ Auto-Login Not Working
- ✅ Check `.env.local` exists in project root
- ✅ Verify environment variables start with `REACT_APP_`
- ✅ Restart development server after credential changes
- ✅ Check browser console for error messages

#### ❌ API Access Denied
- ✅ **Most Common**: Using Workshop Studio instead of marketplace credentials
- ✅ Verify credentials have AWS Marketplace and Partner Central permissions
- ✅ Check AWS region matches marketplace setup
- ✅ Ensure session token is not expired
- ✅ Use `npm run sync-creds` for automatic credential sync

#### ❌ Credentials Sync Issues
- ✅ Verify `~/.aws/credentials` file exists and has `[default]` section
- ✅ Check credentials are properly formatted (no extra spaces)
- ✅ Ensure Node.js can read the credentials file
- ✅ Run sync script with: `npm run sync-creds`

#### ❌ Agreement Search Not Working
- ✅ **Check Local Server**: Ensure Express server is running on port 3001
- ✅ **Test Server Health**: Visit `http://localhost:3001/health`
- ✅ **Check Server Logs**: Look at terminal running `npm run server` for error messages
- ✅ **Verify Credentials**: Ensure `~/.aws/credentials` has valid, non-expired credentials
- ✅ **Test Direct API**: Use curl to test server endpoint directly
- ✅ **Port Conflicts**: Ensure port 3001 is not used by other applications

#### ❌ Server Management & Port Issues

**Stop All Services:**
```bash
# If running "npm run dev", simply press:
Ctrl+C

# This stops both React app and Express server
```

**Kill Stuck Servers (macOS/Linux):**
```bash
# Kill React development server (port 3000)
lsof -ti:3000 | xargs kill -9

# Kill Express server (port 3001)  
lsof -ti:3001 | xargs kill -9

# Kill both ports at once
lsof -ti:3000,3001 | xargs kill -9

# Alternative: Kill by process name
pkill -f "react-scripts start"
pkill -f "node server.js"
```

**Kill Stuck Servers (Windows):**
```bash
# Kill React development server (port 3000)
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Kill Express server (port 3001)
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F
```

**Check What's Running on Ports:**
```bash
# macOS/Linux
lsof -i :3000  # Check React app port
lsof -i :3001  # Check Express server port

# Windows  
netstat -ano | findstr :3000
netstat -ano | findstr :3001
```

#### ❌ Local Server Won't Start
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill process using port 3001
kill -9 $(lsof -t -i:3001)

# Restart server
npm run server
```

#### ❌ Server API Calls Failing
```bash
# Test server health
curl http://localhost:3001/health

# Test agreement search
curl -X POST http://localhost:3001/search-agreements \
  -H "Content-Type: application/json" \
  -d '{"offer_ids": ["offer-1234567890abcdef"], "acceptor_account_ids": ["123456789012"]}'

# Check AWS credentials
aws sts get-caller-identity
```

#### ❌ Build Errors
- ✅ Run `npm install` to install dependencies
- ✅ Check Node.js version (requires 18+)
- ✅ Clear npm cache: `npm cache clean --force`
- ✅ Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

### Debug Mode

Enable detailed logging by adding to `.env.local`:

```bash
REACT_APP_DEBUG=true
```

## 🔒 Security Best Practices

### 🚨 **CRITICAL: Deployment Security**

#### **Development vs Production Security Model**

| Environment | Auto-Login | Credentials | Security Level |
|-------------|------------|-------------|----------------|
| **Development** | ✅ Enabled | `.env.local` (local only) | 🟢 Secure |
| **Production** | ❌ Disabled | User-provided (login form) | 🟢 Secure |
| **⚠️ WRONG** | ✅ Enabled | `.env.local` (in build) | 🔴 **DANGEROUS** |

#### **How Security Protection Works**

1. **Development Mode** (`npm start`):
   - `NODE_ENV=development` 
   - Auto-login enabled with local credentials
   - Credentials never leave your machine

2. **Production Build** (`npm run build-safe`):
   - `NODE_ENV=production`
   - Auto-login automatically disabled
   - `.env.local` removed before build
   - No credentials embedded in JavaScript

3. **Deployed App**:
   - Shows manual login form
   - Users enter their own credentials
   - Credentials stored in browser session only

### Implemented Security Measures
- **Environment Detection**: Auto-login disabled in production builds
- **Credential Removal**: `build-safe` script removes `.env.local` before building
- **Git Ignore**: `.env.local` automatically excluded from version control
- **Session Storage**: Temporary credential storage only
- **CORS Handling**: Local Express server for development, manual login for production
- **Error Suppression**: ResizeObserver warnings suppressed for cleaner console

### Security Verification Commands

```bash
# Verify auto-login is disabled in production
grep -n "SkipLogin.*NODE_ENV" src/config/config.js

# Check for credentials in build (should return nothing)
npm run build-safe
grep -r "ASIA\|AKIA\|aws_access_key" build/ || echo "✅ Build is secure"

# Verify .env.local is git-ignored
git check-ignore .env.local && echo "✅ .env.local is ignored"
```

### Security Recommendations
- **🚫 Never use `npm run build`** for deployment (use `npm run build-safe`)
- **⚠️ Always verify** no credentials in build before deploying
- **🔐 Never commit** `.env.local` or credential files
- **⏰ Use temporary credentials** when possible
- **🔄 Rotate credentials** regularly
- **📊 Monitor API usage** for unauthorized access
- **👥 Use least privilege** principle for AWS permissions

## 📚 API Integration Details

### AWS SDK v3 Clients Used
- **PartnerCentralSellingClient**: Opportunity and engagement management
- **MarketplaceCatalogClient**: Product and offer management
- **Custom Lambda Functions**: Agreement search (CORS bypass)

### API Endpoints
- **Partner Central**: Opportunity lifecycle management
- **Marketplace Catalog**: Product and offer operations
- **Agreement API**: Local Express server proxy for search functionality

### Local Server Implementation

The Express server (`server.js`) provides a local alternative to the deployed Python Lambda function:

#### Python Lambda (Production)
```python
import boto3

def lambda_handler(event, context):
    client = boto3.client('marketplace-agreement')
    response = client.search_agreements(
        catalog='AWSMarketplace',
        filters=filters
    )
    return response
```

#### Node.js Express (Development)
```javascript
const { MarketplaceAgreementClient, SearchAgreementsCommand } = require('@aws-sdk/client-marketplace-agreement');

app.post('/search-agreements', async (req, res) => {
  const client = new MarketplaceAgreementClient({
    region: 'us-east-1',
    credentials: fromIni({ profile: 'default' })
  });
  
  const command = new SearchAgreementsCommand({
    catalog: 'AWSMarketplace',
    filters: filters
  });
  
  const response = await client.send(command);
  res.json(response);
});
```

#### Key Differences
- **Python**: Uses `boto3.client('marketplace-agreement')`
- **Node.js**: Uses `@aws-sdk/client-marketplace-agreement` with `MarketplaceAgreementClient`
- **Credentials**: Python uses Lambda execution role, Node.js uses `~/.aws/credentials`
- **Deployment**: Python runs on AWS Lambda, Node.js runs locally
- **CORS**: Python needs API Gateway CORS config, Node.js has built-in CORS middleware

### Error Handling
- **Comprehensive error messages** with actionable guidance
- **Retry logic** for transient failures
- **Loading states** for better user experience
- **Graceful degradation** when APIs are unavailable

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly with marketplace credentials
5. Commit changes: `git commit -m 'Add feature'`
6. Push to branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This sample code is made available under the MIT-0 license. See the LICENSE file.

## 🆘 Getting Help

- **Check browser console** (F12) for detailed error messages
- **Review credential setup** using `npm run sync-creds`
- **Verify AWS permissions** for Partner Central and Marketplace APIs
- **Test with CLI first**: `aws partnercentral-selling list-opportunities --catalog Sandbox`
- **Contact AWS Support** for marketplace API access issues

---

**Built with ❤️ for AWS Partners**