# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

#!/usr/bin/env python

"""
Purpose
PC-API-22  GetOpportunityEngagementInvitation - Retrieves details of a specific engagement invitation. 
This operation allows partners to view the invitation and its associated information, 
such as the customer, project, and lifecycle details.
"""
import json
import logging
import boto3
import utils.helpers as helper

from utils.constants import CATALOG_TO_USE

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

serviceName = "partnercentral-selling"

def get_opportunity_engagement_invitation(identifier):
    # Use the session credentials via the utility function
    from utils.aws_client import get_boto3_client
    partner_central_client = get_boto3_client(serviceName)
    
    get_opportunity_engagement_invitation_request = {
        "Catalog": CATALOG_TO_USE,
        "Identifier": identifier
    }
    try:
        logger.info(f"Making get_engagement_invitation API call for {identifier}")
        # Perform an API call
        response = partner_central_client.get_engagement_invitation(**get_opportunity_engagement_invitation_request)
        logger.info("Successfully received response from get_engagement_invitation")
        return response

    except Exception as err:
        # Catch all client exceptions
        logger.error(f"Error in get_opportunity_engagement_invitation: {str(err)}")
        if hasattr(err, 'response'):
            logger.error(f"Error response: {json.dumps(err.response, default=str)}")
            return {"error": f"API Error: {str(err.response.get('Error', {}).get('Message', str(err)))}"}
        else:
            return {"error": f"Exception: {str(err)}"}

def usage_demo():
    identifier = "arn:aws:partnercentral-selling:us-east-1:aws:catalog/Sandbox/engagement-invitation/engi-0000000IS0Qga"

    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    print("-" * 88)
    print("Given the ARN identifier, retrieve details of Opportunity Engagement Invitation.")
    print("-" * 88)

    helper.pretty_print_datetime(get_opportunity_engagement_invitation(identifier))

if __name__ == "__main__":
    usage_demo()