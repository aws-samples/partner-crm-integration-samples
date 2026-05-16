# Agent-to-Agent: Next Steps Generator

An AI orchestrator agent that communicates with the AWS Partner Central MCP Agent to automate opportunity management.

## Why Agent-to-Agent?

This application demonstrates **agent-to-agent communication** — a pattern where one AI agent delegates specialized tasks to another AI agent rather than calling APIs directly.

```
┌─────────────────────────────────────────────────────────────────┐
│                YOUR ORCHESTRATOR AGENT                          │
│  (Custom agent you build and control)                           │
│                                                                 │
│  • Gathers context from YOUR sources (Slack, files, uploads)    │
│  • Uses Claude AI to analyze and generate content               │
│  • Decides WHAT to update                                       │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ Agent-to-Agent Communication
                          │ (MCP Protocol)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              AWS PARTNER CENTRAL MCP AGENT                      │
│  (AWS-hosted agent with Partner Central expertise)              │
│                                                                 │
│  • Understands Partner Central domain & business rules          │
│  • Validates updates against PC requirements                    │
│  • Handles human-in-the-loop approval workflow                  │
│  • Executes the actual API calls to Partner Central             │
└─────────────────────────────────────────────────────────────────┘
```

**Key Difference from Direct API Calls:**
- Direct API: Your code → Partner Central API
- Agent-to-Agent: Your Agent → PC Agent → Partner Central API

**Benefits of Agent-to-Agent:**
1. **Domain Expertise**: The PC Agent understands business rules, validation requirements, and best practices
2. **Natural Language**: Communicate intent ("update next steps") rather than constructing API payloads
3. **Built-in Guardrails**: Human approval workflow, validation checks, error handling
4. **Reduced Complexity**: Your agent focuses on gathering context; the PC Agent handles PC-specific logic

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Orchestrator Agent                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Slack Reader │  │ File Reader  │  │Upload Handler│          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         └─────────────────┼─────────────────┘                   │
│                           ▼                                     │
│                 ┌─────────────────┐                             │
│                 │  Context Merger │                             │
│                 └────────┬────────┘                             │
│                          ▼                                      │
│                 ┌─────────────────┐                             │
│                 │ Claude AI Agent │                             │
│                 │ (Next Steps Gen)│                             │
│                 └────────┬────────┘                             │
│                          ▼                                      │
│                 ┌─────────────────┐                             │
│                 │ Partner Central │                             │
│                 │   MCP Client    │                             │
│                 └─────────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

## Features

- **Slack Integration**: Read messages from specified channels (optional)
- **Local File Reader**: Scan folders for relevant documents
- **File Upload**: Accept uploaded files for context
- **AI-Powered Generation**: Use Claude (via Amazon Bedrock) to create actionable next steps
- **MCP Integration**: Update Partner Central opportunities via the Partner Central Agent

## Prerequisites

