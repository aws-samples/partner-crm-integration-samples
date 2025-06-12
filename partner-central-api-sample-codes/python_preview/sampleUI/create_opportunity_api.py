#!/usr/bin/env python

# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

"""
Purpose:
API wrapper for create_opportunity functionality
"""

import boto3
import json
import logging
import random
import uuid
from botocore.client import ClientError
import utils.helpers as helper
from utils.constants import CATALOG_TO_USE

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

serviceName = "partnercentral-selling"

def generate_random_title(base_title="New Business Deal"):
    """
    Generate a title with random numbers appended
    
    Args:
        base_title (str): The base title to append random numbers to
        
    Returns:
        str: The title with random numbers appended
    """
    random_suffix = random.randint(1000, 9999)
    return f"{base_title}-{random_suffix}"

def create_opportunity_with_payload(payload_json, client_token=None):
    """
    Create an opportunity using the provided JSON payload
    
    Args:
        payload_json (dict): The opportunity creation request payload
        client_token (str, optional): A custom client token. If not provided, a unique one will be generated.
        
    Returns:
        dict: The response from the create_opportunity API call
    """
    try:
        # Initialize the boto3 client using session credentials
        from utils.aws_client import get_boto3_client
        partner_central_client = get_boto3_client(serviceName)
        
        # Clean up the payload by removing null values
        create_opportunity_request = helper.remove_nulls(payload_json)
        
        # Add or update client token if needed
        if client_token:
            create_opportunity_request["ClientToken"] = client_token
        elif "ClientToken" not in create_opportunity_request or not create_opportunity_request["ClientToken"]:
            create_opportunity_request["ClientToken"] = f"web-ui-{uuid.uuid4()}"
        
        # Perform the API call
        logger.info("Making create_opportunity API call")
        response = partner_central_client.create_opportunity(**create_opportunity_request)
        logger.info(f"Successfully created opportunity with ID: {response.get('Id', 'unknown')}")
        
        # Get the opportunity details
        if response and "Id" in response:
            try:
                logger.info(f"Getting details for newly created opportunity: {response['Id']}")
                get_response = partner_central_client.get_opportunity(
                    Identifier=response["Id"],
                    Catalog=CATALOG_TO_USE
                )
                return {
                    "create_response": response,
                    "get_response": get_response
                }
            except Exception as get_err:
                logger.error(f"Error getting opportunity details: {str(get_err)}")
                # Return just the create response if get fails
                return {"create_response": response}
        
        return {"create_response": response}
        
    except ClientError as err:
        # Return the error response
        logger.error(f"ClientError in create_opportunity: {str(err)}")
        return {"error": err.response}
    except Exception as e:
        # Return any other exceptions
        logger.error(f"Unexpected error in create_opportunity: {str(e)}")
        return {"error": str(e)}

def prepare_default_payload(json_payload):
    """
    Prepare the default JSON payload by updating the Project.Title and ClientToken
    
    Args:
        json_payload (str): The JSON payload as a string
        
    Returns:
        str: The updated JSON payload as a string
    """
    try:
        # Parse the JSON payload
        payload = json.loads(json_payload)
        
        # Update the Project.Title with a random suffix
        if "Project" in payload and "Title" in payload["Project"]:
            base_title = payload["Project"]["Title"]
            payload["Project"]["Title"] = generate_random_title(base_title)
        
        # Generate a new client token
        payload["ClientToken"] = f"web-ui-{uuid.uuid4()}"
        
        # Convert back to JSON string with proper escaping for HTML
        return json.dumps(json.dumps(payload))
    except Exception as e:
        logger.error(f"Error preparing payload: {str(e)}")
        # Return the original payload if there's an error
        return json_payload