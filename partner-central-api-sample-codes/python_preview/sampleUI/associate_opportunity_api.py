#!/usr/bin/env python

# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

"""
Purpose:
API wrapper for associate_opportunity functionality
"""

import boto3
import logging
from botocore.client import ClientError
import utils.helpers as helper
from utils.constants import CATALOG_TO_USE

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

serviceName = "partnercentral-selling"

def associate_opportunity_with_entity(opportunity_identifier, entity_type, entity_identifier):
    """
    Associate an opportunity with an entity (Solution, AWS Product, or AWS Marketplace Offer)
    
    Args:
        opportunity_identifier (str): The opportunity identifier
        entity_type (str): The type of entity (Solutions, AWSProducts, AWSMarketplaceOffers)
        entity_identifier (str): The identifier of the entity
        
    Returns:
        dict: The response from the associate_opportunity API call
    """
    try:
        # Initialize the boto3 client using session credentials
        from utils.aws_client import get_boto3_client
        partner_central_client = get_boto3_client(serviceName)
        
        # Create the request payload
        associate_opportunity_request = {
            "Catalog": CATALOG_TO_USE,
            "OpportunityIdentifier": opportunity_identifier,
            "RelatedEntityType": entity_type,
            "RelatedEntityIdentifier": entity_identifier
        }
        
        # Perform the API call
        logger.info(f"Associating opportunity {opportunity_identifier} with {entity_type} {entity_identifier}")
        response = partner_central_client.associate_opportunity(**associate_opportunity_request)
        logger.info("Association successful")
        return response
        
    except ClientError as err:
        # Return the error response
        logger.error(f"ClientError in associate_opportunity: {str(err)}")
        return {"error": err.response}
    except Exception as e:
        # Return any other exceptions
        logger.error(f"Unexpected error in associate_opportunity: {str(e)}")
        return {"error": str(e)}