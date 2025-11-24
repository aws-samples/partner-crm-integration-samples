# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

#!/usr/bin/env python

"""
Purpose
PC-API -08 Get updated Opportunity given opportunity id
"""
import logging
import sys
import os
import json
import boto3
from botocore.client import ClientError

# Add parent directory to path to find utils module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import utils.helpers as helper
import utils.config as config

# Get catalog value from config
CATALOG_TO_USE = config.CATALOG_TO_USE

serviceName = "partnercentral-selling"

partner_central_client = boto3.client(
        service_name=serviceName,
        region_name='us-east-1'
)

def get_opportunity(identifier):
    get_opportunity_request ={
        "Catalog": CATALOG_TO_USE,
	    "Identifier": identifier
    }
    try:
        # Perform an API call
        response = partner_central_client.get_opportunity(**get_opportunity_request)
        return response

    except ClientError as err:
        # Catch all client exceptions
        print(err.response)

def usage_demo():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    
    # Get opportunity ID with priority: command line -> shared_env.json -> default
    identifier = None
    
    # 1. Try command line argument
    if len(sys.argv) > 1:
        identifier = sys.argv[1]
        print(f"Using opportunity ID from command line: {identifier}")
    else:
        # 2. Try shared_env.json
        env_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "shared_env.json")
        try:
            with open(env_file_path, "r") as f:
                env_data = json.load(f)
                identifier = env_data.get("OPPORTUNITY_ID")
                if identifier:
                    print(f"Using opportunity ID from shared_env.json: {identifier}")
        except:
            pass
        
        # 3. Use default if still not found
        if not identifier:
            identifier = "O5465588"
            print(f"Using default opportunity ID: {identifier}")
            print("Usage: python get_opportunity.py <opportunity_id>")
        print()

    print("-" * 88)
    print("Get updated Opportunity.")
    print("-" * 88)

    helper.pretty_print_datetime(get_opportunity(identifier))

if __name__ == "__main__":
    usage_demo()
