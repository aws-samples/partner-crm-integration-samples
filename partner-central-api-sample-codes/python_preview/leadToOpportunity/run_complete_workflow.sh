#!/bin/bash

# Complete Lead to Opportunity Workflow Test Script
# This script runs the entire workflow with proper credential switching

set -e  # Exit on any error

echo "=========================================="
echo "Lead to Opportunity Complete Workflow Test"
echo "=========================================="
echo ""

# Check if virtual environment is activated
if [[ "$VIRTUAL_ENV" == "" ]]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

echo "Using boto3 version: $(python -c 'import boto3; print(boto3.__version__)')"
echo ""

# Clear shared_env.json to start fresh
echo "Clearing shared_env.json to start fresh..."
echo "{}" > shared_env.json
echo ""

# Read account IDs from configuration
INVITING_ACCOUNT=$(python -c "
import sys, os
sys.path.append('.')
from utils.config import INVITING_AWS_ACCOUNT_ID
print(INVITING_AWS_ACCOUNT_ID)
")

RECEIVING_ACCOUNT=$(python -c "
import sys, os
sys.path.append('.')
from utils.config import RECEIVING_AWS_ACCOUNT_ID
print(RECEIVING_AWS_ACCOUNT_ID)
")

echo "Configuration loaded:"
echo "  Lead Owner Partner Account: $INVITING_ACCOUNT"
echo "  Collaborating Partner Account: $RECEIVING_ACCOUNT"
echo ""

echo "=========================================="
echo "PHASE 1: LEAD OWNER PARTNER (Account: $INVITING_ACCOUNT)"
echo "Steps 0_1 and 0_2 - AWS creates lead engagement and engagement invitation"
echo "=========================================="
echo ""

echo "Setting AWS credentials for inviting partner account..."
echo "Using AWS profile: inviting-partner"
export AWS_PROFILE=inviting-partner

# Verify credentials
echo "Verifying inviting partner credentials..."
aws sts get-caller-identity --profile inviting-partner > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "ERROR: Invalid or missing AWS credentials for inviting-partner profile"
    echo "Please configure credentials using: aws configure --profile inviting-partner"
    echo "Or set up AWS SSO: aws configure sso --profile inviting-partner"
    exit 1
fi
echo "✓ Inviting partner credentials verified"

echo ""
echo "--- Step 0_1: Create Engagement Lead ---"
python leadToOpportunity/0_1_create_engagement_lead.py
if [ $? -ne 0 ]; then
    echo "ERROR: Step 0_1 failed"
    exit 1
fi

echo ""
echo "--- Step 0_2: Create Engagement Invitation Lead ---"
python leadToOpportunity/0_2_create_engagement_invitation_lead.py
if [ $? -ne 0 ]; then
    echo "ERROR: Step 0_2 failed"
    exit 1
fi

echo ""
echo "=========================================="
echo "PHASE 2: COLLABORATING PARTNER (Account: $RECEIVING_ACCOUNT)"
echo "Steps 1-10 - Accept lead invitation, update engagement context, convert to opportunity, associate solution, and submit to AWS"
echo "=========================================="
echo ""

echo "Setting AWS credentials for receiving partner account..."
echo "Using AWS profile: receiving-partner"
export AWS_PROFILE=receiving-partner

# Verify credentials
echo "Verifying receiving partner credentials..."
aws sts get-caller-identity --profile receiving-partner > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "ERROR: Invalid or missing AWS credentials for receiving-partner profile"
    echo "Please configure credentials using: aws configure --profile receiving-partner"
    echo "Or set up AWS SSO: aws configure sso --profile receiving-partner"
    exit 1
fi
echo "✓ Receiving partner credentials verified"

echo ""
echo "--- Step 1: Get Engagement Invitation ---"
python leadToOpportunity/1_get_engagement_invitation.py
if [ $? -ne 0 ]; then
    echo "ERROR: Step 1 failed"
    exit 1
fi

echo ""
echo "--- Step 2: Accept Engagement Invitation ---"
python leadToOpportunity/2_accept_engagement_invitation.py
if [ $? -ne 0 ]; then
    echo "ERROR: Step 2 failed"
    exit 1
fi

echo ""
echo "--- Step 3: Get Engagement ---"
python leadToOpportunity/3_getEngagement.py
if [ $? -ne 0 ]; then
    echo "ERROR: Step 3 failed"
    exit 1
fi

echo ""
echo "--- Step 4: Update Engagement Context ---"
python leadToOpportunity/4_update_engagement_context.py
if [ $? -ne 0 ]; then
    echo "ERROR: Step 4 failed"
    exit 1
fi

echo ""
echo "--- Step 5: Start Opportunity from Engagement Task ---"
python leadToOpportunity/5_start_opportunity_from_engagement_task.py
if [ $? -ne 0 ]; then
    echo "ERROR: Step 5 failed"
    exit 1
fi

echo ""
echo "--- Step 6: List Solutions ---"
python leadToOpportunity/6_list_solutions.py
if [ $? -ne 0 ]; then
    echo "ERROR: Step 6 failed"
    exit 1
fi

echo ""
echo "--- Step 7: Associate Opportunity ---"
python leadToOpportunity/7_associate_opportunity.py
if [ $? -ne 0 ]; then
    echo "ERROR: Step 7 failed"
    exit 1
fi

echo ""
echo "--- Step 8: Get Opportunity ---"
python leadToOpportunity/8_get_opportunity.py
if [ $? -ne 0 ]; then
    echo "ERROR: Step 8 failed"
    exit 1
fi

echo ""
echo "--- Step 9: Update Opportunity ---"
python leadToOpportunity/9_update_opportunity.py
if [ $? -ne 0 ]; then
    echo "ERROR: Step 9 failed"
    exit 1
fi

echo ""
echo "--- Step 10: Start Engagement from Opportunity Task ---"
python leadToOpportunity/10_start_engagement_from_opportunity_task.py
if [ $? -ne 0 ]; then
    echo "ERROR: Step 10 failed"
    exit 1
fi

echo ""
echo "=========================================="
echo "WORKFLOW COMPLETED SUCCESSFULLY!"
echo "=========================================="
echo ""

echo "Final shared_env.json contents:"
cat shared_env.json | python -m json.tool

echo ""
echo "Summary:"
echo "- Lead Owner Partner ($INVITING_ACCOUNT): Accepted AWS-created engagement and invitation"
echo "- Collaborating Partner ($RECEIVING_ACCOUNT): Accepted invitation and managed opportunity"
echo "- All 12 steps (0_1, 0_2, 1-10) completed successfully"
echo "- Sandbox testing simulates complete AWS lead collaboration workflow"
echo "- Using official boto3 version: $(python -c 'import boto3; print(boto3.__version__)')"