# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

#!/usr/bin/env python
import boto3
import logging
import sys
import os
import json
import uuid
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import utils.helpers as helper
import utils.config as config
from botocore.client import ClientError

serviceName = "partnercentral-selling"

def remove_nulls(obj):
    """Remove null values from dictionary recursively"""
    if isinstance(obj, dict):
        return {k: remove_nulls(v) for k, v in obj.items() if v is not None}
    elif isinstance(obj, list):
        return [remove_nulls(item) for item in obj if item is not None]
    else:
        return obj

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

def load_and_process_engagement_invitation_json():
    """Load the engagement invitation JSON template and replace template variables"""
    # Get the directory of the current script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_file_path = os.path.join(script_dir, "createEngagementInvitationLead.json")
    
    # Read the JSON template
    with open(json_file_path, 'r') as f:
        content = f.read()
    
    # Generate client token
    client_token = str(uuid.uuid4())
    print(f"Generated ClientToken: {client_token}")
    
    # Get engagement ID from shared environment
    shared_env = load_shared_env_values()
    engagement_id = shared_env.get('ENGAGEMENT_ID')
    if not engagement_id:
        print("ERROR: ENGAGEMENT_ID not found in shared_env.json")
        print("Please run step 0_1 first to create an engagement")
        sys.exit(1)
    print(f"Using Engagement ID: {engagement_id}")
    
    # Replace template variables
    content = content.replace("{{CLIENT_TOKEN}}", client_token)
    content = content.replace("{{ENGAGEMENT_ID}}", engagement_id)
    content = content.replace("{{CATALOG}}", config.CONFIG_VARS["CATALOG"])
    content = content.replace("{{RECEIVING_AWS_ACCOUNT_ID}}", config.CONFIG_VARS["RECEIVING_AWS_ACCOUNT_ID"])
    
    # Parse as JSON
    invitation_data = json.loads(content)
    
    return invitation_data

def create_engagement_invitation(partner_central_client):
    create_invitation_request = remove_nulls(load_and_process_engagement_invitation_json())
    
    try:
        # Perform an API call
        response = partner_central_client.create_engagement_invitation(**create_invitation_request)
        
        helper.pretty_print_datetime(response)

        # Set the ENGAGEMENT_INVITATION_ID environment variable
        invitation_id = response.get("Id")
        if not invitation_id:
            print("ERROR: No engagement invitation ID returned from API response")
            sys.exit(1)
            
        os.environ["ENGAGEMENT_INVITATION_ID"] = invitation_id
        print(f"Set ENGAGEMENT_INVITATION_ID environment variable to: {invitation_id}")
        
        # Write to shared env file that other Python scripts can read
        env_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "shared_env.json")
        env_data = {}
        # Read existing data if file exists
        if os.path.exists(env_file_path):
            try:
                with open(env_file_path, "r") as f:
                    env_data = json.load(f)
            except:
                env_data = {}
        
        # Update with new invitation ID
        env_data["ENGAGEMENT_INVITATION_ID"] = invitation_id
        
        # Write back to file
        with open(env_file_path, "w") as f:
            json.dump(env_data, f, indent=2)
        print(f"Saved ENGAGEMENT_INVITATION_ID to shared environment file: {env_file_path}")

        return response
    except ClientError as err:
        # Catch all client exceptions
        print("ERROR: Failed to create engagement invitation")
        print(err.response)
        sys.exit(1)

def usage_demo():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    print("-" * 88)
    print("Create Engagement Invitation Lead.")
    print("-" * 88)

    partner_central_client = boto3.client(
        service_name=serviceName,
        region_name='us-east-1',
        endpoint_url=config.CONFIG_VARS["ENDPOINT_URL"]
    )

    create_engagement_invitation(partner_central_client)

if __name__ == "__main__":
    usage_demo()