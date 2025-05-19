# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

#!/usr/bin/env python

"""
Purpose
PC-API-09 Update Opportunity after launch
"""
import logging
import boto3
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import utils.helpers as helper
from botocore.client import ClientError
import utils.stringify_details as sd
from utils.constants import CATALOG_TO_USE

serviceName = "partnercentral-selling"

partner_central_client = boto3.client(
        service_name=serviceName,
        region_name='us-east-1'
)

def get_opportunity(identifier):
    get_opportunity_request ={
	    "Identifier": identifier,
        "Catalog": CATALOG_TO_USE
    }
    try:
        # Perform an API call
        response = partner_central_client.get_opportunity(**get_opportunity_request)
        return response

    except ClientError as err:
        # Catch all client exceptions
        print(err.response)

def update_opportunity(i):
    update_opportunity_request_orig = sd.stringify_json("src/update_opportunity/update_opportunity.json")
    update_opportunity_request = helper.remove_nulls(update_opportunity_request_orig)

    
    try:
        # Perform an API call
        response = partner_central_client.update_opportunity(**update_opportunity_request)
        return response

    except ClientError as err:
        # Catch all client exceptions
        print(err.response)

def update_opportunity_if_eligible(identifier):
    response = get_opportunity(identifier)
    print(response)
    if response is not None:
        
        # Check if conditions are met to update the opportunity
        if (response["LifeCycle"] is not None 
            and response["LifeCycle"]["Stage"] is not None
            and response["LifeCycle"]["Stage"] == "Launched") :
            return update_opportunity()
        else:
            print("Opportunity cannot be updated because it is not launched")
    else:
        print("Failed to retrieve opportunity details.")

def usage_demo():
    identifier = "O4056043"

    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    print("-" * 88)
    print("Updating opportunity.")
    print("-" * 88)

    helper.pretty_print_datetime(update_opportunity_if_eligible(identifier))

if __name__ == "__main__":
    usage_demo()