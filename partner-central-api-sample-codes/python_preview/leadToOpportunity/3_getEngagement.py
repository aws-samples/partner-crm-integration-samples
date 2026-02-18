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

def get_engagement_id_from_args_and_env():
    """
    Get engagement ID from command line arguments with fallback to shared environment and default
    
    Priority:
    - 1 arg: engagement_id from command line
    - 0 args: engagement_id from shared env or default
    """
    # Load shared environment values
    shared_env = load_shared_env_values()
    
    # Get values based on number of command line arguments
    num_args = len(sys.argv) - 1  # Exclude script name
    
    if num_args >= 1:
        # Engagement ID provided via command line
        engagement_id = sys.argv[1]
        print(f"Using engagement_id from command line: {engagement_id}")
        
    else:
        # No parameters provided, use shared env
        engagement_id = shared_env.get('ENGAGEMENT_ID')
        if not engagement_id:
            print("ERROR: ENGAGEMENT_ID not found in shared_env.json and not provided as command line argument")
            print("Please run step 0_1 first to create an engagement, or provide the ID as a command line argument")
            sys.exit(1)
        print(f"Using engagement_id from shared env: {engagement_id}")
    
    return engagement_id

def get_engagement(partner_central_client, engagement_id):
    """Get engagement details by ID"""
    get_engagement_request = {
        "Catalog": config.CONFIG_VARS["CATALOG"],
        "Identifier": engagement_id
    }
    
    try:
        # Perform an API call
        response = partner_central_client.get_engagement(**get_engagement_request)
        return response

    except ClientError as err:
        # Catch all client exceptions
        print(err.response)
        return None

def usage_demo():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    print("-" * 88)
    print("Get Engagement Details.")
    print("-" * 88)
    print("Usage: python 0_getEngagement.py [engagement_id]")
    print("  If engagement_id is not provided, it will be taken from shared_env.json or default")
    print("-" * 88)

    # Get engagement ID from command line arguments, shared environment, or default
    engagement_id = get_engagement_id_from_args_and_env()
    
    print(f"\nUsing Engagement ID: {engagement_id}")
    print()

    partner_central_client = boto3.client(
        service_name=serviceName,
        region_name='us-east-1',
        endpoint_url=config.CONFIG_VARS["ENDPOINT_URL"]
    )

    response = get_engagement(partner_central_client, engagement_id)
    if response:
        helper.pretty_print_datetime(response)
    else:
        print("Failed to retrieve engagement details")

if __name__ == "__main__":
    usage_demo()