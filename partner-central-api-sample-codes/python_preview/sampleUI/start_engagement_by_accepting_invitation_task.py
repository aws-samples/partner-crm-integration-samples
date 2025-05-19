# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

#!/usr/bin/env python

"""
Purpose
PC-API -11 Associating a product
PC-API -12 Associating a solution
PC-API -13 Associating an offer
PC-API -14 Accept engagement invitation
"""
import logging
import boto3
import utils.helpers as helper
from botocore.client import ClientError

from utils.constants import CATALOG_TO_USE

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

serviceName = "partnercentral-selling"

def get_opportunity(identifier):
    # Use the session credentials via the utility function
    from utils.aws_client import get_boto3_client
    partner_central_client = get_boto3_client(serviceName)
    
    get_opportunity_request = {
        "Identifier": identifier,
        "Catalog": CATALOG_TO_USE
    }
    try:
        # Perform an API call
        logger.info(f"Getting engagement invitation details for {identifier}")
        response = partner_central_client.get_engagement_invitation(**get_opportunity_request)
        return response

    except ClientError as err:
        # Catch all client exceptions
        logger.error(f"Error getting engagement invitation: {str(err)}")
        return None

def start_engagement_by_accepting_invitation_task(identifier):
    """
    Accept an engagement invitation by its identifier
    
    Args:
        identifier (str): The ARN of the engagement invitation
        
    Returns:
        dict: The response from the API call or None if error/not PENDING
    """
    import uuid
    
    response = get_opportunity(identifier)
    
    if response is None:
        logger.error("Failed to get engagement invitation details")
        return None
        
    if response.get('Status') == 'PENDING':
        # Use the session credentials via the utility function
        from utils.aws_client import get_boto3_client
        partner_central_client = get_boto3_client(serviceName)
        
        client_token = f"web-ui-{uuid.uuid4()}"
        accept_opportunity_engagement_invitation_request = {
            "Catalog": CATALOG_TO_USE,
            "Identifier": identifier,
            "ClientToken": client_token
        }
        try:
            # Perform an API call
            logger.info(f"Accepting engagement invitation {identifier}")
            response = partner_central_client.start_engagement_by_accepting_invitation_task(**accept_opportunity_engagement_invitation_request)
            logger.info("Successfully accepted engagement invitation")
            return response

        except ClientError as err:
            # Catch all client exceptions
            logger.error(f"Error accepting engagement invitation: {str(err)}")
            return None
    else:
        logger.warning(f"Cannot accept invitation with status {response.get('Status')}. Only PENDING invitations can be accepted.")
        return None

def usage_demo():
    identifier = "arn:aws:partnercentral:us-east-1::catalog/Sandbox/engagement-invitation/engi-0000002isusga"
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    print("-" * 88)
    print("Get updated Opportunity.")
    print("-" * 88)

    helper.pretty_print_datetime(start_engagement_by_accepting_invitation_task(identifier))

if __name__ == "__main__":
    usage_demo()