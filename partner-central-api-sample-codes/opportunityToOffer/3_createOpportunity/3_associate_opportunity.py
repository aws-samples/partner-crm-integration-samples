# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

#!/usr/bin/env python

"""
Purpose
PC-API -11 Associating a product
PC-API -12 Associating a solution
PC-API -13 Associating an offer
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


def get_parameters_from_args_and_env():
    """
    Get parameters from command line arguments with fallback to shared environment and defaults
    
    entity_type is always "Solutions"
    Priority for other parameters:
    - 2 args: entity_identifier, opportunity_identifier
    - 1 arg: entity_identifier (opportunity_identifier from shared env or default)
    - 0 args: both from shared env or defaults
    """
    # Default values
    default_entity_type = "Solutions"  # Always use Solutions
    default_entity_identifier = "S-0059717"
    default_opportunity_identifier = "O5465588"
    
    # Load shared environment values
    shared_env = load_shared_env_values()
    
    # entity_type is always "Solutions"
    entity_type = default_entity_type
    
    # Get values based on number of command line arguments
    num_args = len(sys.argv) - 1  # Exclude script name
    
    if num_args >= 2:
        # Two parameters provided: entity_identifier, opportunity_identifier
        entity_identifier = sys.argv[1]
        opportunity_identifier = sys.argv[2]
        print(f"Using entity_identifier and opportunity_identifier from command line:")
        print(f"  entity_identifier: {entity_identifier}")
        print(f"  opportunity_identifier: {opportunity_identifier}")
        
    elif num_args == 1:
        # One parameter provided: entity_identifier
        entity_identifier = sys.argv[1]
        opportunity_identifier = shared_env.get('OPPORTUNITY_ID', default_opportunity_identifier)
        print(f"Using entity_identifier from command line: {entity_identifier}")
        print(f"Using opportunity_identifier from shared env or default: {opportunity_identifier}")
        
    else:
        # No parameters provided, use shared env or defaults
        entity_identifier = shared_env.get('SOLUTION_ID', default_entity_identifier)
        opportunity_identifier = shared_env.get('OPPORTUNITY_ID', default_opportunity_identifier)
        print(f"Using parameters from shared env or defaults:")
        print(f"  entity_identifier: {entity_identifier}")
        print(f"  opportunity_identifier: {opportunity_identifier}")
    
    print(f"entity_type (always): {entity_type}")
    
    return entity_type, entity_identifier, opportunity_identifier


def associate_opportunity(entity_type, entity_identifier, opportunityIdentifier):
    associate_opportunity_request ={
        "Catalog": "Sandbox",
	    "OpportunityIdentifier" : opportunityIdentifier, 
        "RelatedEntityType" : entity_type, 
        "RelatedEntityIdentifier" : entity_identifier 
    }
    try:
        # Perform an API call
        response = partner_central_client.associate_opportunity(**associate_opportunity_request)
        return response

    except ClientError as err:
        # Catch all client exceptions
        print(err.response)

def usage_demo():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    print("-" * 88)
    print("Associate Opportunity.")
    print("-" * 88)
    print("Usage: python 3_associate_opportunity.py [entity_identifier] [opportunity_identifier]")
    print("  entity_type is always 'Solutions'")
    print("  If parameters are missing, values will be taken from shared_env.json or defaults")
    print("-" * 88)

    # Get parameters from command line arguments, shared environment, or defaults
    entity_type, entity_identifier, opportunity_identifier = get_parameters_from_args_and_env()
    
    print(f"\nFinal parameters:")
    print(f"  Entity Type: {entity_type}")
    print(f"  Entity Identifier: {entity_identifier}")
    print(f"  Opportunity Identifier: {opportunity_identifier}")
    print()

    response = associate_opportunity(entity_type, entity_identifier, opportunity_identifier)
    helper.pretty_print_datetime(response)

if __name__ == "__main__":
    usage_demo()
