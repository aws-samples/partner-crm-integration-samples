# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

#!/usr/bin/env python

"""
Purpose
PC-API -17 Replacing a solution
"""
import logging
import boto3
import utils.helpers as helper
from botocore.client import ClientError

from utils.constants import CATALOG_TO_USE

serviceName = "partnercentral-selling"

partner_central_client = boto3.client(
        service_name=serviceName,
        region_name='us-east-1'
)

def replace_solution(original_entity_identifier, new_entity_identifier, opportunityIdentifier):
    disassociate_opportunity_request ={
        "Catalog": CATALOG_TO_USE,
	    "OpportunityIdentifier" : opportunityIdentifier, 
        "RelatedEntityType" : "Solutions", 
        "RelatedEntityIdentifier" : original_entity_identifier 
    }

    associate_opportunity_request ={
        "Catalog": CATALOG_TO_USE,
	    "OpportunityIdentifier" : opportunityIdentifier, 
        "RelatedEntityType" : "Solutions", 
        "RelatedEntityIdentifier" : new_entity_identifier 
    }
    try:
        # Perform an API call
        response = partner_central_client.disassociate_opportunity(**disassociate_opportunity_request)
        response = partner_central_client.associate_opportunity(**associate_opportunity_request)
        return response

    except ClientError as err:
        # Catch all client exceptions
        print(err.response)

def usage_demo():
    original_entity_identifier = "S-0049999"
    new_entity_identifier = "S-0050014"
    opportunityIdentifier = "O4397574"

    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    print("-" * 88)
    print("Replacing a solution.")
    print("-" * 88)

    helper.pretty_print_datetime(replace_solution(original_entity_identifier, new_entity_identifier, opportunityIdentifier))

if __name__ == "__main__":
    usage_demo()
