# Agent-to-Agent Testing Guide

This document provides step-by-step testing instructions with expected outputs for the Agent-to-Agent Partner Central application.

---

## Prerequisites

Before testing, ensure you have:
- AWS credentials configured (`aws configure`)
- Python 3.10+ with dependencies installed (`pip install -r requirements.txt`)
- boto3 version 1.35.0+ (`pip install --upgrade boto3 botocore`)

---

## Test 1: Setup Verification

Run the verification script to check all components:

```bash
python verify_setup.py
```

### Expected Output

```
============================================================
  Agent-to-Agent Setup Verification
============================================================

============================================================
  5. Configuration File
============================================================

✅ [PASS] config.json exists and valid
   └─ Catalog: Sandbox
   └─ Region: us-east-1

   Using catalog: Sandbox

============================================================
  1. AWS Credentials
============================================================

✅ [PASS] AWS credentials configured
   └─ Account: 691709974417
   └─ ARN: arn:aws:sts::691709974417:assumed-role/Admin/your-user

============================================================
  2. Amazon Bedrock Model Access
============================================================

✅ [PASS] Bedrock model access (us.anthropic.claude-haiku-4-5-20251001-v1:0)
   └─ Response: Bedrock access verified...

============================================================
  3. Partner Central Selling API
============================================================

✅ [PASS] Partner Central API (Sandbox catalog)
   └─ Found 1 opportunity(ies) in response

============================================================
  4. Partner Central MCP Server
============================================================

✅ [PASS] Partner Central MCP
   └─ Status: complete
   └─ Agent: Hello! I'm your AWS Partner Central assistant...

============================================================
  Summary
============================================================

🎉 All checks passed! Your setup is ready.

Next steps:
  1. Run the demo: python server.py
  2. Or use CLI: python orchestrator_agent.py --help
```

---

## Test 2: CLI - Dry Run (No MCP Update)

Test the orchestrator without updating Partner Central:

```bash
python orchestrator_agent.py \
  --opportunity-id O13272431 \
  --upload demo_meeting_notes.txt \
  --dry-run
```

### Expected Output

```
2026-04-22 22:29:59,941 - INFO - Starting orchestrator for opportunity: O13272431
2026-04-22 22:29:59,941 - INFO - Reading uploaded file: demo_meeting_notes.txt
2026-04-22 22:29:59,941 - INFO - Gathered 1 context sources
2026-04-22 22:29:59,941 - INFO - Fetching opportunity data: O13272431
2026-04-22 22:30:00,364 - INFO - Found credentials in shared credentials file: ~/.aws/credentials
2026-04-22 22:30:01,389 - INFO - Generating next steps with AI...
2026-04-22 22:30:11,236 - INFO - Generated next steps:
1. Schedule Well-Architected Review w/ AWS SA; submit MAP funding request
2. Deliver cost optimization report (30% savings analysis, RI recommendations)
3. Demo Cost Explorer/Budgets; setup cost allocation tags in AWS account

============================================================
ORCHESTRATOR AGENT RESULT
============================================================
Success: True
Context Sources: 1

Generated Next Steps:
1. Schedule Well-Architected Review w/ AWS SA; submit MAP funding request
2. Deliver cost optimization report (30% savings analysis, RI recommendations)
3. Demo Cost Explorer/Budgets; setup cost allocation tags in AWS account
```

---

## Test 3: CLI - Full Flow with MCP Update

Test the complete workflow including Partner Central update with approval:

```bash
python orchestrator_agent.py \
  --opportunity-id O13272431 \
  --upload demo_meeting_notes.txt
```

### Expected Output

```
2026-04-22 22:23:35,439 - INFO - Starting orchestrator for opportunity: O13272431
2026-04-22 22:23:35,439 - INFO - Reading uploaded file: demo_meeting_notes.txt
2026-04-22 22:23:35,439 - INFO - Gathered 1 context sources
2026-04-22 22:23:35,439 - INFO - Fetching opportunity data: O13272431
2026-04-22 22:23:35,745 - INFO - Found credentials in shared credentials file: ~/.aws/credentials
2026-04-22 22:23:36,564 - INFO - Generating next steps with AI...
2026-04-22 22:23:39,023 - INFO - Generated next steps:
1. Schedule Well-Architected Review w/ AWS SA; submit MAP funding request
2. Deliver cost optimization report (30% savings analysis, RI recommendations)
3. Demo Cost Explorer/Budgets; setup cost allocation tags in AWS account
2026-04-22 22:23:39,023 - INFO - Updating opportunity O13272431 via MCP...
2026-04-22 22:23:39,106 - INFO - Found credentials in shared credentials file: ~/.aws/credentials

============================================================
🔐 APPROVAL REQUIRED
============================================================
Tool: update_opportunity_enhanced
Session: session-429c80bd-9a28-416d-89e6-3552fa57d80d
Action: Update NextSteps field
Content preview: {'payload': {'Identifier': 'O13272431', 'LifeCycle': {'NextSteps': '1. Schedule Well-Architected Review w/ AWS SA; submit MAP funding request...
============================================================

Approve this update? [y/n]: y
2026-04-22 22:24:36,985 - INFO - Sending approve decision...

✅ Update approved and completed!
2026-04-22 22:24:49,348 - INFO - Opportunity updated successfully

============================================================
ORCHESTRATOR AGENT RESULT
============================================================
Success: True
Context Sources: 1

Generated Next Steps:
1. Schedule Well-Architected Review w/ AWS SA; submit MAP funding request
2. Deliver cost optimization report (30% savings analysis, RI recommendations)
3. Demo Cost Explorer/Budgets; setup cost allocation tags in AWS account

MCP Status: complete
✅ Opportunity update completed.
```

