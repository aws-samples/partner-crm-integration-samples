# AWS Partner Central API - Opportunity Management Sample

A React-based web application demonstrating AWS Partner Central API integration for opportunity management.

## Features

- **Opportunity Management**: Create, view, edit, and list opportunities
- **AWS Originated Opportunity Creation**: Specialized workflow for simulating AWS originated opportunities  
- **Opportunity Association**: Associate solutions, AWS products, AWS Marketplace private offer to the opportunities
- **Assignment Management**: Assign team members to the opportunities
- **Engagement Invitations**: Handle engagement invitation workflows
- **Simulation of review from AWS**: Simulate opportunity review processes from AWS

## Setup Instructions

### Step 1: Clone the Application

```bash
# Clone the main repository
git clone https://github.com/aws-samples/partner-crm-integration-samples.git

# Navigate to the opportunity management folder
cd partner-crm-integration-samples/partner-central-api-sample-codes/opportunityManagement
```

### Step 2: Create Your Own Repository

1. **Create a new repository on GitHub**:
   - Go to https://github.com/new
   - Repository name: `opportunityManagement` (or your preferred name)
   - Make it public (required for free GitHub Pages)
   - Initialize with README (optional)

2. **Clone your new repository**:
   ```bash
   # Replace <your-username> with your GitHub username
   git clone git@github.com:<your-username>/opportunityManagement.git
   ```

3. **Copy the application files to your repository**:
   ```bash
   # Copy the opportunityManagement folder to your repo
   cp -r partner-crm-integration-samples/partner-central-api-sample-codes/opportunityManagement/* opportunityManagement/
   
   # Navigate to your repo and commit
   cd opportunityManagement
   git add .
   git commit -m "Add opportunity management application"
   git push origin main
   ```

### Step 3: Choose Deployment Option

#### Option 1: Local Development

```bash
# Replace index.html with React app version
cp public/index-app.html public/index.html

# Reset npm registry (if using AWS CodeArtifact)
npm config set registry https://registry.npmjs.org/
# Remove any CodeArtifact auth tokens (replace with your actual CodeArtifact URL if needed)
npm config delete //<your-codeartifact-domain>:_authToken

# Clean npm cache and reinstall dependencies
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Start development server
PUBLIC_URL="" npm start
```

The application will be available at `http://localhost:3000`

**Troubleshooting:**
- If you get permission errors with npm cache, run: `sudo chown -R $(whoami) ~/.npm`
- If you get authentication errors, ensure npm registry is reset to public registry
- If React app shows "Target container is not a DOM element", ensure you copied `index-app.html` to `index.html`

#### Option 2: Deploy to GitHub Pages

1. **Replace index.html with React app version**:
   ```bash
   cp public/index-app.html public/index.html
   ```

2. **Reset npm configuration and clean install**:
   ```bash
   # Reset npm registry (if using AWS CodeArtifact)
   npm config set registry https://registry.npmjs.org/
   # Remove any CodeArtifact auth tokens (replace with your actual CodeArtifact URL if needed)
   npm config delete //<your-codeartifact-domain>:_authToken
   
   # Clean and reinstall
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   ```

3. **Update package.json** - Change the homepage URL:
   ```json
   {
     "homepage": "https://<your-username>.github.io/opportunityManagement"
   }
   ```

4. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select "GitHub Actions" as source

5. **Create deployment workflow** - Add `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [ main ]
   permissions:
     contents: read
     pages: write
     id-token: write
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
       - uses: actions/checkout@v4
       - uses: actions/setup-node@v4
         with:
           node-version: '18'
       - run: cp public/index-app.html public/index.html
       - run: npm ci
       - run: npm run build
         env:
           CI: false
       - uses: actions/configure-pages@v4
       - uses: actions/upload-pages-artifact@v3
         with:
           path: './build'
       - uses: actions/deploy-pages@v4
   ```

6. **Commit and push** - Your app will be live at `https://<your-username>.github.io/opportunityManagement`

**Note:** 
- Your repository must be public for GitHub Pages on free accounts
- The deployed app will show the login page, same as local development
- Users can enter AWS credentials to access the full application functionality

### Prerequisites

- Node.js 18+
- AWS credentials with Partner Central API access

## Architecture

Built with:
- **React 18** - Frontend framework
- **AWS SDK** - Partner Central API integration
- **Cloudscape Design System** - AWS-native UI components
- **React Router** - Client-side routing

## License

This sample code is made available under the MIT-0 license. See the LICENSE file.