# AWS Partner Central API - Opportunity Management Sample

A React-based web application demonstrating AWS Partner Central API integration for opportunity management. The application starts with a login page where users can enter their AWS credentials to access the full functionality.

## Features

- **Opportunity Management**: Create, view, edit, and list opportunities
- **AWS Originated Opportunity Creation**: Specialized workflow for simulating AWS originated opportunities  
- **Opportunity Association**: Associate solutions, AWS products, AWS Marketplace private offer to the opportunities
- **Assignment Management**: Assign team members to the opportunities
- **Engagement Invitations**: Handle engagement invitation workflows
- **Simulation of review from AWS**: Simulate opportunity review processes from AWS

## Deployment Options

Choose between deploying a static information page or the full React application with login functionality.

### Option 1: Deploy Static Information Page (Default)

This deploys a simple HTML page with information about the application and setup instructions.

#### Step 1: Fork or Create Your Repository

1. **Fork this repository** or **create a new repository** on GitHub:
   - Repository name: `opportunityManagement` (or your preferred name)
   - Make it **public** (required for free GitHub Pages)

2. **Clone your repository**:
   ```bash
   git clone https://github.com/<your-username>/opportunityManagement.git
   cd opportunityManagement
   ```

#### Step 2: Configure and Deploy

1. **Update package.json** - Change the homepage URL:
   ```json
   {
     "homepage": "https://<your-username>.github.io/opportunityManagement"
   }
   ```
   Replace `<your-username>` with your actual GitHub username.

2. **Enable GitHub Pages**:
   - Go to your repository **Settings**
   - Navigate to **Pages** section
   - Select **Deploy from a branch**
   - Choose **main** branch and **/ (root)** folder

3. **Commit and push**:
   ```bash
   git add .
   git commit -m "Deploy static information page"
   git push origin main
   ```

4. **Access your deployed page**:
   Your static page will be live at `https://<your-username>.github.io/opportunityManagement`

### Option 2: Deploy Full React Application with Login Page

This deploys the complete React application where users can log in with AWS credentials.

#### Step 1: Fork or Create Your Repository

Same as Option 1 above.

#### Step 2: Prepare for React App Deployment

1. **Update package.json** - Change the homepage URL (same as Option 1)

2. **Replace index.html with React app version**:
   ```bash
   cp public/index-app.html public/index.html
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

#### Step 3: Deploy React Application

**Method A: Using npm deploy command**
```bash
# Build and deploy in one command
npm run deploy
```

**Method B: Using GitHub Actions (Recommended)**

1. **Enable GitHub Pages**:
   - Go to your repository **Settings**
   - Navigate to **Pages** section
   - Select **GitHub Actions** as source

2. **Commit and push**:
   ```bash
   git add .
   git commit -m "Deploy React app with login page"
   git push origin main
   ```

3. **Access your deployed app**:
   Your React app will be live at `https://<your-username>.github.io/opportunityManagement`

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The application will be available at `http://localhost:3000`

## Using the Application

1. **Login Page**: The front page is a login form where users enter their AWS credentials
2. **AWS Credentials**: Users need valid AWS credentials with Partner Central API access
3. **Full Functionality**: After login, users can access all opportunity management features

## Important Notes

- **Public Repository**: Your repository must be public for GitHub Pages on free accounts
- **AWS Credentials**: The app requires valid AWS credentials to function properly
- **Login Security**: Credentials are stored locally in the browser and not transmitted to GitHub
- **API Access**: Users need appropriate AWS permissions for Partner Central API

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