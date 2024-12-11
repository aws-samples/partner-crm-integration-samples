# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

#!/usr/bin/env python

"""
Purpose
Create eventbridge rule to listen to Opportunity Created event and send to lambda function.
"""
import boto3
import json

eventbridge = boto3.client('events')

# Opportunity Updated; Opportunity Created; Opportunity Accepted; Opportunity Rejected
event_type = "Opportunity Created"

event_pattern = {
    "source": ["aws.partnercentral-selling"],
    "detail-type": [event_type], 
    "detail": {"catalog": ["AWS"]}
}

#lambda_arn = 'your_lambda_function_arn'
target_id = 'OpportunityEventLambda_' + event_type
lambda_arn = 'arn:aws:lambda:us-east-1:111111111111:function:event-bridge-lambda'
lambda_arn = "arn:aws:lambda:us-east-1:691709974417:function:event-bridge-lambda"

response = eventbridge.put_rule(
    Name='MyOpportunityCreatedRule',
    EventPattern=json.dumps(event_pattern),
    State='ENABLED'
)
print('Rule ARN:', response['RuleArn'])

response = eventbridge.put_targets(
    Rule='MyOpportunityCreatedRule',
    Targets=[
        {
            'Id': 'MingOpportunityEventLambda',
            'Arn': lambda_arn,
        },
    ]
)
