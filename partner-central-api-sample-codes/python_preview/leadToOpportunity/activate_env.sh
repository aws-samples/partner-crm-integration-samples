#!/bin/bash

# Script to activate the Python environment with official boto3/botocore
echo "Activating Python environment with official boto3..."
source venv/bin/activate

# Verify the installation
python -c "import boto3, botocore; print(f'✓ boto3 version: {boto3.__version__}'); print(f'✓ botocore version: {botocore.__version__}')"

echo ""
echo "Environment activated! You can now run the Lead to Opportunity workflow:"
echo "  python leadToOpportunity/1_get_engagement_invitation.py"
echo "  python leadToOpportunity/2_accept_engagement_invitation.py"
echo "  python leadToOpportunity/3_getEngagement.py"
echo "  python leadToOpportunity/4_update_engagement_context.py"
echo "  python leadToOpportunity/5_start_opportunity_from_engagement_task.py"
echo "  python leadToOpportunity/6_list_solutions.py"
echo "  python leadToOpportunity/7_associate_opportunity.py"
echo "  python leadToOpportunity/8_get_opportunity.py"
echo "  python leadToOpportunity/9_update_opportunity.py"
echo "  python leadToOpportunity/10_start_engagement_from_opportunity_task.py"
echo ""
echo "Then run scripts directly:"
echo "  python leadToOpportunity/1_get_engagement_invitation.py"