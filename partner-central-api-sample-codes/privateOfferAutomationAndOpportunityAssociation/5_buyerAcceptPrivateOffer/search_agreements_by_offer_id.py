# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0
"""
Purpose
Shows how to use the AWS SDK for Python (Boto3) to search for agreements by offer id
AG-0
"""

import logging
import sys
import os
import json

import boto3
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import utils.helpers as helper
from botocore.exceptions import ClientError

# Default offer id to search by
DEFAULT_OFFER_ID = "1111111111111111111111111"

MAX_PAGE_RESULTS = 10

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
    Get offer ID from command line argument, shared environment, or default value
    Priority: 1. Command line argument, 2. OFFER_ID from shared_env.json, 3. Default OFFER_ID
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
    
    # Fall back to default
    print(f"Using default offer ID: {DEFAULT_OFFER_ID}")
    return DEFAULT_OFFER_ID


def get_agreements(mp_client, offer_id):
    AgreementSummaryList = []
    partyTypes = ["Proposer"]
    for value in partyTypes:
        try:
            agreement = mp_client.search_agreements(
                catalog="AWSMarketplace",
                maxResults=MAX_PAGE_RESULTS,
                filters=[
                    {"name": "PartyType", "values": [value]},
                    {"name": "OfferId", "values": [offer_id]},
                    {"name": "AgreementType", "values": ["PurchaseAgreement"]},
                ],
            )
        except ClientError as e:
            logger.error("Could not complete search_agreements request.")
            raise

        AgreementSummaryList.extend(agreement["agreementViewSummaries"])

        while "nextToken" in agreement and agreement["nextToken"] is not None:
            try:
                agreement = mp_client.search_agreements(
                    catalog="AWSMarketplace",
                    maxResults=MAX_PAGE_RESULTS,
                    nextToken=agreement["nextToken"],
                    filters=[
                        {"name": "PartyType", "values": [value]},
                        {"name": "OfferId", "values": [offer_id]},
                        {"name": "AgreementType", "values": ["PurchaseAgreement"]},
                    ],
                )
            except ClientError as e:
                logger.error("Could not complete search_agreements request.")
                raise

            AgreementSummaryList.extend(agreement["agreementViewSummaries"])

    return AgreementSummaryList


def usage_demo():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    print("-" * 88)
    print("Looking for an agreement by offer id.")
    print("-" * 88)
    print("Usage: python search_agreements_by_offer_id.py [offer_id]")
    print("  If offer_id is not provided, it will be taken from shared_env.json or default")
    print("-" * 88)

    # Get offer ID from command line, shared environment, or default
    offer_id = get_offer_id()
    
    print(f"\nSearching for agreements with Offer ID: {offer_id}")
    print()

    mp_client = boto3.client("marketplace-agreement")

    agreements = get_agreements(mp_client, offer_id)
    helper.pretty_print_datetime(agreements)


if __name__ == "__main__":
    usage_demo()
