#!/usr/bin/env python

# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

"""
Purpose:
API wrapper for start_engagement_from_opportunity_task functionality
"""

import boto3
import logging
from botocore.client import ClientError
import utils.helpers as helper
from utils.constants import CATALOG_TO_USE
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

serviceName = "partnercentral-selling"

def start_engagement_from_opportunity(opportunity_identifier, client_token=None):
    """
    Start an engagement from an opportunity task
    
    Args:
        opportunity_identifier (str): The opportunity identifier
        client_token (str, optional): A custom client token. If not provided, a unique one will be generated.
        
    Returns:
        dict: The response from the start_engagement_from_opportunity_task API call
    """
    try:
        # Initialize the boto3 client using session credentials
        from utils.aws_client import get_boto3_client
        partner_central_client = get_boto3_client(serviceName)
        
        # Use provided client token or generate a unique one
        if not client_token:
            client_token = f"web-ui-{uuid.uuid4()}"
        
        # Create the request payload
        start_engagement_request = {
            "AwsSubmission": { 
                "InvolvementType": "Co-Sell",
                "Visibility": "Full"
            },
            "Catalog": CATALOG_TO_USE,
            "Identifier": opportunity_identifier,
            "ClientToken": client_token
        }
        
        # Perform the API call
        logger.info(f"Starting engagement from opportunity {opportunity_identifier}")
        response = partner_central_client.start_engagement_from_opportunity_task(**start_engagement_request)
        logger.info("Engagement started successfully")
        return response
        
    except ClientError as err:
        # Return the error response
        logger.error(f"ClientError in start_engagement_from_opportunity: {str(err)}")
        return {"error": err.response}
    except Exception as e:
        # Return any other exceptions
        logger.error(f"Unexpected error in start_engagement_from_opportunity: {str(e)}")
        return {"error": str(e)}