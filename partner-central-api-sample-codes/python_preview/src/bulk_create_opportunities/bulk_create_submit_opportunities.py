# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

#!/usr/bin/env python

"""
Purpose
Bulk Creating and Submitting Opportunities
Creates opportunities from JSON files and submits them for engagement.
Logs results to separate files based on success/failure status.
"""
import boto3
import time
import logging
import sys
import os
import json
import uuid
from datetime import datetime
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import utils.helpers as helper
import utils.stringify_details as sd
from botocore.client import ClientError
from utils.constants import CATALOG_TO_USE

serviceName = "partnercentral-selling"

# Log file paths
LOG_DIR = os.path.dirname(os.path.abspath(__file__))
CREATE_FAILED_LOG = os.path.join(LOG_DIR, "create_failed.log")
SUBMIT_FAILED_LOG = os.path.join(LOG_DIR, "submit_failed.log")
SUCCESS_LOG = os.path.join(LOG_DIR, "success.log")


def log_to_file(log_file, message):
    """Append a log message to a file with timestamp"""
    timestamp = datetime.now().isoformat()
    with open(log_file, 'a') as f:
        f.write(f"[{timestamp}] {message}\n")


def create_opportunity(partner_central_client, file_path):
    """Create an opportunity from a JSON file"""
    create_opportunity_request_orig = sd.stringify_json(file_path)
    create_opportunity_request = helper.remove_nulls(create_opportunity_request_orig)
    
    try:
        # Perform an API call
        response = partner_central_client.create_opportunity(**create_opportunity_request)
        get_response = partner_central_client.get_opportunity(
            Identifier=response["Id"],
            Catalog=CATALOG_TO_USE
        )
        print(f"✓ Created Opportunity: {response['Id']}")
        return response, None
    
    except ClientError as err:
        # Catch all client exceptions
        error_msg = f"Failed to create opportunity from {file_path}: {err.response}"
        print(f"✗ {error_msg}")
        return None, err.response


def start_engagement_from_opportunity_task(partner_central_client, opportunity_id):
    """Submit an opportunity for engagement"""
    # Generate random ClientToken
    client_token = str(uuid.uuid4())
    
    start_engagement_request = {
        "AwsSubmission": {
            "InvolvementType": "Co-Sell",
            "Visibility": "Full"
        },
        "Catalog": CATALOG_TO_USE,
        "Identifier": opportunity_id,
        "ClientToken": client_token
    }
    
    try:
        # Perform an API call
        response = partner_central_client.start_engagement_from_opportunity_task(**start_engagement_request)
        print(f"  ✓ Submitted Opportunity: {opportunity_id}")
        return response, None
    
    except ClientError as err:
        # Catch all client exceptions
        error_msg = f"Failed to submit opportunity {opportunity_id}: {err.response}"
        print(f"  ✗ {error_msg}")
        return None, err.response


def process_opportunity_file(partner_central_client, file_path):
    """
    Process a single opportunity file: create and submit
    Returns: (success, opportunity_id, create_error, submit_error)
    """
    print(f"\nProcessing: {file_path}")
    
    # Step 1: Create opportunity
    create_response, create_error = create_opportunity(partner_central_client, file_path)
    
    if create_error:
        # Log creation failure
        log_message = f"File: {file_path}\nError: {json.dumps(create_error, indent=2)}\n{'-'*80}"
        log_to_file(CREATE_FAILED_LOG, log_message)
        return False, None, create_error, None
    
    opportunity_id = create_response['Id']
    
    # Step 2: Submit opportunity
    submit_response, submit_error = start_engagement_from_opportunity_task(
        partner_central_client, 
        opportunity_id
    )
    
    if submit_error:
        # Log submission failure
        log_message = f"File: {file_path}\nOpportunity ID: {opportunity_id}\nError: {json.dumps(submit_error, indent=2)}\n{'-'*80}"
        log_to_file(SUBMIT_FAILED_LOG, log_message)
        return False, opportunity_id, None, submit_error
    
    # Log success
    log_message = f"File: {file_path}\nOpportunity ID: {opportunity_id}\nCreate Response: {json.dumps(create_response, cls=helper.DateTimeEncoder, indent=2)}\nSubmit Response: {json.dumps(submit_response, cls=helper.DateTimeEncoder, indent=2)}\n{'-'*80}"
    log_to_file(SUCCESS_LOG, log_message)
    
    return True, opportunity_id, None, None


def usage_demo():
    directory_path = 'src/bulk_create_opportunities/opportunities'
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    print("=" * 88)
    print("Bulk Create and Submit Opportunities")
    print("=" * 88)
    print(f"Log files will be created in: {LOG_DIR}")
    print(f"  - Success: {SUCCESS_LOG}")
    print(f"  - Create Failed: {CREATE_FAILED_LOG}")
    print(f"  - Submit Failed: {SUBMIT_FAILED_LOG}")
    print("=" * 88)

    partner_central_client = boto3.client(
        service_name=serviceName,
        region_name='us-east-1'
    )

    # Get all JSON files in the opportunities directory
    file_paths = [
        os.path.join(directory_path, f) 
        for f in os.listdir(directory_path) 
        if os.path.isfile(os.path.join(directory_path, f)) and f.endswith('.json')
    ]

    if not file_paths:
        print(f"No JSON files found in {directory_path}")
        return

    print(f"Found {len(file_paths)} opportunity file(s) to process\n")

    # Statistics
    total = len(file_paths)
    success_count = 0
    create_failed_count = 0
    submit_failed_count = 0

    # Process each opportunity file
    for file_path in file_paths:
        success, opp_id, create_err, submit_err = process_opportunity_file(
            partner_central_client, 
            file_path
        )
        
        if success:
            success_count += 1
        elif create_err:
            create_failed_count += 1
        elif submit_err:
            submit_failed_count += 1
        
        # Wait a second between requests
        time.sleep(1)

    # Print summary
    print("\n" + "=" * 88)
    print("SUMMARY")
    print("=" * 88)
    print(f"Total Processed:     {total}")
    print(f"✓ Fully Successful:  {success_count}")
    print(f"✗ Create Failed:     {create_failed_count}")
    print(f"✗ Submit Failed:     {submit_failed_count}")
    print("=" * 88)
    print(f"\nCheck log files in {LOG_DIR} for details")


if __name__ == "__main__":
    usage_demo()
