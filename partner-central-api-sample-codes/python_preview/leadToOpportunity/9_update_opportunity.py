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

def load_json_file(file_path):
    """Load JSON data from file"""
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return None

def get_opportunity_details(partner_central_client, opportunity_id):
    """Get opportunity details by ID"""
    print(f"Getting opportunity details for: {opportunity_id}")
    print(f"Using catalog: {config.CONFIG_VARS["CATALOG"]}")
    
    get_opportunity_request = {
        "Catalog": config.CONFIG_VARS["CATALOG"],
        "Identifier": opportunity_id
    }
    
    try:
        # Perform an API call
        response = partner_central_client.get_opportunity(**get_opportunity_request)
        print("Successfully retrieved opportunity details")
        return response
    except ClientError as err:
        print(f"Error getting opportunity details: {err.response}")
        return None

def transform_opportunity_for_update(opportunity_data):
    """Transform get_opportunity response for update operation"""
    if not opportunity_data:
        return None
    
    print("Transforming opportunity data for update...")
    
    # Make a deep copy to avoid modifying the original
    update_data = json.loads(json.dumps(opportunity_data, default=str))
    
    # Remove ResponseMetadata if present
    if 'ResponseMetadata' in update_data:
        del update_data['ResponseMetadata']
        print("Removed ResponseMetadata")
    
    # Change Id to Identifier
    if 'Id' in update_data:
        update_data['Identifier'] = update_data['Id']
        del update_data['Id']
        print("Changed Id to Identifier")
    
    # Remove specified fields
    fields_to_remove = ['Arn', 'CreatedDate', 'OpportunityTeam', 'RelatedEntityIdentifiers']
    for field in fields_to_remove:
        if field in update_data:
            del update_data[field]
            print(f"Removed field: {field}")
    
    return update_data

def add_missing_fields_from_template(update_data):
    """Add missing fields from createOpportunity.json template"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Load the create opportunity JSON as reference
    create_file_path = os.path.join(script_dir, "createOpportunity.json")
    create_data = load_json_file(create_file_path)
    
    if not create_data:
        print("Failed to load createOpportunity.json")
        return update_data
    
    print("Adding missing fields from createOpportunity.json...")
    
    # Remove null values helper function
    def remove_nulls(obj):
        if isinstance(obj, dict):
            return {k: remove_nulls(v) for k, v in obj.items() if v is not None}
        elif isinstance(obj, list):
            return [remove_nulls(item) for item in obj if item is not None]
        else:
            return obj
    
    # Add missing Customer.Account fields
    if 'Customer' in update_data and 'Account' in update_data['Customer']:
        account = update_data['Customer']['Account']
        create_account = create_data.get('Customer', {}).get('Account', {})
        
        # Add missing address fields
        if 'Address' in account:
            if 'PostalCode' not in account['Address']:
                account['Address']['PostalCode'] = create_account.get('Address', {}).get('PostalCode', "10001")
                print("Added PostalCode to Address")
            if 'StateOrRegion' not in account['Address']:
                account['Address']['StateOrRegion'] = create_account.get('Address', {}).get('StateOrRegion', "New York")
                print("Added StateOrRegion to Address")
        
        # Add other account fields
        if 'AwsAccountId' not in account:
            account['AwsAccountId'] = create_account.get('AwsAccountId', "111111111111")
            print("Added AwsAccountId")
        
        if 'Duns' not in account:
            account['Duns'] = create_account.get('Duns', "111100111")
            print("Added Duns")
    
    # Add Contacts if empty
    if 'Customer' in update_data and 'Contacts' in update_data['Customer']:
        if not update_data['Customer']['Contacts']:
            create_contacts = create_data.get('Customer', {}).get('Contacts', [])
            if create_contacts:
                update_data['Customer']['Contacts'] = create_contacts
                print("Added Customer Contacts from template")
    
    # Add missing LifeCycle fields
    if 'LifeCycle' in update_data:
        lifecycle = update_data['LifeCycle']
        create_lifecycle = create_data.get('LifeCycle', {})
        
        if 'NextSteps' not in lifecycle:
            lifecycle['NextSteps'] = create_lifecycle.get('NextSteps', "Continue engagement and move to next stage")
            print("Added NextSteps to LifeCycle")
    
    # Replace entire Marketing section with template
    if 'Marketing' in create_data:
        update_data['Marketing'] = create_data['Marketing'].copy()
        print("Replaced entire Marketing section with template")
    
    # Add missing top-level fields
    if 'PrimaryNeedsFromAws' not in update_data:
        update_data['PrimaryNeedsFromAws'] = create_data.get('PrimaryNeedsFromAws', ["Co-Sell - Architectural Validation"])
        print("Added PrimaryNeedsFromAws")
    
    # Add missing Project fields
    if 'Project' in update_data:
        project = update_data['Project']
        create_project = create_data.get('Project', {})
        
        project_fields = ['CompetitorName', 'CustomerUseCase', 'DeliveryModels', 'SalesActivities']
        for field in project_fields:
            if field not in project and field in create_project:
                project[field] = create_project[field]
                print(f"Added {field} to Project")
        
        # Remove OtherSolutionDescription to avoid conflicts with defined solutions
        if 'OtherSolutionDescription' in project:
            del project['OtherSolutionDescription']
            print("Removed OtherSolutionDescription to avoid solution conflicts")
        
        # Ensure ExpectedCustomerSpend has data
        if 'ExpectedCustomerSpend' in project and not project['ExpectedCustomerSpend']:
            project['ExpectedCustomerSpend'] = create_project.get('ExpectedCustomerSpend', [])
            print("Added ExpectedCustomerSpend to Project")
    
    # Add SoftwareRevenue if missing
    if 'SoftwareRevenue' not in update_data and 'SoftwareRevenue' in create_data:
        update_data['SoftwareRevenue'] = create_data['SoftwareRevenue']
        print("Added SoftwareRevenue")
    
    # Clean up null values
    update_data = remove_nulls(update_data)
    print("Removed null values")
    
    return update_data

def save_updated_json(update_data):
    """Save the updated JSON back to file"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    update_file_path = os.path.join(script_dir, "update_opportunity_from_lead.json")
    
    try:
        with open(update_file_path, 'w') as f:
            json.dump(update_data, f, indent=2)
        print(f"Updated and saved: {update_file_path}")
        return True
    except Exception as e:
        print(f"Error saving updated JSON: {e}")
        return False

