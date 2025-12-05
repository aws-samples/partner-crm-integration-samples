# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0
"""
Purpose
Shows how to use the AWS SDK for Python (Boto3) to search CloudWatch Logs for 
private offer acceptance events (Purchase Agreement Created - Proposer)
"""

import logging
import sys
import os
import json
import time
from datetime import datetime, timedelta

import boto3
from botocore.exceptions import ClientError

# CloudWatch Logs configuration
LOG_GROUP_NAME = "/aws/events/mpagreement"
DETAIL_TYPE = "Purchase Agreement Created - Proposer"

logger = logging.getLogger(__name__)


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


def get_offer_id():
    """
    Get offer ID from command line argument or shared environment
    Priority: 1. Command line argument, 2. OFFER_ID from shared_env.json
    """
    # Check command line argument
    if len(sys.argv) > 1:
        offer_id = sys.argv[1]
        print(f"Using offer ID from command line: {offer_id}")
        return offer_id
    
    # Check shared environment file
    shared_env = load_shared_env_values()
    shared_offer_id = shared_env.get('OFFER_ID')
    if shared_offer_id:
        print(f"Using offer ID from shared environment: {shared_offer_id}")
        return shared_offer_id
    
    print("Error: No offer ID provided. Please provide via command line or shared_env.json")
    sys.exit(1)


def search_cloudwatch_logs(logs_client, offer_id, hours_back=24):
    """
    Search CloudWatch Logs for private offer acceptance events
    
    Args:
        logs_client: boto3 CloudWatch Logs client
        offer_id: The offer ID to search for
        hours_back: How many hours back to search (default: 24)
    
    Returns:
        List of matching log events
    """
    # Calculate time range (CloudWatch uses milliseconds since epoch)
    end_time = int(time.time() * 1000)
    start_time = int((time.time() - (hours_back * 3600)) * 1000)
    
    # Build the query - note the event structure has detail.offer.id not detail.offerId
    query = f'''
    fields @timestamp, @message, detail.agreement.id, detail.offer.id, detail.agreement.acceptanceTime, detail.agreement.status
    | filter `detail-type` = "{DETAIL_TYPE}"
    | filter detail.offer.id = "{offer_id}"
    | sort @timestamp desc
    '''
    
    print(f"Searching logs from {datetime.utcfromtimestamp(start_time/1000)} UTC to {datetime.utcfromtimestamp(end_time/1000)} UTC")
    print(f"Query: {query}")
    print()
    
    try:
        # Start the query
        response = logs_client.start_query(
            logGroupName=LOG_GROUP_NAME,
            startTime=start_time,
            endTime=end_time,
            queryString=query
        )
        
        query_id = response['queryId']
        print(f"Query started with ID: {query_id}")
        
        # Wait for query to complete
        status = 'Running'
        while status == 'Running' or status == 'Scheduled':
            time.sleep(1)
            result = logs_client.get_query_results(queryId=query_id)
            status = result['status']
            print(f"Query status: {status}")
        
        if status == 'Complete':
            return result['results']
        else:
            print(f"Query failed with status: {status}")
            return []
            
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceNotFoundException':
            print(f"Error: Log group '{LOG_GROUP_NAME}' not found.")
            print("Make sure the log group exists and you have the correct permissions.")
        else:
            logger.error(f"Error searching CloudWatch Logs: {e}")
        return []


def format_log_results(results):
    """Format and display log results"""
    if not results:
        print("No matching events found.")
        print("\nThis means the private offer has not been accepted yet.")
        return
    
    print(f"\n✓ Found {len(results)} matching event(s) - Private offer has been accepted!")
    print("=" * 88)
    
    for i, result in enumerate(results, 1):
        print(f"\nEvent {i}:")
        print("-" * 88)
        
        # Extract key fields for summary
        event_data = {}
        message_json = None
        
        for field in result:
            field_name = field['field']
            field_value = field['value']
            event_data[field_name] = field_value
            
            if field_name == '@message':
                try:
                    message_json = json.loads(field_value)
                except json.JSONDecodeError:
                    pass
        
        # Display summary information
        if message_json:
            detail = message_json.get('detail', {})
            agreement = detail.get('agreement', {})
            offer = detail.get('offer', {})
            acceptor = detail.get('acceptor', {})
            
            print(f"Agreement ID: {agreement.get('id', 'N/A')}")
            print(f"Offer ID: {offer.get('id', 'N/A')}")
            print(f"Status: {agreement.get('status', 'N/A')}")
            print(f"Acceptance Time: {agreement.get('acceptanceTime', 'N/A')}")
            print(f"Start Time: {agreement.get('startTime', 'N/A')}")
            print(f"End Time: {agreement.get('endTime', 'N/A')}")
            print(f"Acceptor Account: {acceptor.get('accountId', 'N/A')}")
            print(f"Event Time: {message_json.get('time', 'N/A')}")
            print()
            print("Full Event Details:")
            print(json.dumps(message_json, indent=2))
        else:
            # Fallback to displaying all fields
            for field_name, field_value in event_data.items():
                print(f"{field_name}: {field_value}")


def usage_demo():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    print("-" * 88)
    print("Searching CloudWatch Logs for Private Offer Acceptance")
    print("-" * 88)
    print("Usage: python check_cloudwatch_logs.py [offer_id] [hours_back]")
    print("  offer_id: Offer ID to search for (from command line or shared_env.json)")
    print("  hours_back: How many hours back to search (default: 24)")
    print("-" * 88)
    print()

    # Get offer ID
    offer_id = get_offer_id()
    
    # Get hours back (optional parameter)
    hours_back = 24
    if len(sys.argv) > 2:
        try:
            hours_back = int(sys.argv[2])
            print(f"Searching logs from the last {hours_back} hours")
        except ValueError:
            print(f"Invalid hours_back value, using default: {hours_back}")
    
    print(f"Searching for offer ID: {offer_id}")
    print(f"Detail type: {DETAIL_TYPE}")
    print(f"Log group: {LOG_GROUP_NAME}")
    print()

    # Create CloudWatch Logs client
    logs_client = boto3.client("logs")

    # Search logs
    results = search_cloudwatch_logs(logs_client, offer_id, hours_back)
    
    # Display results
    format_log_results(results)


if __name__ == "__main__":
    usage_demo()
