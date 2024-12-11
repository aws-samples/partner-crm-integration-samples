# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

#!/usr/bin/env python

"""
Purpose
Sample Lambda code to handle different events.
"""

import json

def lambda_handler(event, context):
    print(json.dumps(event))
    if event['detail-type'] ==  "Opportunity Created":
        #perform Opportunity Created steps
        print(event['detail-type'])
    if event['detail-type'] ==  "Opportunity Updated":
        #perform Opportunity Updated steps
        print(event['detail-type'])
    if event['detail-type'] ==  "Opportunity Engagement Invitation Created":
        #perform Opportunity Engagement Invitation Created steps
        print(event['detail-type'])
    if event['detail-type'] ==  "Opportunity Engagement Invitation Accepted":
        #perform Opportunity Engagement Invitation Accepted steps
        print(event['detail-type'])
    if event['detail-type'] ==  "Opportunity Engagement Invitation Rejected":
        #perform Opportunity Engagement Invitation Rejected steps
        print(event['detail-type'])
    return {
        'statusCode': 200,
        'body': json.dumps(event['detail-type'])
    }
    
	