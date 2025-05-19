#!/usr/bin/env python

# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

"""
Purpose:
API wrapper for simulating action required from AWS using update_opportunity functionality
"""

import boto3
import json
import logging
from botocore.client import ClientError
import utils.helpers as helper
from utils.constants import CATALOG_TO_USE
import copy

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

serviceName = "partnercentral-selling"

def get_and_update_opportunity(opportunity_id):
    """
    Get an opportunity and prepare it for update to simulate action required
    
    Args:
        opportunity_id (str): The opportunity identifier
        
    Returns:
        dict: The response from the update_opportunity API call or error details
    """
    try:
        # Initialize the boto3 client using session credentials
        from utils.aws_client import get_boto3_client
        partner_central_client = get_boto3_client(serviceName)
        
        # First, get the opportunity details
        logger.info(f"Getting opportunity details for {opportunity_id}")
        get_opportunity_request = {
            "Identifier": opportunity_id,
            "Catalog": CATALOG_TO_USE
        }
        
        get_response = partner_central_client.get_opportunity(**get_opportunity_request)
        
        if not get_response:
            logger.error("Failed to retrieve opportunity details")
            return {"error": "Failed to retrieve opportunity details"}
        
        # Create a completely separate copy of the original response
        original_response = copy.deepcopy(get_response)
        if 'ResponseMetadata' in original_response:
            del original_response['ResponseMetadata']
        
        # Store the original review status
        original_review_status = None
        if ('LifeCycle' in original_response and 
            'ReviewStatus' in original_response['LifeCycle']):
            original_review_status = original_response['LifeCycle']['ReviewStatus']
        
        # Create a separate copy for the update request
        update_request = copy.deepcopy(get_response)
        if 'ResponseMetadata' in update_request:
            del update_request['ResponseMetadata']
        
        # Change Id to Identifier in update request
        if 'Id' in update_request:
            update_request['Identifier'] = update_request['Id']
            del update_request['Id']
        
        # Only keep fields that are allowed in the update request
        allowed_fields = [
            'Catalog', 'Customer', 'Identifier', 'LastModifiedDate', 
            'LifeCycle', 'Marketing', 'NationalSecurity', 'OpportunityType', 
            'PartnerOpportunityIdentifier', 'PrimaryNeedsFromAws', 'Project', 
            'SoftwareRevenue', 'Origin'
        ]
        
        # Filter the update request to only include allowed fields
        update_request = {k: v for k, v in update_request.items() if k in allowed_fields}
        
        # Simulate action required by updating the review status in the update request
        if 'LifeCycle' not in update_request:
            update_request['LifeCycle'] = {}
        
        update_request['LifeCycle']['ReviewStatus'] = 'Action Required'
        update_request['LifeCycle']['ReviewStatusReason'] = 'Additional information needed'
        logger.info(f"Updating opportunity review status from {original_review_status} to Action Required")
        
        # Clean up the request by removing null values
        update_request = helper.remove_nulls(update_request)
        
        # Perform the update API call
        update_response = partner_central_client.update_opportunity(**update_request)
        logger.info("Status update successful")
        
        # Get the updated opportunity to show the actual result
        updated_opportunity = None
        try:
            updated_opportunity = partner_central_client.get_opportunity(
                Identifier=opportunity_id,
                Catalog=CATALOG_TO_USE
            )
            if 'ResponseMetadata' in updated_opportunity:
                del updated_opportunity['ResponseMetadata']
        except Exception as e:
            logger.error(f"Error getting updated opportunity: {str(e)}")
            # If we can't get the updated opportunity, just use the update response
            pass
        
        return {
            "original": original_response,
            "original_review_status": original_review_status,
            "update_request": update_request,
            "update_response": update_response,
            "updated_opportunity": updated_opportunity
        }
        
    except ClientError as err:
        # Return the error response
        logger.error(f"ClientError in simulate_action_required: {str(err)}")
        return {"error": err.response}
    except Exception as e:
        # Return any other exceptions
        logger.error(f"Unexpected error in simulate_action_required: {str(e)}")
        return {"error": str(e)}