def update_opportunity(partner_central_client, update_data):
    """Update opportunity using the merged data"""
    print(f"Using catalog: {config.CONFIG_VARS["CATALOG"]}")
    
    try:
        # Perform the API call
        response = partner_central_client.update_opportunity(**update_data)
        return response
    except ClientError as err:
        print(f"Error updating opportunity: {err.response}")
        return None

def usage_demo():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    print("-" * 88)
    print("Update Opportunity from Lead.")
    print("-" * 88)
    print("Usage: python 0_11_update_opportunity.py [opportunity_id]")
    print("  If opportunity_id is not provided, it will be taken from shared_env.json or default")
    print("-" * 88)

    # Get opportunity ID from command line arguments, shared environment, or default
    opportunity_id = get_opportunity_id_from_args_and_env()
    
    print(f"\nUpdating Opportunity ID: {opportunity_id}")
    print()

    # Create the boto3 client
    partner_central_client = boto3.client(
        service_name=serviceName,
        region_name='us-east-1',
        endpoint_url=config.CONFIG_VARS["ENDPOINT_URL"]
    )
    
    # Step 1: Get the full opportunity using get_opportunity API
    opportunity_data = get_opportunity_details(partner_central_client, opportunity_id)
    
    if not opportunity_data:
        print("Failed to get opportunity details")
        return
    
    # Step 2: Transform the opportunity data for update
    update_data = transform_opportunity_for_update(opportunity_data)
    
    if not update_data:
        print("Failed to transform opportunity data")
        return
    
    # Step 3: Add missing fields from createOpportunity.json
    merged_data = add_missing_fields_from_template(update_data)
    
    if not merged_data:
        print("Failed to merge opportunity data with template")
        return
    
    # Save the updated JSON
    if not save_updated_json(merged_data):
        print("Failed to save updated JSON")
        return
    
    print("\nUpdate opportunity data from template:")
    helper.pretty_print_datetime(merged_data)
    
    # Step 4: Update the opportunity
    print(f"\nCalling update_opportunity API...")
    response = update_opportunity(partner_central_client, merged_data)
    
    if response:
        print("\nOpportunity updated successfully!")
        helper.pretty_print_datetime(response)
    else:
        print("Failed to update opportunity")

if __name__ == "__main__":
    usage_demo()