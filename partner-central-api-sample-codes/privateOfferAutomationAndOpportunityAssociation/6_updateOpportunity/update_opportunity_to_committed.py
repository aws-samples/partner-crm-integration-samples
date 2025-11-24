# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

#!/usr/bin/env python

"""
Purpose
PC-API-2  Updating Partner Originated Opportunity - Change Stage to Committed
"""
import logging
import boto3
import sys
import os
import json
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import utils.helpers as helper
from botocore.client import ClientError

serviceName = "partnercentral-selling"

partner_central_client = boto3.client(
        service_name=serviceName,
        region_name='us-east-1'
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
    Priority: 1. Command line argument, 2. OPPORTUNITY_ID from shared_env.json, 3. Default value
    """
    default_identifier = "O5465588"
    
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
    
    # Use default
    print(f"Using default opportunity identifier: {default_identifier}")
    return default_identifier


def get_opportunity(identifier):
    get_opportunity_request ={
	    "Identifier": identifier,
        "Catalog": "Sandbox"
    }
    try:
        # Perform an API call
        response = partner_central_client.get_opportunity(**get_opportunity_request)
        return response

    except ClientError as err:
        # Catch all client exceptions
        print(err.response)
        return None


def modify_opportunity_payload(opportunity_response):
    """
    Modify the opportunity payload for update:
    1. Change 'Id' to 'Identifier'
    2. Remove 'CreatedDate', 'OpportunityTeam', 'RelatedEntityIdentifiers', 'Arn'
    3. Remove response metadata
    4. Change LifeCycle.Stage to 'Committed' (do NOT change ReviewStatus)
    """
    if not opportunity_response:
        return None
    
    # Create a copy of the response to modify
    modified_payload = opportunity_response.copy()
    
    # Remove ResponseMetadata if present
    if 'ResponseMetadata' in modified_payload:
        del modified_payload['ResponseMetadata']
    
    # Change 'Id' to 'Identifier'
    if 'Id' in modified_payload:
        modified_payload['Identifier'] = modified_payload['Id']
        del modified_payload['Id']
    
    # Remove unwanted fields
    fields_to_remove = ['CreatedDate', 'OpportunityTeam', 'RelatedEntityIdentifiers', 'Arn']
    for field in fields_to_remove:
        if field in modified_payload:
            del modified_payload[field]
            print(f"Removed field: {field}")
    
    # Change Stage to 'Committed' (do NOT change ReviewStatus)
    if 'LifeCycle' in modified_payload:
        current_stage = modified_payload['LifeCycle'].get('Stage', 'Unknown')
        modified_payload['LifeCycle']['Stage'] = 'Committed'
        print(f"Changed Stage from '{current_stage}' to 'Committed'")
        
        # Explicitly preserve ReviewStatus (do not change it)
        current_review_status = modified_payload['LifeCycle'].get('ReviewStatus')
        if current_review_status:
            print(f"Preserving ReviewStatus: '{current_review_status}' (unchanged)")
    else:
        print("LifeCycle field not found")
    
    return modified_payload


def save_update_payload_to_file(payload):
    """Save the modified payload to update_opportunity_committed.json"""
    if not payload:
        print("No payload to save")
        return
    
    # Get the directory of the current script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_file = os.path.join(script_dir, "update_opportunity_committed.json")
    
    try:
        with open(output_file, 'w') as f:
            json.dump(payload, f, indent=2, default=str)
        print(f"✓ Saved modified opportunity payload to: {output_file}")
    except Exception as e:
        print(f"Error saving payload to file: {e}")


def update_opportunity(payload):
    """
    Call the update_opportunity API with the modified payload
    """
    if not payload:
        print("No payload to update")
        return None
    
    try:
        print("Calling update_opportunity API...")
        response = partner_central_client.update_opportunity(**payload)
        print("✓ Successfully updated opportunity")
        return response
    except ClientError as err:
        print(f"Error updating opportunity: {err.response}")
        return None


def process_opportunity_for_update(identifier):
    """
    Get opportunity, modify payload, save to file, and update the opportunity
    """
    print(f"Getting opportunity details for: {identifier}")
    response = get_opportunity(identifier)
    
    if response is not None:
        print("✓ Successfully retrieved opportunity details")
        
        # Modify the payload
        modified_payload = modify_opportunity_payload(response)
        
        if modified_payload:
            print("✓ Successfully modified opportunity payload")
            
            # Save to file
            save_update_payload_to_file(modified_payload)
            
            # Actually update the opportunity
            update_response = update_opportunity(modified_payload)
            
            return {
                'original_payload': response,
                'modified_payload': modified_payload,
                'update_response': update_response
            }
        else:
            print("Failed to modify opportunity payload")
            return None
    else:
        print("Failed to retrieve opportunity details")
        return None

def usage_demo():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    print("-" * 88)
    print("Update Opportunity Stage to Committed")
    print("-" * 88)
    print("Usage: python update_opportunity_to_committed.py [opportunity_identifier]")
    print("  If opportunity_identifier is not provided, it will be taken from shared_env.json or default")
    print("  This script will:")
    print("  1. Get the opportunity details")
    print("  2. Modify the payload (change Stage to 'Committed')")
    print("  3. Save the payload to update_opportunity_committed.json")
    print("  4. Call update_opportunity API to actually update the opportunity")
    print("  Note: ReviewStatus will NOT be changed")
    print("-" * 88)

    # Get opportunity identifier from command line, shared environment, or default
    identifier = get_opportunity_identifier()
    
    print(f"\nProcessing opportunity: {identifier}")
    print()

    # Process the opportunity and update it
    result = process_opportunity_for_update(identifier)
    
    if result and result.get('update_response'):
        print("\n" + "="*50)
        print("UPDATE SUCCESSFUL!")
        print("="*50)
        print("Update Response:")
        helper.pretty_print_datetime(result['update_response'])
        
        print("\n" + "="*50)
        print("MODIFIED PAYLOAD USED:")
        print("="*50)
        helper.pretty_print_datetime(result['modified_payload'])
    elif result:
        print("\n" + "="*50)
        print("PAYLOAD GENERATED BUT UPDATE FAILED")
        print("="*50)
        if result.get('modified_payload'):
            print("Modified Payload:")
            helper.pretty_print_datetime(result['modified_payload'])
    else:
        print("Failed to process opportunity")

if __name__ == "__main__":
    usage_demo()