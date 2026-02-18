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
    """Get engagement ID from command line arguments with fallback to shared environment"""
    shared_env = load_shared_env_values()
    
    num_args = len(sys.argv) - 1
    
    if num_args >= 1:
        engagement_id = sys.argv[1]
        print(f"Using engagement_id from command line: {engagement_id}")
    else:
        engagement_id = shared_env.get('ENGAGEMENT_ID')
        if not engagement_id:
            print("ERROR: ENGAGEMENT_ID not found in shared_env.json and not provided as command line argument")
            print("Please run step 0_1 first to create an engagement, or provide the ID as a command line argument")
            sys.exit(1)
        print(f"Using engagement_id from shared env: {engagement_id}")
    
    return engagement_id

def start_opportunity_from_engagement_task(partner_central_client, engagement_id):
    """Start opportunity from engagement task"""
    
    # Generate a unique client token
    client_token = str(uuid.uuid4())
    print(f"Generated ClientToken: {client_token}")
    
    start_task_request = {
        "Catalog": config.CONFIG_VARS["CATALOG"],
        "ClientToken": client_token,
        "ContextIdentifier": "1",
        "Identifier": engagement_id,
        "Tags": [
            {
                "Key": "Source",
                "Value": "LeadConversion"
            }
        ]
    }
    
    print(f"Request payload: {json.dumps(start_task_request, indent=2)}")
    
    try:
        # Perform the API call
        response = partner_central_client.start_opportunity_from_engagement_task(**start_task_request)
        
        helper.pretty_print_datetime(response)
        
        # Extract task information
        task_id = response.get("TaskId")
        task_arn = response.get("TaskArn")
        opportunity_id = response.get("OpportunityId")
        
        if task_id:
            print(f"Task started successfully with ID: {task_id}")
            
            if opportunity_id:
                print(f"Opportunity created with ID: {opportunity_id}")
            
            # Save task ID and opportunity ID to shared environment
            env_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "shared_env.json")
            env_data = {}
            
            # Read existing data if file exists
            if os.path.exists(env_file_path):
                try:
                    with open(env_file_path, "r") as f:
                        env_data = json.load(f)
                except:
                    env_data = {}
            
            # Update with new task ID and opportunity ID
            env_data["TASK_ID"] = task_id
            if task_arn:
                env_data["TASK_ARN"] = task_arn
            if opportunity_id:
                env_data["OPPORTUNITY_ID"] = opportunity_id
            
            # Write back to file
            with open(env_file_path, "w") as f:
                json.dump(env_data, f, indent=2)
            print(f"Saved TASK_ID and OPPORTUNITY_ID to shared environment file: {env_file_path}")
        
        return response
        
    except ClientError as err:
        print(f"Error starting opportunity from engagement task: {err.response}")
        return None

def usage_demo():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    print("-" * 88)
    print("Start Opportunity From Engagement Task.")
    print("-" * 88)
    print("Usage: python 0_start_opportunity_from_engagement_task.py [engagement_id]")
    print("  If engagement_id is not provided, it will be taken from shared_env.json or default")
    print("-" * 88)

    # Get engagement ID from command line arguments, shared environment, or default
    engagement_id = get_engagement_id_from_args_and_env()
    
    print(f"\nStarting opportunity task for Engagement ID: {engagement_id}")
    print()

    partner_central_client = boto3.client(
        service_name=serviceName,
        region_name='us-east-1',
        endpoint_url=config.CONFIG_VARS["ENDPOINT_URL"]
    )

    start_opportunity_from_engagement_task(partner_central_client, engagement_id)

if __name__ == "__main__":
    usage_demo()