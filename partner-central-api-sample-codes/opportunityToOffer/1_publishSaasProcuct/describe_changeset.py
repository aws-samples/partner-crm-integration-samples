# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0
"""
Purpose
Shows how to use the AWS SDK for Python (Boto3) to describe a changeset
using the AWS Marketplace Catalog API DescribeChangeSet action.
"""

import json
import logging
import sys
import os
from datetime import datetime

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)


def describe_changeset(mp_client, changeset_id):
    """
    Describe a changeset using the DescribeChangeSet API action
    
    Args:
        mp_client: AWS Marketplace Catalog client
        changeset_id: The ID of the changeset to describe
        
    Returns:
        dict: The response from the DescribeChangeSet API call
    """
    try:
        response = mp_client.describe_change_set(
            Catalog="AWSMarketplace",
            ChangeSetId=changeset_id
        )
        
        logger.info("Successfully retrieved changeset details")
        return response
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']
        
        if error_code == 'ResourceNotFoundException':
            logger.error("Changeset not found: %s", changeset_id)
        elif error_code == 'AccessDeniedException':
            logger.error("Access denied. Check your permissions for changeset: %s", changeset_id)
        else:
            logger.error("Unexpected error describing changeset %s: %s - %s", 
                        changeset_id, error_code, error_message)
        
        raise


def format_changeset_details(response):
    """
    Format and display changeset details in a readable format
    
    Args:
        response: The response from describe_changeset
    """
    print("=" * 88)
    print("CHANGESET DETAILS")
    print("=" * 88)
    
    # Basic changeset information
    print(f"ChangeSet ID: {response.get('ChangeSetId', 'N/A')}")
    print(f"ChangeSet Name: {response.get('ChangeSetName', 'N/A')}")
    print(f"ChangeSet ARN: {response.get('ChangeSetArn', 'N/A')}")
    print(f"Status: {response.get('Status', 'N/A')}")
    print(f"Catalog: {response.get('Catalog', 'N/A')}")
    
    # Timestamps
    start_time = response.get('StartTime')
    end_time = response.get('EndTime')
    
    if start_time:
        print(f"Start Time: {start_time}")
    if end_time:
        print(f"End Time: {end_time}")
    
    # Failure information if present
    failure_code = response.get('FailureCode')
    failure_description = response.get('FailureDescription')
    
    if failure_code or failure_description:
        print("\n" + "-" * 40)
        print("FAILURE INFORMATION")
        print("-" * 40)
        if failure_code:
            print(f"Failure Code: {failure_code}")
        if failure_description:
            print(f"Failure Description: {failure_description}")
    
    # Change set details
    change_set = response.get('ChangeSet', [])
    if change_set:
        print("\n" + "-" * 40)
        print("CHANGES IN CHANGESET")
        print("-" * 40)
        
        for i, change in enumerate(change_set, 1):
            print(f"\nChange {i}:")
            print(f"  Change Type: {change.get('ChangeType', 'N/A')}")
            print(f"  Change Name: {change.get('ChangeName', 'N/A')}")
            
            entity = change.get('Entity', {})
            if entity:
                print(f"  Entity Type: {entity.get('Type', 'N/A')}")
                print(f"  Entity Identifier: {entity.get('Identifier', 'N/A')}")
            
            # Show error details if present
            error_detail_list = change.get('ErrorDetailList', [])
            if error_detail_list:
                print("  Errors:")
                for error in error_detail_list:
                    print(f"    - Code: {error.get('ErrorCode', 'N/A')}")
                    print(f"      Message: {error.get('ErrorMessage', 'N/A')}")
    
    print("\n" + "=" * 88)


def pretty_print_json(data, title="JSON Response"):
    """
    Pretty print JSON data
    
    Args:
        data: The data to print
        title: Title for the JSON output
    """
    print(f"\n{title}:")
    print("-" * len(title))
    print(json.dumps(data, indent=2, default=str))


def save_product_id_to_shared_env(response):
    """
    Save PRODUCT_ID to shared environment file if changeset succeeded
    
    Args:
        response: The response from describe_changeset
    """
    if response.get('Status') == 'SUCCEEDED':
        # Look for CreateProduct change to extract product ID
        change_set = response.get('ChangeSet', [])
        product_id = None
        
        for change in change_set:
            if change.get('ChangeType') == 'CreateProduct':
                entity = change.get('Entity', {})
                entity_identifier = entity.get('Identifier', '')
                # Extract product ID from entity identifier (format: prod-xxxxx@1)
                if '@' in entity_identifier:
                    product_id = entity_identifier.split('@')[0]
                    break
        
        if product_id:
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
            
            # Update with product ID
            env_data["PRODUCT_ID"] = product_id
            
            # Write back to file
            with open(env_file_path, "w") as f:
                json.dump(env_data, f, indent=2)
            
            print(f"✓ Saved PRODUCT_ID={product_id} to shared environment file")
            return product_id
        else:
            print("⚠ Could not extract product ID from changeset")
    else:
        print(f"⚠ Changeset status is {response.get('Status')}, not saving product ID")
    
    return None


def main():
    """
    Main function to demonstrate describing a changeset
    """
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    
    # Get changeset ID from command line argument or use default
    if len(sys.argv) > 1:
        changeset_id = sys.argv[1]
    else:
        # Use the changeset ID from the previous run as default
        changeset_id = "2irc20n325n8znc4fi4q0o3bb"
        print(f"No changeset ID provided. Using default: {changeset_id}")
        print("Usage: python describe_changeset.py <changeset_id>")
        print()
    
    try:
        # Create AWS Marketplace Catalog client
        mp_client = boto3.client("marketplace-catalog")
        
        print(f"Describing changeset: {changeset_id}")
        print("-" * 88)
        
        # Describe the changeset
        response = describe_changeset(mp_client, changeset_id)
        
        # Format and display the details
        format_changeset_details(response)
        
        # Save product ID if changeset succeeded
        save_product_id_to_shared_env(response)
        
        # Optionally show the full JSON response
        show_json = input("\nWould you like to see the full JSON response? (y/n): ").lower().strip()
        if show_json in ['y', 'yes']:
            pretty_print_json(response, "Full DescribeChangeSet Response")
        
        return response
        
    except ClientError as e:
        logger.error("Failed to describe changeset: %s", e)
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nOperation cancelled by user.")
        sys.exit(0)
    except Exception as e:
        logger.error("Unexpected error: %s", e)
        sys.exit(1)


if __name__ == "__main__":
    main()