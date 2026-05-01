# Agent-to-Agent: Next Steps Generator

An AI orchestrator agent that communicates with the AWS Partner Central MCP Agent to automate opportunity management.

> 📘 **Looking to test the setup?** See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for step-by-step testing instructions with expected outputs.

## Why Agent-to-Agent?

This application demonstrates **agent-to-agent communication** - a pattern where one AI agent delegates specialized tasks to another AI agent rather than calling APIs directly.

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

- **Slack Integration**: Read messages from specified channels
- **Local File Reader**: Scan folders for relevant documents  
- **File Upload**: Accept uploaded files for context
- **AI-Powered Generation**: Use Claude (Bedrock or API) to create actionable next steps
- **MCP Integration**: Update Partner Central opportunities automatically

## Quick Start

```bash
cd agent-to-agent

# Install dependencies
pip install -r requirements.txt

# Verify boto3 version (needs 1.35.0+ for partnercentral-selling)
python -c "import boto3; print(f'boto3 version: {boto3.__version__}')"

# Run CLI
python orchestrator_agent.py \
  --opportunity-id O15081741 \
  --upload demo_meeting_notes.txt \
  --prompt "Generate next steps based on meeting notes"

# Or run as API server
python server.py
# API available at http://localhost:8001
```

## CLI Usage

```bash
# Basic usage with uploaded file
python orchestrator_agent.py -o O15081741 -u demo_meeting_notes.txt -p "What are the next steps?"

# With Slack channel
python orchestrator_agent.py -o O15081741 -s partner-deals -p "Summarize recent discussions"

# With local folder
python orchestrator_agent.py -o O15081741 -f ./deal-notes -p "Generate action items"

# Dry run (don't update opportunity)
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
Generate next steps from context sources.

```bash
curl -X POST http://localhost:8001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "opportunity_id": "O15081741",
    "prompt": "Generate next steps",
    "slack_channels": ["partner-deals"],
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

### Sandbox Setup

To use the Sandbox catalog, you must first register as a partner. Call the CreatePartner API:

```bash
curl -X POST https://partnercentral-account.us-east-1.api.aws/CreatePartner \
  -H "Content-Type: application/x-amz-json-1.0" \
  -H "X-Amz-Target: PartnerCentralAccount.CreatePartner" \
  -H "Accept: */*" \
  -d '{
    "ClientToken": "unique-token-12345",
    "Catalog": "Sandbox",
    "LegalName": "YourCompanyName",
    "PrimarySolutionType": "CONSULTING_SERVICES",
    "AllianceLeadContact": {
      "FirstName": "Your",
      "LastName": "Name",
      "Email": "your-email@example.com",
      "BusinessTitle": "Your Title"
    },
    "EmailVerificationCode": "123456"
  }'
```

Note: For the Sandbox catalog, no actual email verification is required — any 6-digit value for `EmailVerificationCode` will work. The request must be signed with AWS SigV4.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SLACK_BOT_TOKEN` | Slack API token for channel access | For Slack |
| `AWS_PROFILE` | AWS profile for Bedrock and Partner Central | Yes |
| `ANTHROPIC_API_KEY` | Anthropic API key (if not using Bedrock) | Alternative |

### Config File

Uses `config.json` in the same directory, or specify with `--config`:

```json
{
  "catalog": "Sandbox",
  "region": "us-east-1",
  "endpoints": {
    "partnercentral_selling": "https://partnercentral-selling.us-east-1.api.aws",
    "partnercentral_mcp": "https://partnercentral-agents.us-east-1.api.aws/mcp"
  }
}
```

Set `catalog` to `"AWS"` for production or `"Sandbox"` for testing.

## How It Works

1. **Context Gathering**: Agent reads from specified sources (Slack, files, folders)
2. **Opportunity Fetch**: Gets current opportunity data from Partner Central
3. **AI Generation**: Claude analyzes context and generates actionable next steps
4. **MCP Update**: Sends update request to Partner Central MCP to set NextSteps field

## Supported File Types

- `.txt` - Plain text
- `.md` - Markdown
- `.json` - JSON data
- `.csv` - CSV data
- `.log` - Log files
- `.yaml/.yml` - YAML config
