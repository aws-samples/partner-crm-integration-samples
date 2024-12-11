# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

#!/usr/bin/env python

"""
Purpose
PC-API -20 Bulk Updating Opportunities
"""

import boto3
import time
import logging
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import utils.helpers as helper
import utils.stringify_details as sd
from botocore.client import ClientError
from utils.constants import CATALOG_TO_USE

serviceName = "partnercentral-selling"

def update_opportunitiy(partner_central_client, file_path):
    update_opportunity_request_orig = sd.stringify_json(file_path)
    update_opportunity_request = helper.remove_nulls(update_opportunity_request_orig)
    try:
        # Perform an API call
        response = partner_central_client.update_opportunity(**update_opportunity_request)
        get_response = partner_central_client.get_opportunity(
            Identifier=response["Id"],
            Catalog=CATALOG_TO_USE
        )
        print(f"GetOpportunity: {get_response}")
        return response

    except ClientError as err:
        # Catch all client exceptions
        print(err.response)

def usage_demo():

    directory_path = 'src/bulk_update_opportunities/opportunities'
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    print("-" * 88)
    print("Create Opportunity.")
    print("-" * 88)

    partner_central_client = boto3.client(
        service_name=serviceName,
        region_name='us-east-1'
)

    file_paths = [os.path.join(directory_path, f) for f in os.listdir(directory_path) if os.path.isfile(os.path.join(directory_path, f))]

    # wait for a second if the update opportunity is not finished with response status code = 200
    for file_path in file_paths:
        print(file_path)
        response = update_opportunitiy(partner_central_client, file_path)
        helper.pretty_print_datetime(response)
        time.sleep(1)

if __name__ == "__main__":
    usage_demo()

