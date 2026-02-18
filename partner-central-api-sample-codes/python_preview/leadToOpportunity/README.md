# AWS Partner Central Selling API - Lead to Opportunity Workflow

## About This Project

This repository provides a complete implementation of the Lead to Opportunity workflow using the AWS Partner Central Selling API. It demonstrates how AWS Partners can collaborate on leads and convert them into opportunities through a structured, multi-step process.

### What is the Lead to Opportunity Workflow?

The Lead to Opportunity workflow enables AWS Partners to work with leads provided by AWS and collaborate with other partners on business opportunities.

**Official Documentation:**
- [Working with Your Leads](https://docs.aws.amazon.com/partner-central/latest/APIReference/working-with-your-leads.html) - Complete API documentation for lead management
- [Partner Central Events](https://docs.aws.amazon.com/partner-central/latest/APIReference/partner-central-events.html) - EventBridge integration and event types

**Key Workflow Steps:**

1. **Lead Receipt**: AWS provides qualified leads to partners through the Partner Central system
2. **Lead Engagement**: AWS creates lead engagements and engagement invitations; partners can only accept engagement invitations
3. **Lead Qualification**: Partners update engagement context with additional qualification information
4. **Opportunity Conversion**: Qualified leads are converted into opportunities for AWS review
5. **Partner Collaboration**: Once converted to opportunities, partners can invite other partners to collaborate
6. **Opportunity Management**: Partners associate solutions, update opportunity details, and submit for AWS co-sell

**Important**: Leads originate from AWS and are distributed to partners. Partner collaboration (inviting other partners) can only occur after the lead is converted to an opportunity, not at the lead stage.

### Key Features

- **Complete Lead-to-Opportunity Workflow**: From AWS lead receipt to opportunity submission
- **Partner Collaboration**: Invite other partners to collaborate on AWS-provided leads
- **Sandbox Testing**: Pre-configured for safe testing in AWS Partner Central Sandbox environment
- **Automated ID Management**: Scripts automatically save and share IDs between workflow steps
- **Template-Based**: JSON templates for easy customization of engagement and opportunity data
- **Production Ready**: Simple configuration switch from Sandbox to Production environment

### Use Cases

- Processing leads received from AWS through Partner Central
- Collaborating with other AWS Partners on lead opportunities
- Testing AWS Partner Central Selling API integration
- Learning the complete Lead to Opportunity workflow process
- Developing custom lead management and partner collaboration solutions

## Python Environment Setup

This environment uses the official boto3 and botocore packages that include AWS Partner Central Selling API support.

## Prerequisites

The AWS Partner Central Selling API is now available in the official boto3 release. No special SDK downloads are required.

**Required Tools:**
- Python 3.7 or higher
- AWS CLI (for credential management) - Install: `pip install awscli` or see [AWS CLI Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- AWS Partner Central Selling API access for your partner accounts



## Environment Setup

Follow these steps to set up your Python environment:

**Quick Setup Checklist:**
1. Create and activate virtual environment
2. Install official boto3 package
3. Verify installation
4. **Create workflow_config.json** with your AWS account IDs and catalog setting
5. Configure test environment variables (ENGAGEMENT_ID, etc.) - optional for testing
6. Verify complete setup

### 1. Create Virtual Environment

```bash
python3 -m venv venv
```

### 2. Activate Virtual Environment

```bash
source venv/bin/activate
```

### 3. Install Official Boto3 Package

Install the official boto3 package that includes AWS Partner Central Selling API support:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

Or install directly:

```bash
pip install boto3>=1.42.8
```

### 4. Verify Installation

Check that boto3 is installed correctly:

```bash
python -c "import boto3; print(f'boto3 version: {boto3.__version__}')"
```

Expected output will show your installed version (e.g., `boto3 version: 1.42.8`)

### 5. Configure AWS Accounts and Environment Settings

Create a `workflow_config.json` file in the root directory with your AWS account IDs and settings:

```json
{
  "accounts": {
    "inviting_partner": "YOUR_INVITING_ACCOUNT_ID",
    "receiving_partner": "YOUR_RECEIVING_ACCOUNT_ID"
  },
  "catalog": "Sandbox",
  "endpoint_url": "https://partnercentral-selling.us-east-1.api.aws",
  "region": "us-east-1"
}
```

**Account Configuration:**
- **inviting_partner**: AWS account ID used for steps 0_1 and 0_2 - simulates AWS creating lead engagement and engagement invitation
- **receiving_partner**: AWS account ID for collaborating partner (steps 1-10) - accepts lead invitation, updates engagement context, converts lead to opportunity, associates solution, and submits to AWS

**Sandbox Testing Note**: In production, leads come from AWS to partners. Partner collaboration invitations occur after lead-to-opportunity conversion. For sandbox testing, we simulate the complete workflow including the invitation process. Partners can test with dual accounts in sandbox as long as those two accounts are connected through partner connection (see [Account API documentation](https://docs.aws.amazon.com/partner-central/latest/APIReference/using-the-account-api.html)).

**Catalog Configuration:**
- **"Sandbox"**: For testing (default)
- **"AWS"**: For production use

**Example Configuration:**
```json
{
  "accounts": {
    "inviting_partner": "123456789012",
    "receiving_partner": "987654321098"
  },
  "catalog": "Sandbox",
  "endpoint_url": "https://partnercentral-selling.us-east-1.api.aws",
  "region": "us-east-1"
}
```

**Important:** All workflow scripts automatically load configuration from `workflow_config.json`. Make sure this file exists before running any scripts.

### 6. Configure AWS Credentials

The workflow requires AWS credentials for two different partner accounts. Choose one of the following methods:

#### Option 1: AWS CLI Profiles (Recommended)

```bash
# Configure inviting partner credentials
aws configure --profile inviting-partner
# Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output format (json)

# Configure receiving partner credentials  
aws configure --profile receiving-partner
# Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output format (json)

# Test the profiles
aws sts get-caller-identity --profile inviting-partner
aws sts get-caller-identity --profile receiving-partner
```

#### Option 2: Environment Variables

```bash
# For inviting partner (steps 0_1, 0_2)
export AWS_ACCESS_KEY_ID=your_inviting_access_key
export AWS_SECRET_ACCESS_KEY=your_inviting_secret_key
export AWS_SESSION_TOKEN=your_session_token  # if using temporary credentials
export AWS_DEFAULT_REGION=us-east-1

# For receiving partner (steps 1-10) - update these values
export AWS_ACCESS_KEY_ID=your_receiving_access_key
export AWS_SECRET_ACCESS_KEY=your_receiving_secret_key
export AWS_SESSION_TOKEN=your_session_token  # if using temporary credentials
```

#### Option 3: AWS SSO

```bash
# Configure SSO profiles
aws configure sso --profile inviting-partner
aws configure sso --profile receiving-partner

# Login when needed
aws sso login --profile inviting-partner
aws sso login --profile receiving-partner
```

#### Option 4: IAM Roles (for EC2/Lambda)

If running on AWS infrastructure, use IAM roles with appropriate permissions for the Partner Central Selling API.

### 7. Configure Test Environment Variables

Before running the workflow scripts, update `shared_env.json` with the values provided by AWS:

```bash
# Edit shared_env.json and replace the placeholder values:
# - ENGAGEMENT_ID: The engagement ID provided by AWS
# - ENGAGEMENT_INVITATION_ID: The invitation ID provided by AWS
# - SOLUTION_ID: Your solution ID (if you have one)
```

Example `shared_env.json`:
```json
{
  "SOLUTION_ID": "S-0052021",
  "OPPORTUNITY_ID": "O14983092",
  "ENGAGEMENT_ID": "eng-84ix50jdle0evq",
  "ENGAGEMENT_INVITATION_ID": "engi-qxx7b5oh5fsjq",
  "TASK_ID": "task-0hsx00u9iph8f",
  "TASK_ARN": "arn:aws:partnercentral:us-east-1::catalog/AWS/opportunity-from-engagement-task/task-0hsx00u9iph8f"
}
```

**Important**: You need the `ENGAGEMENT_INVITATION_ID` to start the workflow, which can be received either directly from AWS or from EventBridge events with event type "Engagement Invitation Created" - the ID field inside the `engagementInvitation` attribute contains the engagement invitation ID. The `ENGAGEMENT_ID` will be automatically extracted and saved by step 1 (`1_get_engagement_invitation.py`). The other values will be populated automatically as you progress through the workflow steps.

### 8. Verify Complete Setup

Run the configuration test to ensure everything is set up correctly:

```bash
python test_configuration.py
```

## Setup Status

✅ Virtual environment ready to create in `venv/`
✅ Official boto3 (1.42.8 or up) and botocore (1.42.8 or up) packages with Partner Central Selling API support
✅ Utils folder included with helper functions
✅ Requirements file configured for official boto3 package
✅ Workflow scripts available:
   - Steps 0_1, 0_2: AWS creates lead engagement and engagement invitation (simulated for sandbox testing)
   - Steps 1-10: Receiving partner accepts lead invitation, updates engagement context, converts to opportunity, associates solution, and submits to AWS

## Usage

### Two-Account Workflow Overview

The complete Lead to Opportunity workflow demonstrates the process from AWS lead receipt through opportunity collaboration:

**AWS Lead Engagement Creation (Steps 0_1, 0_2):**
- AWS creates lead engagement for a qualified lead (step 0_1)
- AWS creates engagement invitation to invite partner to collaborate (step 0_2)
- Saves `ENGAGEMENT_ID` and `ENGAGEMENT_INVITATION_ID` to `shared_env.json`
- Note: These steps simulate AWS behavior for sandbox testing with dual account.

**Collaborating Partner Account (Steps 1-10):**
- Receives the lead invitation from AWS
- Accepts the lead invitation
- Updates engagement context with additional qualification information
- Converts lead to opportunity
- Associates solution to opportunity
- Submits to AWS for review

**Configuration:**
- All scripts use `config.CONFIG_VARS` loaded from `workflow_config.json`
- Account IDs are automatically loaded from configuration file

**Note**: This workflow simulates the complete process from AWS lead distribution through opportunity collaboration. In sandbox testing, we use two partner accounts to demonstrate the full workflow. 

### Prerequisites

**Configure Account IDs:**
Create `workflow_config.json` with your AWS account IDs (see step 5 above)

**For Complete Sandbox Testing (Two Partner Accounts):**
1. Set both account IDs in `workflow_config.json`
2. Run the complete workflow using `./run_complete_workflow.sh`
3. The script automatically switches credentials between accounts
4. This simulates the full lead collaboration process between partners

**For Single Account Testing:**
1. Receive `ENGAGEMENT_INVITATION_ID` either directly from AWS or from EventBridge events with event type "Engagement Invitation Created"
2. Manually update `ENGAGEMENT_INVITATION_ID` in `shared_env.json`
3. Run steps 1-10 with your partner account credentials
4. This tests the collaborating partner side of the workflow only

**Note**: Two accounts are required for complete sandbox testing to demonstrate the full partner collaboration workflow on AWS-provided leads.

### Complete Workflow Execution

#### Option 1: Two-Account Testing (Full Workflow)

**Automated Workflow (Recommended):**

```bash
# Make sure workflow_config.json exists with your account IDs
# Configure AWS credentials for both accounts (see credential options below)
# Then run complete workflow
./run_complete_workflow.sh
```

**Manual Step-by-Step Execution:**

**Step A: Lead Owner Partner Processes Lead and Creates Opportunity Collaboration**

```bash
# Configure AWS credentials for inviting partner account
# Option 1: Using AWS CLI profiles
aws configure --profile inviting-partner
export AWS_PROFILE=inviting-partner

# Option 2: Using environment variables
export AWS_ACCESS_KEY_ID=your_inviting_access_key
export AWS_SECRET_ACCESS_KEY=your_inviting_secret_key
export AWS_SESSION_TOKEN=your_session_token  # if using temporary credentials

# Option 3: Using AWS SSO
aws sso login --profile inviting-partner
export AWS_PROFILE=inviting-partner

# Run inviting partner scripts
python leadToOpportunity/0_1_create_engagement_lead.py
python leadToOpportunity/0_2_create_engagement_invitation_lead.py

# This saves ENGAGEMENT_ID and ENGAGEMENT_INVITATION_ID to shared_env.json
```

**Step B: Collaborating Partner Accepts Opportunity Invitation and Manages Opportunity**

```bash
# Configure AWS credentials for receiving partner account
# Option 1: Using AWS CLI profiles
aws configure --profile receiving-partner
export AWS_PROFILE=receiving-partner

# Option 2: Using environment variables
export AWS_ACCESS_KEY_ID=your_receiving_access_key
export AWS_SECRET_ACCESS_KEY=your_receiving_secret_key
export AWS_SESSION_TOKEN=your_session_token  # if using temporary credentials

# Option 3: Using AWS SSO
aws sso login --profile receiving-partner
export AWS_PROFILE=receiving-partner

# Run receiving partner scripts
python leadToOpportunity/1_get_engagement_invitation.py
python leadToOpportunity/2_accept_engagement_invitation.py
python leadToOpportunity/3_getEngagement.py
python leadToOpportunity/4_update_engagement_context.py
python leadToOpportunity/5_start_opportunity_from_engagement_task.py
python leadToOpportunity/6_list_solutions.py
python leadToOpportunity/7_associate_opportunity.py
python leadToOpportunity/8_get_opportunity.py
python leadToOpportunity/9_update_opportunity.py
python leadToOpportunity/10_start_engagement_from_opportunity_task.py
```

#### Option 2: Single-Account Testing (AWS Provides Engagement Invitation ID)

**Prerequisites:**
- Receive `ENGAGEMENT_INVITATION_ID` either:
  - Directly from AWS, or
  - From EventBridge event (event type "Engagement Invitation Created")
- Manually update `ENGAGEMENT_INVITATION_ID` in `shared_env.json`
- The `ENGAGEMENT_ID` will be automatically extracted and saved by step 1 (`1_get_engagement_invitation.py`)

```bash
# Configure AWS credentials for your partner account
# Use your preferred method to set AWS credentials:
# - AWS CLI: aws configure
# - Environment variables: export AWS_ACCESS_KEY_ID=... AWS_SECRET_ACCESS_KEY=...
# - IAM role assumption: aws sts assume-role ...
# - AWS SSO: aws sso login

# Run receiving partner scripts (steps 1-10)
python leadToOpportunity/1_get_engagement_invitation.py
python leadToOpportunity/2_accept_engagement_invitation.py
python leadToOpportunity/3_getEngagement.py
python leadToOpportunity/4_update_engagement_context.py
python leadToOpportunity/5_start_opportunity_from_engagement_task.py
python leadToOpportunity/6_list_solutions.py
python leadToOpportunity/7_associate_opportunity.py
python leadToOpportunity/8_get_opportunity.py
python leadToOpportunity/9_update_opportunity.py
python leadToOpportunity/10_start_engagement_from_opportunity_task.py
```

#### Option 3: Manual Activation and Individual Scripts

```bash
# Activate environment
source venv/bin/activate

# Run individual scripts as needed
python leadToOpportunity/1_get_engagement_invitation.py
# ... continue with other scripts
```

#### Option 4: Use Environment Activation Script

```bash
# Activate and show environment info
./activate_env.sh

# Then run scripts directly
python leadToOpportunity/6_list_solutions.py
python leadToOpportunity/9_update_opportunity.py
```

## Installed Packages

- boto3: 1.42.8 or higher (Official version with Partner Central Selling API support)
- botocore: 1.42.8 or higher (Official version with Partner Central Selling API support)
- Supporting dependencies: jmespath, python-dateutil, urllib3, s3transfer, six, requests

**Important**: The AWS Partner Central Selling API is now available in the official boto3 release. Simply install the latest version using `pip install boto3>=1.42.8`.

## Utils Directory

The `utils/` directory contains utility modules for the Lead to Opportunity workflow.

### config.py
Configuration loader that reads settings from `workflow_config.json`.

**Loaded Configuration Variables:**
- `CATALOG`: "Sandbox" for testing or "AWS" for production
- `ENDPOINT_URL`: AWS Partner Central Selling API endpoint
- `REGION`: AWS region (default: "us-east-1")
- `INVITING_AWS_ACCOUNT_ID`: Account ID used for steps 0_1 and 0_2 (simulates AWS creating engagements)
- `RECEIVING_AWS_ACCOUNT_ID`: Account ID for steps 1-10

**CONFIG_VARS Dictionary:**
```python
CONFIG_VARS = {
    "CATALOG": "Sandbox",  # Loaded from workflow_config.json
    "REGION": "us-east-1",
    "ENDPOINT_URL": "https://partnercentral-selling.us-east-1.api.aws",
    "INVITING_AWS_ACCOUNT_ID": "123456789012",
    "RECEIVING_AWS_ACCOUNT_ID": "987654321098"
}
```

**Usage in Workflow Scripts:**
```python
import utils.config as config

# Create boto3 client using CONFIG_VARS
partner_central_client = boto3.client(
    service_name="partnercentral-selling",
    region_name='us-east-1',
    endpoint_url=config.CONFIG_VARS["ENDPOINT_URL"]
)

# Use catalog in API requests
request = {
    "Catalog": config.CONFIG_VARS["CATALOG"],
    "Identifier": some_id
}

# Print current configuration
config.print_config()
```

### helpers.py
Helper functions for common operations.

**Functions:**
- `open_json_file(filename)`: Load JSON file from path
- `pretty_print_datetime(json_object)`: Pretty print JSON with datetime handling
- `load_shared_env_vars()`: Load environment variables from shared_env.json
- `DateTimeEncoder`: JSON encoder class for datetime objects

**Usage:**
```python
from utils.helpers import open_json_file, pretty_print_datetime

# Load JSON file
data = open_json_file('config.json')

# Pretty print with datetime support
pretty_print_datetime(data)
```

### Workflow Data Flow

1. **Steps 0_1-0_2**: Create `ENGAGEMENT_ID` and `ENGAGEMENT_INVITATION_ID`, save to shared_env.json
2. **Steps 1-2**: Use `ENGAGEMENT_INVITATION_ID` from shared_env.json (can also be obtained from EventBridge events with event type "Engagement Invitation Created")
3. **Steps 3-4**: Use `ENGAGEMENT_ID` from shared_env.json
4. **Step 5**: Creates `OPPORTUNITY_ID` and saves to shared_env.json
5. **Steps 6-10**: Use `OPPORTUNITY_ID` and `SOLUTION_ID` from shared_env.json

## Files Created

- `venv/` - Python virtual environment
- `utils/` - Utility functions for API helpers and configuration
  - `config.py` - Configuration constants and environment switching
  - `helpers.py` - Helper functions for JSON handling and datetime formatting
- `requirements.txt` - Official boto3 package requirements
- `activate_env.sh` - Environment activation script
- `shared_env.json` - Created by scripts to share environment variables between workflow steps
- `leadToOpportunity/` - Complete Lead to Opportunity workflow scripts and documentation

## Important Notes

- **Two-Account Workflow**: 
  - **Steps 0_1, 0_2**: Simulate AWS creating lead engagement and engagement invitation (sandbox testing only)
  - **Steps 1-10**: Run with collaborating partner credentials to accept lead invitation, update engagement context, convert to opportunity, associate solution, and submit to AWS
  - Configure account IDs in `workflow_config.json` before running the workflow
  
- **Single-Account Testing**: If you don't have two partner accounts, receive `ENGAGEMENT_INVITATION_ID` either directly from AWS or from EventBridge events. Manually update `shared_env.json` with the invitation ID and run steps 1-10 only. The `ENGAGEMENT_ID` will be automatically extracted by step 1.

- **Configuration**: All workflow scripts load configuration from `workflow_config.json` including account IDs and catalog settings.

- **Credentials**: Configure AWS credentials using AWS CLI profiles (recommended), environment variables, IAM roles, or AWS SSO. The workflow requires credentials for both partner accounts.

- **Official API**: This workflow uses the official AWS Partner Central Selling API

- **Documentation**: See `leadToOpportunity/Lead_To_Opportunity.md` for complete API documentation

- **Shared Environment**: The `shared_env.json` file is used to pass IDs between workflow steps. It's gitignored to prevent committing test data.

### Environment Configuration

**Default Configuration:** The repository is configured for Sandbox testing by default.

**Current settings in `utils/config.py`:**
```python
CONFIG_VARS = {
    "CATALOG": CATALOG,  # Loaded from workflow_config.json
    "REGION": REGION,
    "ENDPOINT_URL": ENDPOINT_URL,
    "INVITING_AWS_ACCOUNT_ID": INVITING_AWS_ACCOUNT_ID,
    "RECEIVING_AWS_ACCOUNT_ID": RECEIVING_AWS_ACCOUNT_ID
}
```

**Configuration Source:**

All values are loaded from `workflow_config.json`:
- **CATALOG**: "Sandbox" for testing or "AWS" for production
- **REGION**: AWS region (default: "us-east-1")  
- **ENDPOINT_URL**: Partner Central Selling API endpoint
- **INVITING_AWS_ACCOUNT_ID**: Account ID for steps 0_1 and 0_2
- **RECEIVING_AWS_ACCOUNT_ID**: Account ID for steps 1-10

**To change configuration:** Edit the `workflow_config.json` file in the root directory.

**Remember:** All workflow scripts use `config.CONFIG_VARS` which loads all configuration from `workflow_config.json`.

The environment is ready to use with the Lead to Opportunity workflow scripts!