1. **Python 3.10+**
2. **AWS CLI v2** installed and configured
   - macOS: download [AWSCLIV2.pkg](https://awscli.amazonaws.com/AWSCLIV2.pkg) or `brew install awscli`
   - Linux/Windows: see [AWS CLI install guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
   - Verify: `aws --version` should report `aws-cli/2.x.x`
3. **AWS credentials configured** — run `aws configure` (or SSO). Verify with `aws sts get-caller-identity`.
4. **Amazon Bedrock model access** enabled in `us-east-1` for Claude models
5. **IAM permissions** — the [`AWSPartnerCentralSandboxFullAccess`](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AWSPartnerCentralSandboxFullAccess.html) managed policy (or equivalent) covering Partner Central + MCP session management
6. **Sandbox partner registration** — your AWS account registered as a partner in the Sandbox catalog
7. **boto3 1.35.0+** — required for the `partnercentral-selling` client

> ⚠️ **Don't `curl` the Partner Central API directly.** All Partner Central endpoints require AWS SigV4-signed requests. A plain `curl` call returns `{"message":"Missing Authentication Token"}`. Use the AWS CLI (`aws partnercentral-...`) or boto3 — both sign for you automatically.

## AWS Account Setup

Before running the application, you need a configured AWS environment with:

1. **An IAM user** with credentials configured locally (`aws configure` done, verified by `aws sts get-caller-identity`)
2. **Bedrock model access** — Claude models enabled in `us-east-1`
3. **Partner Central permissions** — the `AWSPartnerCentralSandboxFullAccess` managed policy (or equivalent)
4. **Sandbox partner registration** — your AWS account registered as a partner in the Sandbox catalog

<details>
<summary><strong>Self-service setup (IAM user + policies + access key)</strong></summary>

If you don't already have an IAM user and access keys, your cloud admin (or you, if you admin your own account) can set them up:

```bash
# 1. Create the IAM user
aws iam create-user --user-name pcmcp-workshop-user

# 2. Attach Partner Central access (covers MCP session + all Sandbox PC actions)
aws iam attach-user-policy \
  --user-name pcmcp-workshop-user \
  --policy-arn arn:aws:iam::aws:policy/AWSPartnerCentralSandboxFullAccess

# 3. Attach inline Bedrock policy
aws iam put-user-policy \
  --user-name pcmcp-workshop-user \
  --policy-name BedrockInvokeClaude \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"],
      "Resource": ["arn:aws:bedrock:*::foundation-model/*", "arn:aws:bedrock:*:*:inference-profile/*"]
    }]
  }'

# 4. Create an access key — copy AccessKeyId and SecretAccessKey from output
#    (the secret is shown only once)
aws iam create-access-key --user-name pcmcp-workshop-user

# 5. Configure the CLI locally
aws configure
# AWS Access Key ID:     <paste AccessKeyId>
# AWS Secret Access Key: <paste SecretAccessKey>
# Default region name:   us-east-1
# Default output format: json

# 6. Verify
aws sts get-caller-identity
```

> ⚠️ **Never commit access keys to git.** Treat the secret key like a password. If it leaks, rotate immediately with `aws iam delete-access-key --user-name pcmcp-workshop-user --access-key-id AKIA...` and create a new one.

> 🔐 Use an IAM **user** only for this local workshop. For production or shared-account use, prefer IAM Identity Center (SSO) or an assumable IAM role.

</details>

<details>
<summary><strong>Register as an AWS Partner in Sandbox</strong></summary>

Before you can call any Partner Central API in Sandbox (including `list-opportunities`, `get-opportunity`, or the MCP `sendMessage` tool), your AWS account must be registered as a partner in the **Sandbox catalog**. Skipping this step causes `AccessDeniedException ... INCOMPATIBLE_BENEFIT_AWS_PARTNER_STATE` on every Partner Central call.

**One-time setup per AWS account** — subsequent users in the same account can skip this.

**Check if registration already exists:**

```bash
aws partnercentral-selling list-opportunities \
  --catalog Sandbox \
  --region us-east-1
```

- Get `INCOMPATIBLE_BENEFIT_AWS_PARTNER_STATE` → proceed below
- Get an opportunity list (even an empty `{"OpportunitySummaries": []}`) → you're done

**Create the partner registration:**

```bash
aws partnercentral-account create-partner \
  --region us-east-1 \
  --catalog Sandbox \
  --client-token "$(uuidgen || echo pcmcp-$(date +%s))" \
  --legal-name "YourCompanyName" \
  --primary-solution-type CONSULTING_SERVICES \
  --alliance-lead-contact '{
    "FirstName": "Your",
    "LastName": "Name",
    "Email": "your-email@example.com",
    "BusinessTitle": "Your Title"
  }' \
  --email-verification-code "123456"
```

Notes:
- For Sandbox, **no actual email verification is required** — any 6-digit value works (e.g., `123456`).
- `--client-token` must be unique per call. `uuidgen` or a timestamp works.
- These are test-only records in the Sandbox — they don't affect production Partner Central data.

**Verify registration:**

```bash
aws partnercentral-selling list-opportunities \
  --catalog Sandbox \
  --region us-east-1
```

An empty list is fine — what matters is no `INCOMPATIBLE_BENEFIT_AWS_PARTNER_STATE` error.

</details>

## Quick Start

```bash
# Clone the repository
git clone https://github.com/aws-samples/partner-crm-integration-samples.git
cd partner-crm-integration-samples/partner-central-api-sample-codes/agentToAgent

# Create virtual environment and install dependencies
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Verify boto3 version (needs 1.35.0+ for partnercentral-selling)
python -c "import boto3; print(f'boto3 version: {boto3.__version__}')"

# Verify full setup (AWS creds + Bedrock + Partner Central + MCP)
python verify_setup.py

# Run CLI
python orchestrator_agent.py \
  --opportunity-id O15081741 \
  --upload demo_meeting_notes.txt \
  --prompt "Generate next steps based on meeting notes"

# Or run as API server
python server.py
# API available at http://localhost:8001
```

> 💡 **Finding a valid opportunity ID:** Run `aws partnercentral-selling list-opportunities --catalog Sandbox --region us-east-1 --life-cycle-review-status '["Approved"]'` and copy an `Id` value from the response.

## CLI Usage

```bash
# Basic usage with uploaded file
python orchestrator_agent.py -o O15081741 -u demo_meeting_notes.txt -p "What are the next steps?"

# With Slack channel (requires SLACK_BOT_TOKEN env var)
python orchestrator_agent.py -o O15081741 -s partner-deals -p "Summarize recent discussions"

# With local folder
python orchestrator_agent.py -o O15081741 -f ./deal-notes -p "Generate action items"

# Dry run (generate but don't update the opportunity)
python orchestrator_agent.py -o O15081741 -u demo_meeting_notes.txt --dry-run

# Multiple sources
python orchestrator_agent.py -o O15081741 \
  -s partner-deals \
  -f ./notes \
  -u demo_meeting_notes.txt \
  -p "Create comprehensive next steps"
```

## API Usage

Start the server:
```bash
python server.py
```

### Endpoints

#### POST /api/generate
Generate next steps from inline notes.

```bash
curl -X POST http://localhost:8001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "opportunity_id": "O15081741",
    "prompt": "Generate next steps",
    "notes": "Met with customer today. They want to migrate to AWS by Q3. Need architectural review and MAP funding.",
    "update_opportunity": true
  }'
```

#### POST /api/generate-with-files
Generate with file uploads.

```bash
curl -X POST http://localhost:8001/api/generate-with-files \
  -F "opportunity_id=O15081741" \
  -F "prompt=Generate next steps from meeting notes" \
  -F "files=@demo_meeting_notes.txt" \
  -F "update_opportunity=true"
```

#### GET /api/opportunity/{id}
Fetch opportunity data.

```bash
curl http://localhost:8001/api/opportunity/O15081741
```

## Python API

```python
from orchestrator_agent import OrchestratorAgent

agent = OrchestratorAgent()

result = agent.run(
    opportunity_id="O15081741",
    prompt="What should be our next steps?",
    slack_channels=["partner-deals"],
    local_folders=["./notes"],
    uploaded_files=["demo_meeting_notes.txt"],
    update_opportunity=True
)

print(f"Success: {result.success}")
print(f"Next Steps:\n{result.next_steps}")
print(f"MCP Response: {result.mcp_response}")
```

## Configuration

### Config File

Uses `config.json` in the same directory, or specify with `--config`:

```json
{
  "catalog": "Sandbox",
  "region": "us-east-1",
  "endpoints": {
    "partnercentral_selling": "https://partnercentral-selling.us-east-1.api.aws",
    "partnercentral_mcp": "https://partnercentral-agents.us-east-1.api.aws/mcp"
  },
  "default_opportunity_id": "O12345678"
}
```

Set `catalog` to `"AWS"` for production or `"Sandbox"` for testing.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SLACK_BOT_TOKEN` | Slack bot token (`xoxb-...`) for channel access | Only for Slack integration |
| `AWS_PROFILE` | AWS profile for Bedrock and Partner Central | If using named profiles |

### Optional: Slack Integration

Slack is an **optional context source**. The agent can read recent messages from a public Slack channel and feed them into the next-steps generator alongside (or instead of) uploaded files. Skip this if you're only using file uploads.

> 🏢 **Enterprise workspaces** (e.g., `amazon-slack`) typically require admin approval for app installation. If you see *"Request to workspace install submitted"*, you're waiting on an admin. Create a free [personal Slack workspace](https://slack.com/get-started) where you're the admin, or just skip Slack — the core workflow works fine with `--upload`.

**Create a Slack bot token:**

1. Go to https://api.slack.com/apps → **Create New App → From scratch**. Pick a name and a workspace where you're an admin.
2. Go to **OAuth & Permissions** → under **Scopes → Bot Token Scopes**, add:
   - `channels:read` — list public channels and resolve names to IDs
   - `channels:history` — read messages in public channels
3. Click **Install to Workspace** and approve.
4. Copy the **Bot User OAuth Token** — **it must start with `xoxb-`**.
5. Invite the bot to target channels: `/invite @your-bot-name`

> 🔑 **Token format matters.** You need a `xoxb-...` bot token. These won't work: `xapp-...` (App-Level), `xoxp-...` (User OAuth), `xoxe.xoxp-...` (Slack CLI session). See [Slack token types](https://api.slack.com/concepts/token-types).

**Use it:**

```bash
export SLACK_BOT_TOKEN="xoxb-YOUR-BOT-TOKEN-HERE"

python orchestrator_agent.py \
  --opportunity-id O15081741 \
  --slack-channel partner-deals \
  --prompt "Summarize recent discussions"
```

If `slack_sdk` isn't installed (it's marked optional in `requirements.txt`), the agent logs a warning and continues without Slack context.

## Project Structure

```
├── config.json              # Configuration (catalog, endpoints)
├── orchestrator_agent.py    # Main orchestrator agent
├── server.py                # FastAPI web server
├── verify_setup.py          # Setup verification script
├── requirements.txt         # Python dependencies
├── demo_meeting_notes.txt   # Sample context file
├── README.md                # This file
└── TESTING_GUIDE.md         # Step-by-step testing walkthrough
```

## How It Works

1. **Context Gathering**: Agent reads from specified sources (Slack, files, folders)
2. **Opportunity Fetch**: Gets current opportunity data from Partner Central
3. **AI Generation**: Claude analyzes context and generates actionable next steps
4. **MCP Update**: Sends update request to Partner Central MCP Agent
5. **Approval Flow**: PC Agent requests human approval before writing
6. **Execution**: PC Agent calls Partner Central API to set NextSteps field

### MCP Communication Flow

```
1. Your Agent → PC Agent: "Update opportunity O123 with these next steps"
2. PC Agent → Your Agent: "Approval required" + tool_use_id
3. Your Agent → User: "Approve this update? [y/n]"
4. User → Your Agent: "y"
5. Your Agent → PC Agent: {decision: "approve", toolUseId: "..."}
6. PC Agent → Partner Central API: UpdateOpportunity(...)
7. PC Agent → Your Agent: "Update complete"
```

## Supported File Types

- `.txt` — Plain text
- `.md` — Markdown
- `.json` — JSON data
- `.csv` — CSV data
- `.log` — Log files
- `.yaml/.yml` — YAML config
- `.py` — Python source

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `{"message":"Missing Authentication Token"}` | Partner Central APIs require SigV4-signed requests. | Use `aws partnercentral-selling ...` or boto3 — both sign automatically. |
| `AccessDeniedException ... INCOMPATIBLE_BENEFIT_AWS_PARTNER_STATE` | AWS account not registered as partner in Sandbox. | Run `aws partnercentral-account create-partner ...` (see [Register as an AWS Partner in Sandbox](#register-as-an-aws-partner-in-sandbox)). |
| `zsh: command not found: aws` | AWS CLI v2 not installed. | See [Prerequisites](#prerequisites). |
| `Unknown service: 'partnercentral-selling'` | boto3 version too old. | `pip install --upgrade boto3 botocore` (need 1.35.0+). |
| `AUTHENTICATION_FAILURE` from Partner Central | SigV4 creds expired or misconfigured. | Run `aws sts get-caller-identity`. Refresh creds. |
| `TOOL_PERMISSION_DENIED` | Missing IAM permissions. | Attach `AWSPartnerCentralSandboxFullAccess` or check custom policy. |
| Bedrock `AccessDeniedException` | Claude model not enabled in `us-east-1`. | Bedrock console → **Model access** → request Claude models. |
| `ValidationException` from Bedrock | Model ID incorrect or legacy. | Use `us.anthropic.claude-haiku-4-5-20251001-v1:0` or check available models. |
| Rate limit (`-32004`) from Partner Central | Too many requests. | `sendMessage` allows 2 req/min sustained. Add backoff logic. |
| NextSteps exceeds 255 chars | Field limit in Partner Central. | Ensure AI generates concise content under 255 characters. |
| `InvalidClientTokenId` after `aws configure` | Copy-paste introduced whitespace in keys. | Re-run `aws configure`; ensure no leading/trailing spaces. |

## Cleanup

```bash
# 1. Deactivate and remove the virtual environment
deactivate
rm -rf .venv

# 2. If you created an IAM user specifically for this project:
aws iam list-access-keys --user-name pcmcp-workshop-user
aws iam delete-access-key --user-name pcmcp-workshop-user --access-key-id AKIA_YOUR_KEY_ID

aws iam detach-user-policy \
  --user-name pcmcp-workshop-user \
  --policy-arn arn:aws:iam::aws:policy/AWSPartnerCentralSandboxFullAccess

aws iam delete-user-policy \
  --user-name pcmcp-workshop-user \
  --policy-name BedrockInvokeClaude

aws iam delete-user --user-name pcmcp-workshop-user
```

> 💡 The Sandbox partner registration can stay — it doesn't incur cost and is reusable.

## Additional Resources

- [Partner Central MCP Server — Overview](https://docs.aws.amazon.com/partner-central/latest/APIReference/partner-central-mcp-server.html)
- [Getting Started with Partner Central MCP](https://docs.aws.amazon.com/partner-central/latest/APIReference/mcp-getting-started.html)
- [Configuration Reference](https://docs.aws.amazon.com/partner-central/latest/APIReference/mcp-configuration-reference.html)
- [Tools Reference](https://docs.aws.amazon.com/partner-central/latest/APIReference/mcp-tools-reference.html)
- [AWSPartnerCentralSandboxFullAccess managed policy](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AWSPartnerCentralSandboxFullAccess.html)
- [Partner Central Sandbox testing guide](https://docs.aws.amazon.com/partner-central/latest/APIReference/testing-sandbox-account.html)
- [Amazon Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) — Step-by-step testing instructions with expected outputs
