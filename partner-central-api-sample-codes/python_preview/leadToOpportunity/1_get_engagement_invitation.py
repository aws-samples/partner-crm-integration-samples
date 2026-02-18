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

def get_engagement_invitation_id_from_args_and_env():
    """
    Get engagement invitation ID from command line arguments with fallback to shared environment and default
    
    Priority:
    - 1 arg: engagement_invitation_id from command line
    - 0 args: engagement_invitation_id from shared env or default
    """
    # Load shared environment values
    shared_env = load_shared_env_values()
    
    # Get values based on number of command line arguments
    num_args = len(sys.argv) - 1  # Exclude script name
    
    if num_args >= 1:
        # Engagement invitation ID provided via command line
        invitation_id = sys.argv[1]
        print(f"Using engagement_invitation_id from command line: {invitation_id}")
        
    else:
        # No parameters provided, use shared env
        invitation_id = shared_env.get('ENGAGEMENT_INVITATION_ID')
        if not invitation_id:
            print("ERROR: ENGAGEMENT_INVITATION_ID not found in shared_env.json and not provided as command line argument")
            print("Please run step 0_2 first to create an engagement invitation, or provide the ID as a command line argument")
            sys.exit(1)
        print(f"Using engagement_invitation_id from shared env: {invitation_id}")
    
    return invitation_id

def save_engagement_id_to_shared_env(engagement_id):
    """Save engagement ID to shared environment file"""
    env_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "shared_env.json")
    
    # Load existing data
    env_data = {}
    if os.path.exists(env_file_path):
        try:
            with open(env_file_path, "r") as f:
                env_data = json.load(f)
        except Exception as e:
            print(f"Warning: Could not load existing shared environment file: {e}")
    
    # Update with engagement ID
    env_data["ENGAGEMENT_ID"] = engagement_id
    
    # Save back to file
    try:
        with open(env_file_path, "w") as f:
            json.dump(env_data, f, indent=2)
        print(f"Saved ENGAGEMENT_ID to shared_env.json: {engagement_id}")
    except Exception as e:
        print(f"Error saving engagement ID to shared environment file: {e}")

def get_engagement_invitation(partner_central_client, invitation_id):
    """Get engagement invitation details by ID"""
    get_invitation_request = {
        "Catalog": config.CONFIG_VARS["CATALOG"],
        "Identifier": invitation_id
    }
    
    try:
        # Perform an API call
        response = partner_central_client.get_engagement_invitation(**get_invitation_request)
        return response

    except ClientError as err:
        # Catch all client exceptions
        print(err.response)
        return None

def usage_demo():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    print("-" * 88)
    print("Get Engagement Invitation Details.")
    print("-" * 88)
    print("Usage: python 1_get_engagement_invitation.py [engagement_invitation_id]")
    print("  If engagement_invitation_id is not provided, it will be taken from shared_env.json")
    print("  This script also saves the ENGAGEMENT_ID to shared_env.json for subsequent steps")
    print("-" * 88)

    # Get engagement invitation ID from command line arguments, shared environment, or default
    invitation_id = get_engagement_invitation_id_from_args_and_env()
    
    print(f"\nUsing Engagement Invitation ID: {invitation_id}")
    print()

    partner_central_client = boto3.client(
        service_name=serviceName,
        region_name='us-east-1',
        endpoint_url=config.CONFIG_VARS["ENDPOINT_URL"]
    )

    response = get_engagement_invitation(partner_central_client, invitation_id)
    if response:
        helper.pretty_print_datetime(response)
        
        # Extract engagement ID from the response and save to shared_env.json
        if 'EngagementId' in response:
            engagement_id = response['EngagementId']
            save_engagement_id_to_shared_env(engagement_id)
        else:
            print("Warning: Could not find EngagementId in the response")
    else:
        print("Failed to retrieve engagement invitation details")

if __name__ == "__main__":
    usage_demo()