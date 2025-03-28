# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

#!/usr/bin/env python

"""
Purpose
PC-API-30 Export opportunities to CSV file and opportunity json payload
API requests: ListOpportunities; GetOpportunity; GetAwsOpportunitySummary
"""
import json
import csv
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import utils.helpers as helper
import logging
import boto3
from utils.constants import CATALOG_TO_USE

SERVICE_NAME = "partnercentral-selling"
REGION_NAME = 'us-east-1'

partner_central_client = boto3.client(
    service_name=SERVICE_NAME,
    region_name=REGION_NAME
)

def fetch_opportunity_list():
    """Fetch the list of opportunities from the API with filters."""
    opportunity_list = []

    request_params = {
        "Catalog": CATALOG_TO_USE,
        "MaxResults": 20,
        "LastModifiedDate": {
            "AfterLastModifiedDate": "2024-11-02T21:35:39+00:00"
        },
        "LifeCycleReviewStatus": ["Approved"]
    }

    try:
        response = partner_central_client.list_opportunities(**request_params)
        opportunity_list.extend(response["OpportunitySummaries"])

        while "NextToken" in response and response["NextToken"] is not None:
            request_params["NextToken"] = response["NextToken"]
            response = partner_central_client.list_opportunities(**request_params)
            opportunity_list.extend(response["OpportunitySummaries"])

        print(f"Total opportunities: {len(opportunity_list)}")
        return opportunity_list

    except Exception as error:
        print(json.dumps(error.response))


def fetch_opportunity_details(identifier):
    """Fetch details of a single opportunity by its identifier."""
    request_params = {
        "Catalog": CATALOG_TO_USE,
        "Identifier": identifier
    }

    try:
        response = partner_central_client.get_opportunity(**request_params)
        return response

    except Exception as error:
        print(error.response)
        return {
            "Catalog": CATALOG_TO_USE,
            "Id": identifier,
            "FAILED": error.response['Error']['Code']
        }

def fetch_opportunity_details_aws(identifier):
    """Fetch high-level details about the opportunity sourced from AWS by its identifier."""
    request_params = {
        "Catalog": CATALOG_TO_USE,
        "RelatedOpportunityIdentifier": identifier
    }

    try:
        response = partner_central_client.get_aws_opportunity_summary(**request_params)
        return response

    except Exception as error:
        print(error.response)
        return {
            "Catalog": CATALOG_TO_USE,
            "RelatedOpportunityId": identifier,
            "FAILED": error.response['Error']['Code']
        }

def flatten_json_object(nested_json, parent_key='', separator='.'):
    """Flatten a nested JSON object into a single level dictionary."""
    items = []
    for key, value in nested_json.items():
        new_key = f"{parent_key}{separator}{key}" if parent_key else key
        if isinstance(value, dict):
            items.extend(flatten_json_object(value, new_key, separator).items())
        elif isinstance(value, list):
            for index, item in enumerate(value):
                items.extend(flatten_json_object({f"{new_key}[{index}]": item}).items())
        else:
            items.append((new_key, value))
    return dict(items)

def save_to_csv(data_records, file_path):
    """Save a list of flattened dictionaries to a CSV file."""
    if not data_records:
        print("No data to write.")
        return

    # Consolidate column names from all records to handle varying structures
    column_names = set()
    for record in data_records:
        column_names.update(flatten_json_object(record).keys())
    column_names = sorted(column_names)

    with open(file_path, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=column_names)
        writer.writeheader()
        for record in data_records:
            flattened_record = flatten_json_object(record)
            writer.writerow({col: flattened_record.get(col, '') for col in column_names})

def save_individual_files(data_records, directory, aws):
    """Save each record to a separate JSON file locally and to S3 bucket."""
    if not os.path.exists(directory):
        os.makedirs(directory)

    # Initialize S3 client
    s3_client = boto3.client('s3')
    bucket_name = os.getenv('S3_BUCKET_NAME')  # Get bucket name from environment variable
    
    if not bucket_name:
        raise ValueError("S3_BUCKET_NAME environment variable must be set")

    for record in data_records:
        record_id = record.get("Id", "unknown_id") if aws == "" else record.get("RelatedOpportunityId", "unknown_id")
        file_name = f"{record_id}{aws}.json"
        file_path = os.path.join(directory, file_name)
        
        # Save locally
        with open(file_path, 'w', encoding='utf-8') as file:
            json.dump(record, file, cls=helper.DateTimeEncoder, indent=4)
        
        # Upload to S3
        try:
            s3_key = f"opportunities/{file_name}"  # You can customize the S3 key prefix
            s3_client.upload_file(
                file_path,
                bucket_name,
                s3_key
            )
            print(f"Successfully uploaded {file_name} to S3 bucket {bucket_name}")
        except Exception as e:
            print(f"Error uploading {file_name} to S3: {str(e)}")

def main():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    print("-" * 88)
    print("Fetching list of Opportunities.")
    print("-" * 88)

    opportunities = fetch_opportunity_list()
    detailed_opportunities = []
    detailed_opportunities_aws = []

    for opportunity in opportunities:
        opportunity_data = json.loads(json.dumps(opportunity, cls=helper.DateTimeEncoder, indent=4))
        opportunity_details = fetch_opportunity_details(opportunity_data.get("Id"))
        opportunity_details_aws = fetch_opportunity_details_aws(opportunity_data.get("Id"))
        print(opportunity_data.get("Id"))
        detailed_opportunity_data = json.loads(json.dumps(opportunity_details, cls=helper.DateTimeEncoder, indent=4))
        detailed_opportunity_aws_data = json.loads(json.dumps(opportunity_details_aws, cls=helper.DateTimeEncoder, indent=4))
        detailed_opportunities.append(detailed_opportunity_data)
        detailed_opportunities_aws.append(detailed_opportunity_aws_data)

    # Save the detailed opportunities to a CSV file
    csv_file_path = os.path.join(os.getcwd(), "opportunities.csv")
    csv_file_path_aws = os.path.join(os.getcwd(), "opportunities_aws.csv")
    save_to_csv(detailed_opportunities, csv_file_path)
    save_to_csv(detailed_opportunities_aws, csv_file_path_aws)
    print(f"Data saved to {csv_file_path} and {csv_file_path_aws}")

    # Save each opportunity to a separate file
    opportunities_directory = os.path.join(os.getcwd(), "opportunities")
    save_individual_files(detailed_opportunities, opportunities_directory, "")
    save_individual_files(detailed_opportunities_aws, opportunities_directory, "aws")
    print(f"Individual opportunity files saved to {opportunities_directory}")

if __name__ == "__main__":
    main()