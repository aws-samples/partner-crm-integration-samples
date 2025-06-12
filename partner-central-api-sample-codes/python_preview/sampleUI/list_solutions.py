# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

#!/usr/bin/env python

"""
Purpose
PC-API-10 Getting list of solutions
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

def get_list_of_solutions():
    # Use the session credentials via the utility function
    from utils.aws_client import get_boto3_client
    partner_central_client = get_boto3_client(serviceName)
    
    list_solutions_request = {
        "Catalog": CATALOG_TO_USE,
        "MaxResults": 20
    }
    try:
        # Perform an API call
        logger.info("Making list_solutions API call")
        response = partner_central_client.list_solutions(**list_solutions_request)
        logger.info("API call successful")
        return response

    except ClientError as err:
        # Catch all client exceptions
        logger.error(f"Error in list_solutions: {str(err)}")
        return {"error": str(err)}
    except Exception as err:
        logger.error(f"Unexpected error in list_solutions: {str(err)}")
        return {"error": str(err)}

def usage_demo():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    print("-" * 88)
    print("Getting list of solutions.")
    print("-" * 88)

    helper.pretty_print_datetime(get_list_of_solutions())

if __name__ == "__main__":
    usage_demo()