---

## Test 4: API Server - Start Server

Start the FastAPI server:

```bash
python server.py
```

### Expected Output

```
INFO:     Started server process [4975]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
```

---

## Test 5: API - GET Opportunity

Fetch opportunity data via the API:

```bash
curl -s http://localhost:8001/api/opportunity/O13272431 | python -m json.tool
```

### Expected Output

```json
{
    "opportunity_id": "O13272431",
    "customer": "ValidAWSCreate-1776892323",
    "stage": "Prospect",
    "next_steps": "1. Schedule Well-Architected Review w/ AWS SA; submit MAP funding request...",
    "data": {
        "Catalog": "Sandbox",
        "PrimaryNeedsFromAws": ["Co-Sell - Architectural Validation"],
        "NationalSecurity": "No",
        "PartnerOpportunityIdentifier": "HS-91298150075-1776892323",
        "Customer": {
            "Account": {
                "Industry": "Software and Internet",
                "CompanyName": "ValidAWSCreate-1776892323",
                "WebsiteUrl": "https://hubspot.com",
                "Address": {
                    "City": "Cambridge",
                    "PostalCode": "02139",
                    "StateOrRegion": "Massachusetts",
                    "CountryCode": "US",
                    "StreetAddress": "25 First Street"
                }
            },
            "Contacts": [
                {
                    "Email": "bh@hubspot.com",
                    "FirstName": "Brian",
                    "LastName": "Halligan (Sample Contact)",
                    "BusinessTitle": "Contact",
                    "Phone": "+15550000"
                }
            ]
        },
        "Project": {
            "DeliveryModels": ["SaaS or PaaS"],
            "ExpectedCustomerSpend": [
                {
                    "Amount": "1000",
                    "CurrencyCode": "USD",
                    "Frequency": "Monthly",
                    "TargetCompany": "AWS"
                }
            ],
            "Title": "TestDeal1",
            "CustomerBusinessProblem": "Deal from HubSpot - New Business",
            "CustomerUseCase": "Business Applications & Contact Center",
            "SalesActivities": ["Conducted POC / Demo"],
            "OtherSolutionDescription": "TestSolution"
        },
        "OpportunityType": "Net New Business",
        "Id": "O13272431",
        "LifeCycle": {
            "Stage": "Prospect",
            "NextSteps": "1. Schedule Well-Architected Review...",
            "TargetCloseDate": "2026-04-29",
            "ReviewStatus": "Pending Submission"
        }
    }
}
```

---

## Test 6: API - Generate with File Upload

Generate next steps using file upload (without updating Partner Central):

```bash
curl -s -X POST http://localhost:8001/api/generate-with-files \
  -F "opportunity_id=O13272431" \
  -F "prompt=Generate next steps from meeting notes" \
  -F "files=@demo_meeting_notes.txt" \
  -F "update_opportunity=false" | python -m json.tool
```

### Expected Output

```json
{
    "success": true,
    "next_steps": "1. Schedule Well-Architected Review w/ AWS SA; submit MAP funding request\n2. Deliver cost optimization report (30% savings analysis, RI recommendations)\n3. Demo Cost Explorer/Budgets; setup cost allocation tags in AWS account",
    "source_count": 1,
    "mcp_response": null,
    "error": null
}
```

---

## Test 7: API - Generate without Context (Expected Failure)

Test error handling when no context is provided:

```bash
curl -s -X POST http://localhost:8001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "opportunity_id": "O13272431",
    "prompt": "Generate next steps",
    "update_opportunity": false
  }' | python -m json.tool
```

### Expected Output

```json
{
    "success": false,
    "next_steps": "",
    "source_count": 0,
    "mcp_response": null,
    "error": "No context sources provided"
}
```

---

## Test Summary Checklist

| Test | Description | Command | Expected Result |
|------|-------------|---------|-----------------|
| 1 | Setup Verification | `python verify_setup.py` | All checks pass ✅ |
| 2 | CLI Dry Run | `python orchestrator_agent.py -o ID -u file --dry-run` | Generates next steps, no MCP call |
| 3 | CLI Full Flow | `python orchestrator_agent.py -o ID -u file` | Approval prompt, MCP update |
| 4 | Start API Server | `python server.py` | Server on port 8001 |
| 5 | GET Opportunity | `curl .../api/opportunity/ID` | Returns opportunity JSON |
| 6 | POST with Files | `curl -F files=@file ...` | Returns generated next steps |
| 7 | POST without Context | `curl -d '{}' ...` | Returns error message |

---

## Troubleshooting Test Failures

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| verify_setup.py fails on credentials | AWS creds expired | Run `aws sts get-caller-identity`, refresh creds |
| verify_setup.py fails on Bedrock | Model not enabled | Enable Claude models in Bedrock console |
| verify_setup.py fails on Partner Central | Missing IAM permissions | Attach `AWSMcpServiceActionsFullAccess` policy |
| CLI shows "Unknown service: partnercentral-selling" | boto3 too old | `pip install --upgrade boto3 botocore` |
| API returns 500 error | Check server logs | Look at terminal running `server.py` |
| MCP approval times out | Network/auth issue | Check AWS credentials, try again |

---

*Testing Guide version 1.0 — April 2026*
