# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

#!/usr/bin/env python
import boto3
import logging
import sys
import os
import json
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import utils.helpers as helper
import utils.config as config
from botocore.client import ClientError

serviceName = "partnercentral-selling"

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

def get_opportunity_id_from_args_and_env():
    """Get opportunity ID from command line arguments with fallback to shared environment"""
    shared_env = load_shared_env_values()
    
    num_args = len(sys.argv) - 1
    
    if num_args >= 1:
        opportunity_id = sys.argv[1]
        print(f"Using opportunity_id from command line: {opportunity_id}")
    else:
        opportunity_id = shared_env.get('OPPORTUNITY_ID')
        if not opportunity_id:
            print("ERROR: OPPORTUNITY_ID not found in shared_env.json and not provided as command line argument")
            print("Please run step 5 first to create an opportunity, or provide the ID as a command line argument")
            sys.exit(1)
        print(f"Using opportunity_id from shared env: {opportunity_id}")
    
    return opportunity_id

def get_opportunity(partner_central_client, opportunity_id):
    """Get opportunity details by ID"""
    print(f"Using catalog: {config.CONFIG_VARS["CATALOG"]}")
    
    get_opportunity_request = {
        "Catalog": config.CONFIG_VARS["CATALOG"],
        "Identifier": opportunity_id
    }
    
    try:
        # Perform an API call
        response = partner_central_client.get_opportunity(**get_opportunity_request)
        return response
    except ClientError as err:
        print(f"Error getting opportunity details: {err.response}")
        return None

def create_update_opportunity_json(opportunity_data):
    """Create update opportunity JSON by modifying the get_opportunity response"""
    if not opportunity_data:
        return None
    
    # Make a deep copy to avoid modifying the original
    update_data = json.loads(json.dumps(opportunity_data, default=str))
    
    # Remove ResponseMetadata if present
    if 'ResponseMetadata' in update_data:
        del update_data['ResponseMetadata']
    
    # Change Id to Identifier
    if 'Id' in update_data:
        update_data['Identifier'] = update_data['Id']
        del update_data['Id']
    
    # Remove specified fields
    fields_to_remove = ['Arn', 'CreatedDate', 'OpportunityTeam', 'RelatedEntityIdentifiers']
    for field in fields_to_remove:
        if field in update_data:
            del update_data[field]
            print(f"Removed field: {field}")
    
    return update_data

def save_update_opportunity_json(update_data):
    """Save the update opportunity JSON to file"""
    if not update_data:
        print("No data to save")
        return
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_file_path = os.path.join(script_dir, "update_opportunity_from_lead.json")
    
    try:
        with open(json_file_path, 'w') as f:
            json.dump(update_data, f, indent=2)
        print(f"Saved update opportunity JSON to: {json_file_path}")
    except Exception as e:
        print(f"Error saving JSON file: {e}")

def usage_demo():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    print("-" * 88)
    print("Get Opportunity Details.")
    print("-" * 88)
    print("Usage: python 0_10_get_opportunity.py [opportunity_id]")
    print("  If opportunity_id is not provided, it will be taken from shared_env.json or default")
    print("-" * 88)

    # Get opportunity ID from command line arguments, shared environment, or default
    opportunity_id = get_opportunity_id_from_args_and_env()
    
    print(f"\nGetting details for Opportunity ID: {opportunity_id}")
    print()

    partner_central_client = boto3.client(
        service_name=serviceName,
        region_name='us-east-1',
        endpoint_url=config.CONFIG_VARS["ENDPOINT_URL"]
    )

    # Get opportunity details
    response = get_opportunity(partner_central_client, opportunity_id)
    
    if response:
        print("Complete opportunity JSON payload:")
        helper.pretty_print_datetime(response)
        
        # Create update opportunity JSON
        print("\nCreating update_opportunity_from_lead.json...")
        update_data = create_update_opportunity_json(response)
        
        if update_data:
            save_update_opportunity_json(update_data)
            print("\nUpdate opportunity JSON structure:")
            helper.pretty_print_datetime(update_data)
        else:
            print("Failed to create update opportunity JSON")
    else:
        print("Failed to retrieve opportunity details")

if __name__ == "__main__":
    usage_demo()