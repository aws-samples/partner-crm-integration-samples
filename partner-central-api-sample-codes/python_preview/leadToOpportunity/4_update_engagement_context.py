# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

#!/usr/bin/env python
import boto3
import logging
import sys
import os
import json
import uuid
import requests
from datetime import datetime, timedelta
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import utils.helpers as helper
import utils.config as config
from botocore.client import ClientError
from botocore.auth import SigV4Auth
from botocore.awsrequest import AWSRequest

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

def get_engagement_details_raw_json(partner_central_client, engagement_id):
    """Get engagement details with raw JSON to preserve exact timestamp precision"""
    try:
        # Get AWS credentials from the boto3 client
        credentials = partner_central_client._get_credentials()
        
        # Prepare the request
        url = config.CONFIG_VARS["ENDPOINT_URL"] + "/"
        headers = {
            'Content-Type': 'application/x-amz-json-1.0',
            'X-Amz-Target': 'AWSPartnerCentralSelling.GetEngagement'
        }
        
        payload = {
            "Catalog": config.CONFIG_VARS["CATALOG"],
            "Identifier": engagement_id
        }
        
        # Create AWS request for signing
        request = AWSRequest(method='POST', url=url, data=json.dumps(payload), headers=headers)
        
        # Sign the request
        SigV4Auth(credentials, 'partnercentral-selling', 'us-east-1').add_auth(request)
        
        # Make the HTTP request
        response = requests.post(url, data=request.body, headers=dict(request.headers))
        
        if response.status_code == 200:
            # Parse the raw JSON to preserve exact timestamp format
            raw_json = response.json()
            return raw_json
        else:
            print(f"HTTP Error: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"Error making raw API call: {e}")
        return None

def load_and_process_update_context_json(engagement_data):
    """Load the update context JSON template and replace template variables with engagement data"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_file_path = os.path.join(script_dir, "updateEngagementContext.json")
    
    with open(json_file_path, 'r') as f:
        content = f.read()
    
    print("Processing update context template...")
    
    # Extract values from engagement data
    engagement_id = engagement_data.get('Id', 'eng-0f7hpyxwd2uzpy')
    engagement_last_modified_raw = engagement_data.get('ModifiedAt')
    
    # Use the exact string format from the API response
    if isinstance(engagement_last_modified_raw, str):
        engagement_last_modified = engagement_last_modified_raw
    elif isinstance(engagement_last_modified_raw, datetime):
        engagement_last_modified = engagement_last_modified_raw.isoformat().replace('+00:00', 'Z')
    else:
        from datetime import timezone
        engagement_last_modified = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    
    # Extract customer data from the first context
    contexts = engagement_data.get('Contexts', [])
    customer_data = {}
    interaction_data = {}
    
    if contexts and len(contexts) > 0:
        lead_payload = contexts[0].get('Payload', {}).get('Lead', {})
        customer_data = lead_payload.get('Customer', {})
        interactions = lead_payload.get('Interactions', [])
        if interactions and len(interactions) > 0:
            interaction_data = interactions[0]
    
    # Extract values with defaults
    company_name = customer_data.get('CompanyName', 'Acme Corp')
    industry = customer_data.get('Industry', 'Aerospace')
    country_code = customer_data.get('Address', {}).get('CountryCode', 'US')
    
    source_type = interaction_data.get('SourceType', 'Campaign')
    source_id = interaction_data.get('SourceId', 'SQFONL7I')
    source_name = interaction_data.get('SourceName', 'Recycled Wooden Shirt Campaign - 2025')
    existing_interaction_date = interaction_data.get('InteractionDate', '2025-10-30T05:10:43.191366+00:00')
    
    contact_data = interaction_data.get('Contact', {})
    contact_business_title = contact_data.get('BusinessTitle', 'Investor Implementation Officer')
    contact_first_name = contact_data.get('FirstName', 'Torey')
    contact_last_name = contact_data.get('LastName', 'Orn')
    
    # Calculate new interaction date (after existing one)
    try:
        if isinstance(existing_interaction_date, str):
            existing_date = datetime.fromisoformat(existing_interaction_date.replace('Z', '+00:00'))
        else:
            existing_date = existing_interaction_date
        
        new_date = existing_date + timedelta(days=1)
        new_interaction_date = new_date.isoformat().replace('+00:00', 'Z')
    except Exception as e:
        print(f"Error calculating new interaction date: {e}")
        from datetime import timezone
        new_interaction_date = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    
    print(f"Using Engagement ID: {engagement_id}")
    print(f"Using Engagement Last Modified: {engagement_last_modified}")
    print(f"Using Company Name: {company_name}")
    print(f"Using Industry: {industry}")
    print(f"New Interaction Date: {new_interaction_date}")
    
    # Replace template variables
    content = content.replace("{{CATALOG}}", config.CONFIG_VARS["CATALOG"])
    content = content.replace("{{ENGAGEMENT_ID}}", engagement_id)
    content = content.replace("{{ENGAGEMENT_LAST_MODIFIED_AT}}", engagement_last_modified)
    content = content.replace("{{COMPANY_NAME}}", company_name)
    content = content.replace("{{INDUSTRY}}", industry)
    content = content.replace("{{COUNTRY_CODE}}", country_code)
    content = content.replace("{{SOURCE_TYPE}}", source_type)
    content = content.replace("{{SOURCE_ID}}", source_id)
    content = content.replace("{{SOURCE_NAME}}", source_name)
    content = content.replace("{{INTERACTION_DATE}}", new_interaction_date)
    content = content.replace("{{CONTACT_BUSINESS_TITLE}}", contact_business_title)
    content = content.replace("{{CONTACT_FIRST_NAME}}", contact_first_name)
    content = content.replace("{{CONTACT_LAST_NAME}}", contact_last_name)
    
    # Parse as JSON
    update_data = json.loads(content)
    
    return update_data

def update_engagement_context(partner_central_client, engagement_id):
    """Update engagement context using boto3 SDK"""
    
    # Get fresh engagement details with exact timestamp precision
    print("Getting fresh engagement details for exact timestamp...")
    fresh_engagement_raw = get_engagement_details_raw_json(partner_central_client, engagement_id)
    if not fresh_engagement_raw:
        print("Failed to get engagement details")
        return None
    
    print("Current engagement details retrieved successfully")
    
    # Load and process the update context request
    update_context_request = remove_nulls(load_and_process_update_context_json(fresh_engagement_raw))
    
    print(f"Update payload: {json.dumps(update_context_request, indent=2)}")
    
    try:
        # Perform the API call using boto3 SDK
        response = partner_central_client.update_engagement_context(**update_context_request)
        
        helper.pretty_print_datetime(response)
        print(f"\nSuccessfully updated engagement context for: {engagement_id}")
        
        return response
    except ClientError as err:
        print(f"Error updating engagement context: {err.response}")
        return None

def usage_demo():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    print("-" * 88)
    print("Update Engagement Context (SDK).")
    print("-" * 88)
    print("Usage: python 0_6_update_engagement_context.py [engagement_id]")
    print("  If engagement_id is not provided, it will be taken from shared_env.json or default")
    print("-" * 88)

    # Get engagement ID from command line arguments, shared environment, or default
    engagement_id = get_engagement_id_from_args_and_env()
    
    print(f"\nUpdating context for Engagement ID: {engagement_id}")
    print()

    partner_central_client = boto3.client(
        service_name=serviceName,
        region_name='us-east-1',
        endpoint_url=config.CONFIG_VARS["ENDPOINT_URL"]
    )

    update_engagement_context(partner_central_client, engagement_id)

if __name__ == "__main__":
    usage_demo()