# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

#!/usr/bin/env python
import boto3
import logging
import sys
import os
import json
import uuid
import random
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

def load_and_process_engagement_json():
    """Load the engagement JSON template and replace template variables"""
    # Get the directory of the current script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_file_path = os.path.join(script_dir, "createEngagementLead.json")
    
    # Read the JSON template
    with open(json_file_path, 'r') as f:
        content = f.read()
    
    # Generate random values
    client_token = str(uuid.uuid4())
    random_digits = f"{random.randint(1000, 9999)}"
    engagement_title = f"visualize Initiative - {random_digits}"
    
    print(f"Generated ClientToken: {client_token}")
    print(f"Generated Engagement Title: {engagement_title}")
    
    # Replace template variables
    content = content.replace("{{CLIENT_TOKEN}}", client_token)
    content = content.replace("{{ENGAGEMENT_TITLE}}", engagement_title)
    content = content.replace("{{CATALOG}}", config.CONFIG_VARS["CATALOG"])
    
    # Parse as JSON
    engagement_data = json.loads(content)
    
    # Ensure the title is set correctly (in case template replacement didn't work)
    if engagement_data.get('Title') != engagement_title:
        engagement_data['Title'] = engagement_title
    
    return engagement_data

def create_engagement(partner_central_client):
    create_engagement_request = remove_nulls(load_and_process_engagement_json())
    
    try:
        # Perform an API call
        response = partner_central_client.create_engagement(**create_engagement_request)
        
        helper.pretty_print_datetime(response)

        # Set the ENGAGEMENT_ID environment variable
        engagement_id = response.get("Id")
        if not engagement_id:
            print("ERROR: No engagement ID returned from API response")
            sys.exit(1)
            
        os.environ["ENGAGEMENT_ID"] = engagement_id
        print(f"Set ENGAGEMENT_ID environment variable to: {engagement_id}")
        
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
        
        # Update with new engagement ID
        env_data["ENGAGEMENT_ID"] = engagement_id
        
        # Write back to file
        with open(env_file_path, "w") as f:
            json.dump(env_data, f, indent=2)
        print(f"Saved ENGAGEMENT_ID to shared environment file: {env_file_path}")

        return response
    except ClientError as err:
        # Catch all client exceptions
        print("ERROR: Failed to create engagement")
        print(err.response)
        sys.exit(1)

def usage_demo():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    print("-" * 88)
    print("Create Engagement Lead.")
    print("-" * 88)

    partner_central_client = boto3.client(
        service_name=serviceName,
        region_name='us-east-1',
        endpoint_url=config.CONFIG_VARS["ENDPOINT_URL"]
    )

    create_engagement(partner_central_client)

if __name__ == "__main__":
    usage_demo()