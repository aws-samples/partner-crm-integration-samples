# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

#!/usr/bin/env python3

"""
Purpose
PC-API -14 Start Engagement from Opportunity Task
"""
import logging
import boto3
import sys
import os
import json
import uuid
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import utils.helpers as helper
import utils.config as config
from botocore.client import ClientError

serviceName = "partnercentral-selling"

partner_central_client = boto3.client(
        service_name=serviceName,
        region_name='us-east-1',
        endpoint_url=config.CONFIG_VARS["ENDPOINT_URL"]
)

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


def get_opportunity_identifier():
    """
    Get opportunity identifier from command line argument, shared environment, or default
    
    Priority:
    1. Command line argument
    2. OPPORTUNITY_ID from shared_env.json
    """
    # Check command line argument
    if len(sys.argv) > 1:
        identifier = sys.argv[1]
        print(f"Using opportunity identifier from command line: {identifier}")
        return identifier
    
    # Check shared environment
    shared_env = load_shared_env_values()
    opportunity_id = shared_env.get('OPPORTUNITY_ID')
    if opportunity_id:
        print(f"Using opportunity identifier from shared environment: {opportunity_id}")
        return opportunity_id
    
    # No ID found
    print("ERROR: OPPORTUNITY_ID not found in shared_env.json and not provided as command line argument")
    print("Please run step 5 first to create an opportunity, or provide the ID as a command line argument")
    sys.exit(1)


def start_engagement_from_opportunity_task(identifier):
    # Generate random ClientToken
    client_token = str(uuid.uuid4())
    print(f"Generated ClientToken: {client_token}")
    
    start_engagement_from_opportunity_task_request ={
            "AwsSubmission": { 
                "InvolvementType": "Co-Sell",
                "Visibility": "Full"
            },
            "Catalog": config.CONFIG_VARS["CATALOG"],
	        "Identifier" : identifier,
            "ClientToken": client_token
    }
    try:
            # Perform an API call
            response = partner_central_client.start_engagement_from_opportunity_task(**start_engagement_from_opportunity_task_request)
            return response

    except ClientError as err:
            # Catch all client exceptions
            print(err.response)
            return None
   
def usage_demo():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    print("-" * 88)
    print("Start Engagement from Opportunity Task.")
    print("-" * 88)
    print("Usage: python 4_start_engagement_from_opportunity_task.py [opportunity_identifier]")
    print("  If opportunity_identifier is not provided, it will be taken from shared_env.json or default")
    print("-" * 88)

    # Get opportunity identifier from command line, shared environment, or default
    identifier = get_opportunity_identifier()
    
    print(f"\nUsing Opportunity Identifier: {identifier}")
    print()

    response = start_engagement_from_opportunity_task(identifier)
    helper.pretty_print_datetime(response)

if __name__ == "__main__":
    usage_demo()
