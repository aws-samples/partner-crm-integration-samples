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

def load_and_process_opportunity_json():
    """Load the opportunity JSON template and replace template variables"""
    # Get the directory of the current script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_file_path = os.path.join(script_dir, "createOpportunity.json")
    
    # Read the JSON template
    with open(json_file_path, 'r') as f:
        content = f.read()
    
    # Generate random values
    client_token = str(uuid.uuid4())
    random_digits = f"{random.randint(1000, 9999)}"
    opportunity_title = f"New Business Deal - {random_digits}"
    
    print(f"Generated ClientToken: {client_token}")
    print(f"Generated Opportunity Title: {opportunity_title}")
    
    # Replace template variables
    content = content.replace("{{CLIENT_TOKEN}}", client_token)
    content = content.replace("{{OPPORTUNITY_TITLE}}", opportunity_title)
    
    # Parse as JSON
    opportunity_data = json.loads(content)
    
    # Ensure the title is set correctly (in case template replacement didn't work)
    if opportunity_data.get('Project', {}).get('Title') != opportunity_title:
        if 'Project' not in opportunity_data:
            opportunity_data['Project'] = {}
        opportunity_data['Project']['Title'] = opportunity_title
    
    return opportunity_data

def create_opportunity(partner_central_client):
    create_opportunity_request = remove_nulls(load_and_process_opportunity_json())
    
    try:
        # Perform an API call
        response = partner_central_client.create_opportunity(**create_opportunity_request)
        
        helper.pretty_print_datetime(response)

        # Set the OPPORTUNITY_ID environment variable
        opportunity_id = response.get("Id", "O9913253")  # Default to O9913253 if Id not found
        os.environ["OPPORTUNITY_ID"] = opportunity_id
        print(f"Set OPPORTUNITY_ID environment variable to: {opportunity_id}")
        
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
        
        # Update with new opportunity ID
        env_data["OPPORTUNITY_ID"] = opportunity_id
        
        # Write back to file
        with open(env_file_path, "w") as f:
            json.dump(env_data, f, indent=2)
        print(f"Saved OPPORTUNITY_ID to shared environment file: {env_file_path}")

        # uncomment the follwoing to retrieve the opportunity details
        #get_response = partner_central_client.get_opportunity(
        #    Identifier=response["Id"],
        #    Catalog="Sandbox"  # Using Sandbox as specified in the JSON
        #)
        #helper.pretty_print_datetime(get_response)
        return response
    except ClientError as err:
        # Catch all client exceptions
        print(err.response)
        # Set default OPPORTUNITY_ID in case of error
        os.environ["OPPORTUNITY_ID"] = "O9913253"
        print("Set OPPORTUNITY_ID environment variable to default: O9913253")
        
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
        
        # Update with default opportunity ID
        env_data["OPPORTUNITY_ID"] = "O9913253"
        
        # Write back to file
        with open(env_file_path, "w") as f:
            json.dump(env_data, f, indent=2)
        print(f"Saved default OPPORTUNITY_ID to shared environment file: {env_file_path}")

def usage_demo():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    print("-" * 88)
    print("Create Opportunity.")
    print("-" * 88)

    partner_central_client = boto3.client(
        service_name=serviceName,
        region_name='us-east-1'
    )

    create_opportunity(partner_central_client)

if __name__ == "__main__":
    usage_demo()