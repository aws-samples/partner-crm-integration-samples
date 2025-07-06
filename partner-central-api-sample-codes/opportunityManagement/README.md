# AWS Partner Central API - Opportunity Management Sample

A React-based web application demonstrating AWS Partner Central API integration for opportunity management.

## Features

- **Opportunity Management**: Create, view, edit, and list opportunities
- **AWS Originated Opportunity Creation**: Specialized workflow for simulating AWS originated opportunities  
- **Opportunity Association**: Associate solutions, AWS products, AWS Marketplace private offer to the opportunities
- **Assignment Management**: Assign team members to the opportunities
- **Engagement Invitations**: Handle engagement invitation workflows
- **Simulation of review from AWS**: Simulate opportunity review processes from AWS

## Live Demo

🚀 **[View Live Application](https://aws-samples.github.io/partner-crm-integration-samples/)**

### Demo Video
https://github.com/aws-samples/partner-crm-integration-samples/raw/main/partner-central-api-sample-codes/opportunityManagement/docs/demo.mp4

## Getting Started

### Prerequisites

- Node.js 18+
- AWS credentials with Partner Central API access

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

### Build

```bash
npm run build
```

## GitHub Pages Deployment

This application is automatically deployed to GitHub Pages using GitHub Actions.

### Setup Summary

1. **Package.json Configuration**:
   ```json
   {
     "homepage": "https://aws-samples.github.io/partner-crm-integration-samples",
     "scripts": {
       "build": "GENERATE_SOURCEMAP=false react-scripts build"
     },
     "eslintConfig": {
       "rules": {
         "no-unused-vars": "warn",
         "jsx-a11y/anchor-is-valid": "warn"
       }
     },
     "overrides": {
       "uglify-js": "^3.17.4",
       "postcss": "^8.4.31",
       "webpack-dev-server": "^4.15.2",
       "nth-check": "^2.1.1"
     }
   }
   ```

2. **Router Configuration**: Uses `HashRouter` instead of `BrowserRouter` for GitHub Pages compatibility

3. **GitHub Actions Workflow** (`.github/workflows/deploy-opportunity-management.yml`):
   - Triggers on changes to `partner-central-api-sample-codes/opportunityManagement/**`
   - Builds React app with `CI=false` to treat ESLint warnings as warnings
   - Deploys to GitHub Pages automatically

4. **Security Fixes**: Added dependency overrides to resolve vulnerabilities

### Deployment Process

1. Make changes to the React app
2. Commit and push to main branch
3. GitHub Actions automatically builds and deploys
4. App is live at: https://aws-samples.github.io/partner-crm-integration-samples/

### Key Files

- `package.json` - Build configuration and dependencies
- `src/App.js` - Router configuration (HashRouter)
- `.github/workflows/deploy-opportunity-management.yml` - Deployment workflow
- `README.md` - Documentation

## AWS Partner Central API Integration

This application integrates with the AWS Partner Central Selling API to provide:

- Opportunity lifecycle management
- Partner engagement workflows
- CRM integration capabilities
- Real-time opportunity tracking

## Architecture

Built with:
- **React 18** - Frontend framework
- **AWS SDK** - Partner Central API integration
- **Cloudscape Design System** - AWS-native UI components
- **React Router** - Client-side routing

## Contributing

This is part of the [AWS Partner CRM Integration Samples](https://github.com/aws-samples/partner-crm-integration-samples) repository.

## License

This sample code is made available under the MIT-0 license. See the LICENSE file.