# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

#!/usr/bin/env python

"""
Purpose
PC-API-21 ListEngagementInvitations - Retrieves a list of engagement invitations based on specified criteria. 
This operation allows partners to view all invitations to engagement.
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

def list_engagement_invitations():
    # Use the session credentials via the utility function
    from utils.aws_client import get_boto3_client
    partner_central_client = get_boto3_client(serviceName)
    
    list_engagement_invitations_request = {
        "Catalog": CATALOG_TO_USE,
        "Sort": {
            "SortBy": "InvitationDate",
            "SortOrder": "DESCENDING"
        },
        "ParticipantType": "RECEIVER",
        "MaxResults": 5
    }
    try:
        logger.info("Making list_engagement_invitations API call")
        # Perform an API call
        response = partner_central_client.list_engagement_invitations(**list_engagement_invitations_request)
        logger.info("Successfully received response from list_engagement_invitations")
        return response

    except Exception as err:
        # Catch all client exceptions
        logger.error(f"Error in list_engagement_invitations: {str(err)}")
        if hasattr(err, 'response'):
            logger.error(f"Error response: {json.dumps(err.response, default=str)}")
            return {"error": f"API Error: {str(err.response.get('Error', {}).get('Message', str(err)))}"}
        else:
            return {"error": f"Exception: {str(err)}"}

def usage_demo():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    print("-" * 88)
    print("Retrieve list of Engagement Invitations.")
    print("-" * 88)

    helper.pretty_print_datetime(list_engagement_invitations())

if __name__ == "__main__":
    usage_demo()