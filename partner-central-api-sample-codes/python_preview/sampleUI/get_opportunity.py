# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

#!/usr/bin/env python

"""
Purpose
PC-API -08 Get updated Opportunity given opportunity id
"""
import logging
import boto3
import utils.helpers as helper
from botocore.client import ClientError

from utils.constants import CATALOG_TO_USE

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

serviceName = "partnercentral-selling"

def get_opportunity(identifier):
    # Use the session credentials via the utility function
    from utils.aws_client import get_boto3_client
    partner_central_client = get_boto3_client(serviceName)
    
    get_opportunity_request = {
        "Catalog": CATALOG_TO_USE,
        "Identifier": identifier
    }
    try:
        # Perform an API call
        logger.info(f"Making get_opportunity API call for {identifier}")
        response = partner_central_client.get_opportunity(**get_opportunity_request)
        logger.info("API call successful")
        return response

    except ClientError as err:
        # Catch all client exceptions
        logger.error(f"Error in get_opportunity: {str(err)}")
        return {"error": str(err)}
    except Exception as err:
        logger.error(f"Unexpected error in get_opportunity: {str(err)}")
        return {"error": str(err)}

def usage_demo():
    identifier = "O5465588"

    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    print("-" * 88)
    print("Get updated Opportunity.")
    print("-" * 88)

    helper.pretty_print_datetime(get_opportunity(identifier))

if __name__ == "__main__":
    usage_demo()