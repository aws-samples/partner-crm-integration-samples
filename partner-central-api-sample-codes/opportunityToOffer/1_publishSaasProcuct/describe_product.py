# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0
"""
Purpose
Shows how to use the AWS SDK for Python (Boto3) search for product information in the AWS Marketplace Catalog
CAPI-29
"""

import json
import logging
import os
import sys

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

PRODUCT_ID = "prod-gmevq7vtra6ws"


def pretty_print(response):
    json_object = json.dumps(response, indent=4)
    print(json_object)


def get_product_information(mp_client, entity_id):
    """
    Returns information about a given product
    Args: entity_id str: Entity to return
    Returns: dict: Dictionary of product information
    """

    try:
        response = mp_client.describe_entity(
            Catalog="AWSMarketplace",
            EntityId=entity_id,
        )

        return response

    except ClientError as e:
        if e.response["Error"]["Code"] == "ResourceNotFoundException":
            logger.error("Product with ID %s not found.", entity_id)
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


def get_product_id():
    """
    Get product ID from command line argument, shared environment, or default value
    Priority: 1. Command line argument, 2. PRODUCT_ID from shared_env.json, 3. Default PRODUCT_ID
    """
    # Check command line argument
    if len(sys.argv) > 1:
        product_id = sys.argv[1]
        print(f"Using product ID from command line: {product_id}")
        return product_id
    
    # Check shared environment file
    shared_env = load_shared_env_values()
    shared_product_id = shared_env.get('PRODUCT_ID')
    if shared_product_id:
        print(f"Using product ID from shared environment: {shared_product_id}")
        return shared_product_id
    
    # Fall back to default
    print(f"Using default product ID: {PRODUCT_ID}")
    return PRODUCT_ID


def save_product_info_to_shared_env(response, product_id):
    """
    Save PRODUCT_ID and PRODUCT_ARN to shared environment file
    
    Args:
        response: The response from describe_entity
        product_id: The product ID that was queried
    """
    if response:
        # Extract product ARN from response
        product_arn = response.get('EntityArn', '')
        
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
        
        # Update with product information
        env_data["PRODUCT_ID"] = product_id
        if product_arn:
            env_data["PRODUCT_ARN"] = product_arn
        
        # Write back to file
        with open(env_file_path, "w") as f:
            json.dump(env_data, f, indent=2)
        
        print(f"✓ Saved PRODUCT_ID={product_id} to shared environment file")
        if product_arn:
            print(f"✓ Saved PRODUCT_ARN={product_arn} to shared environment file")
    else:
        print("⚠ No product information to save")


def usage_demo():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    product_id = get_product_id()

    print("-" * 88)
    print(f"Looking for product {product_id} in the AWS Marketplace Catalog.")
    print("-" * 88)

    mp_client = boto3.client("marketplace-catalog")

    response = get_product_information(mp_client, product_id)
    pretty_print(response)
    
    # Save product information to shared environment
    save_product_info_to_shared_env(response, product_id)


if __name__ == "__main__":
    usage_demo()
