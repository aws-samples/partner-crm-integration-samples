# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0
"""
Purpose
Shows how to use the AWS SDK for Python (Boto3) search for offer information in the AWS Marketplace Catalog
CAPI-29
"""

import json
import logging
import os
import sys

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

OFFER_ID = "offer-1111111111111"


def pretty_print(response):
    json_object = json.dumps(response, indent=4)
    print(json_object)


def get_offer_information(mp_client, entity_id):
    """
    Returns information about a given offer
    Args: entity_id str: Entity to return
    Returns: dict: Dictionary of offer information
    """

    try:
        response = mp_client.describe_entity(
            Catalog="AWSMarketplace",
            EntityId=entity_id,
        )

        return response

    except ClientError as e:
        if e.response["Error"]["Code"] == "ResourceNotFoundException":
            logger.error("Offer with ID %s not found.", entity_id)
        else:
            logger.error("Unexpected error: %s", e)


def load_shared_env_values():
    """Load values from shared environment file"""
    env_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "shared_env.json")
    
    if os.path.exists(env_file_path):
        try:
            with open(env_file_path, "r") as f:
                env_data = json.load(f)
            return env_data
        except Exception as e:
            print(f"Error loading shared environment file: {e}")
            return {}
    else:
        print("No shared environment file found")
        return {}


def get_offer_id():
    """
    Get offer ID from command line argument, shared environment, or default value
    Priority: 1. Command line argument, 2. OFFER_ID from shared_env.json, 3. Default OFFER_ID
    """
    # Check command line argument
    if len(sys.argv) > 1:
        offer_id = sys.argv[1]
        print(f"Using offer ID from command line: {offer_id}")
        return offer_id
    
    # Check shared environment file
    shared_env = load_shared_env_values()
    shared_offer_id = shared_env.get('OFFER_ID')
    if shared_offer_id:
        print(f"Using offer ID from shared environment: {shared_offer_id}")
        return shared_offer_id
    
    # Fall back to default
    print(f"Using default offer ID: {OFFER_ID}")
    return OFFER_ID


def save_offer_info_to_shared_env(response, offer_id):
    """
    Save OFFER_ID and OFFER_ARN to shared environment file
    
    Args:
        response: The response from describe_entity
        offer_id: The offer ID that was queried
    """
    if response:
        # Extract offer ARN from response
        offer_arn = response.get('EntityArn', '')
        
        # Save to shared environment file
        env_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "shared_env.json")
        env_data = {}
        
        # Read existing data if file exists
        if os.path.exists(env_file_path):
            try:
                with open(env_file_path, "r") as f:
                    env_data = json.load(f)
            except:
                env_data = {}
        
        # Update with offer information
        env_data["OFFER_ID"] = offer_id
        if offer_arn:
            env_data["OFFER_ARN"] = offer_arn
        
        # Write back to file
        with open(env_file_path, "w") as f:
            json.dump(env_data, f, indent=2)
        
        print(f"✓ Saved OFFER_ID={offer_id} to shared environment file")
        if offer_arn:
            print(f"✓ Saved OFFER_ARN={offer_arn} to shared environment file")
    else:
        print("⚠ No offer information to save")


def usage_demo():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    offer_id = get_offer_id()

    print("-" * 88)
    print(f"Looking for offer {offer_id} in the AWS Marketplace Catalog.")
    print("-" * 88)

    mp_client = boto3.client("marketplace-catalog")

    response = get_offer_information(mp_client, offer_id)
    pretty_print(response)
    
    # Save offer information to shared environment
    save_offer_info_to_shared_env(response, offer_id)


if __name__ == "__main__":
    usage_demo()
