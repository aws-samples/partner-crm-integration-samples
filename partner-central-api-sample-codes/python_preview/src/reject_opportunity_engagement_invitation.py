# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

#!/usr/bin/env python

"""
Purpose
PC-API-05 AWS Originated AO rejection - RejectOpportunityEngagementInvitation - Rejects a engagement invitation. 
This action indicates that the partner does not wish to participate in the engagement and 
provides a reason for the rejection.
Upon rejection, a OpportunityEngagementInvitationRejected event is triggered. 
Subsequently, the invitation will no longer be available for the partner to act on.
"""
import json
import logging
import boto3
import utils.helpers as helper

from utils.constants import CATALOG_TO_USE

serviceName = "partnercentral-selling"

partner_central_client = boto3.client(
        service_name=serviceName,
        region_name='us-east-1'
)

def reject_opportunity_engagement_invitation(identifier, reject_reason):
    reject_opportunity_engagement_invitation_request ={
        "Catalog": CATALOG_TO_USE,
	    "Identifier": identifier,
        "RejectionReason": reject_reason
    }
    try:
        # Perform an API call
        response = partner_central_client.reject_engagement_invitation(**reject_opportunity_engagement_invitation_request)
        return response

    except Exception as err:
        # Catch all client exceptions
        print(json.dumps(err.response))

def usage_demo():
    identifier = "arn:aws:partnercentral:us-east-1::catalog/Sandbox/engagement-invitation/engi-0000002isviga"
    reject_reason = "Customer problem unclear"

    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    print("-" * 88)
    print("Given the ARN identifier and reject reason, reject the Opportunity Engagement Invitation.")
    print("-" * 88)

    helper.pretty_print_datetime(reject_opportunity_engagement_invitation(identifier, reject_reason))

if __name__ == "__main__":
    usage_demo()
