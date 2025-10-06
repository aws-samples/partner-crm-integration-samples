# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0
"""
Purpose
Simple script to describe a changeset using the AWS Marketplace Catalog API
DescribeChangeSet action without interactive prompts.
"""

import json
import logging
import sys

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)


def describe_changeset_simple(changeset_id):
    """
    Simple function to describe a changeset and return the response
    
    Args:
        changeset_id: The ID of the changeset to describe
        
    Returns:
        dict: The response from the DescribeChangeSet API call
    """
    try:
        mp_client = boto3.client("marketplace-catalog")
        
        response = mp_client.describe_change_set(
            Catalog="AWSMarketplace",
            ChangeSetId=changeset_id
        )
        
        return response
        
    except ClientError as e:
        logger.error("Error describing changeset %s: %s", changeset_id, e)
        raise


def main():
    """
    Main function - requires changeset ID as command line argument
    """
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    
    if len(sys.argv) != 2:
        print("Usage: python describe_changeset_simple.py <changeset_id>")
        print("Example: python describe_changeset_simple.py 2irc20n325n8znc4fi4q0o3bb")
        sys.exit(1)
    
    changeset_id = sys.argv[1]
    
    try:
        response = describe_changeset_simple(changeset_id)
        
        # Print key information
        print(f"ChangeSet ID: {response.get('ChangeSetId')}")
        print(f"Status: {response.get('Status')}")
        print(f"Name: {response.get('ChangeSetName')}")
        
        if response.get('Status') == 'SUCCEEDED':
            print("✅ Changeset completed successfully!")
            
            # Extract product and offer IDs
            for change in response.get('ChangeSet', []):
                if change.get('ChangeType') == 'CreateProduct':
                    product_id = change.get('Entity', {}).get('Identifier', '').split('@')[0]
                    print(f"📦 Product ID: {product_id}")
                elif change.get('ChangeType') == 'CreateOffer':
                    offer_id = change.get('Entity', {}).get('Identifier', '').split('@')[0]
                    print(f"💰 Offer ID: {offer_id}")
                    
        elif response.get('Status') == 'FAILED':
            print("❌ Changeset failed!")
            print(f"Failure Code: {response.get('FailureCode')}")
            print(f"Failure Description: {response.get('FailureDescription')}")
            
        elif response.get('Status') in ['PREPARING', 'APPLYING']:
            print("⏳ Changeset is still in progress...")
            
        return response
        
    except Exception as e:
        logger.error("Failed to describe changeset: %s", e)
        sys.exit(1)


if __name__ == "__main__":
    main()