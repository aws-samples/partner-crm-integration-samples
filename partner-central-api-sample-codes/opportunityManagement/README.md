# AWS Partner Central API - Opportunity Management Sample

A React-based web application demonstrating AWS Partner Central API integration for opportunity management. The application starts with a login page where users can enter their AWS credentials to access the full functionality.

## Features

- **Agent Chat (MCP)**: Natural-language chat against the Partner Central Agent MCP Server, with human-in-the-loop approval for every write. Available as a standalone `/agent-chat` surface and as an embedded, opportunity-scoped panel on the detail screens.
- **Catalog selector**: Explicit Sandbox / AWS choice at login, applied to every API call with a visible catalog badge on mutating surfaces.
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

## Release notes

See [`CHANGELOG.md`](../../CHANGELOG.md) at the repo root for the full changelog.

### 0.3.0 — Agent Chat, HITL approvals, catalog selector

- **Agent Chat (new).** Conversational access to the [Partner Central Agent MCP Server](https://docs.aws.amazon.com/partner-central/latest/APIReference/partner-central-mcp-server.html) from a new left-nav entry (Agent Chat). Ask natural-language questions about your pipeline, opportunities, funding eligibility, and next steps. Every write operation pauses for a human-in-the-loop **Approval card** showing the proposed tool name and full parameter payload — the agent plans, the human approves.
- **Opportunity-scoped chat panel (new).** Both the *Get Opportunity* screen and the opportunity detail view now include a collapsed *Ask the agent about this opportunity* section below the tabs. Scoped to the opportunity you're viewing — funding, next-step, and summary prompts get context anchored automatically.
- **Catalog selector (now prominent).** Explicit `Sandbox` / `AWS (Production)` choice on the login form, defaulting to Sandbox. A **Test Sandbox Access** button issues a one-row `ListOpportunities` against Sandbox as a pre-flight credential probe. The selected catalog threads through every Partner Central API call, is displayed as a colored badge (blue Sandbox, red AWS) in the Agent Chat header, and is cleared on sign-out.
- **STS identity display.** The Agent Chat header shows the IAM ARN and account ID resolved from your credentials via `GetCallerIdentity` — quick visual confirmation of which identity is about to perform a write.
- **Documented quirk mitigations.** Short affirmative replies (`yes`, `proceed`, …), top-level classifier misses, post-approval classifier drift, and approval-echo loops all get one targeted silent retry with the opportunity ID anchored, per the mitigations catalog in the upstream porting guide. If a retry still misfires, the chat surfaces actionable rephrasing guidance instead of the server's off-topic canned reply.
- **Client identification.** Every `tools/call` sends an `_meta.integrator` / `_meta.sourceProduct` block, and `initialize` populates `clientInfo.integrator` / `clientInfo.sourceProduct`, per the [MCP getting started](https://docs.aws.amazon.com/partner-central/latest/APIReference/mcp-getting-started.html) recommendations.
- **Write-operation call-site cleanup.** Every `Catalog:` literal in components that previously hard-coded `"Sandbox"` now reads from session storage with a `"Sandbox"` fallback, so the catalog selector actually governs all writes.
- **Debugging affordances.** Every round-trip logs `[MCP] payload:` to console and stashes the unwrapped response on `window.__lastMcpPayload`; every approval submission stashes its body on `window.__lastMcpApprovalBody`.

**Required IAM.** The `partnercentral:UseSession` action is required for the Agent Chat feature. See [MCP getting started](https://docs.aws.amazon.com/partner-central/latest/APIReference/mcp-getting-started.html) for the full IAM policy (including managed-policy and read-only variants).

**New dependencies.** `@aws-sdk/signature-v4` and `@aws-crypto/sha256-browser` for browser-side SigV4 signing of MCP requests.

## License

This sample code is made available under the MIT-0 license. See the LICENSE file.