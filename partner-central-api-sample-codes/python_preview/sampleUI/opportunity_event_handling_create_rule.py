# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

#!/usr/bin/env python

"""
Purpose
Create eventbridge rule to listen to Opportunity Created event.
"""

import boto3
import json

client = boto3.client('events')
event_pattern = {
    "source": ["aws.partnercentral-selling"],
    "detail-type": ["Opportunity Created"], 
    "detail": {"catalog": ["AWS"]}
}
response = client.put_rule(
	Name='MyOpportunityCreatedRule2',
	EventPattern=json.dumps(event_pattern),
    State='ENABLED' 
)

print('Rule ARN:', response['RuleArn'])