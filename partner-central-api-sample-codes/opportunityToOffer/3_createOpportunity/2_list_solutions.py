# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

#!/usr/bin/env python

"""
Purpose
PC-API-10 Getting list of solutions
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

def get_list_of_solutions():
    list_solutions_request ={
        "Catalog": "Sandbox",
	    "MaxResults": 20
    }
    try:
        # Perform an API call
        response = partner_central_client.list_solutions(**list_solutions_request)
        return response

    except ClientError as err:
        # Catch all client exceptions
        print(err.response)

def usage_demo():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    print("-" * 88)
    print("Getting list of solutions.")
    print("-" * 88)

    response = get_list_of_solutions()
    helper.pretty_print_datetime(response)
    
    # Set the first solution ID as SOLUTION_ID environment variable
    if response and 'SolutionSummaries' in response and len(response['SolutionSummaries']) > 0:
        first_solution_id = response['SolutionSummaries'][0]['Id']
        os.environ['SOLUTION_ID'] = first_solution_id
        print(f"Set SOLUTION_ID environment variable to: {first_solution_id}")
        
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
        
        # Update with solution ID
        env_data["SOLUTION_ID"] = first_solution_id
        
        # Write back to file
        with open(env_file_path, "w") as f:
            json.dump(env_data, f, indent=2)
        print(f"Saved SOLUTION_ID to shared environment file: {env_file_path}")
    else:
        print("No solutions found in the response")

if __name__ == "__main__":
    usage_demo()
