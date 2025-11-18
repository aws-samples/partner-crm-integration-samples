# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0
"""
Purpose
Sets up an EventBridge rule to capture Purchase Agreement Created events
and send them to CloudWatch Logs for monitoring private offer acceptance.
"""

import logging
import json
import boto3
from botocore.exceptions import ClientError

# Configuration
RULE_NAME = "aws-mp-agreement-accept"
LOG_GROUP_NAME = "/aws/events/mpagreement"
EVENT_PATTERN = {
    "detail-type": ["Purchase Agreement Created - Proposer"],
    "source": ["aws.agreement-marketplace"]
}

logger = logging.getLogger(__name__)


def create_log_group(logs_client):
    """Create CloudWatch log group if it doesn't exist"""
    try:
        logs_client.create_log_group(logGroupName=LOG_GROUP_NAME)
        print(f"✓ Created CloudWatch log group: {LOG_GROUP_NAME}")
        return True
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceAlreadyExistsException':
            print(f"✓ CloudWatch log group already exists: {LOG_GROUP_NAME}")
            return True
        else:
            logger.error(f"Error creating log group: {e}")
            return False


def set_log_group_retention(logs_client, retention_days=7):
    """Set retention policy for the log group"""
    try:
        logs_client.put_retention_policy(
            logGroupName=LOG_GROUP_NAME,
            retentionInDays=retention_days
        )
        print(f"✓ Set log retention to {retention_days} days")
        return True
    except ClientError as e:
        logger.error(f"Error setting retention policy: {e}")
        return False


def create_eventbridge_rule(events_client):
    """Create EventBridge rule for agreement events"""
    try:
        response = events_client.put_rule(
            Name=RULE_NAME,
            EventPattern=json.dumps(EVENT_PATTERN),
            State='ENABLED',
            Description='Capture AWS Marketplace Purchase Agreement Created events'
        )
        print(f"✓ Created EventBridge rule: {RULE_NAME}")
        print(f"  Rule ARN: {response['RuleArn']}")
        return response['RuleArn']
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceAlreadyExistsException':
            print(f"✓ EventBridge rule already exists: {RULE_NAME}")
            # Get the existing rule ARN
            try:
                rule = events_client.describe_rule(Name=RULE_NAME)
                return rule['Arn']
            except ClientError:
                return None
        else:
            logger.error(f"Error creating EventBridge rule: {e}")
            return None


def get_log_group_arn(logs_client):
    """Get the ARN of the log group"""
    try:
        response = logs_client.describe_log_groups(
            logGroupNamePrefix=LOG_GROUP_NAME,
            limit=1
        )
        if response['logGroups']:
            return response['logGroups'][0]['arn']
        return None
    except ClientError as e:
        logger.error(f"Error getting log group ARN: {e}")
        return None


def add_cloudwatch_target(events_client, logs_client):
    """Add CloudWatch Logs as a target for the EventBridge rule"""
    log_group_arn = get_log_group_arn(logs_client)
    if not log_group_arn:
        print("✗ Could not get log group ARN")
        return False
    
    try:
        events_client.put_targets(
            Rule=RULE_NAME,
            Targets=[
                {
                    'Id': '1',
                    'Arn': log_group_arn
                }
            ]
        )
        print(f"✓ Added CloudWatch Logs as target for rule: {RULE_NAME}")
        print(f"  Target: {LOG_GROUP_NAME}")
        return True
    except ClientError as e:
        logger.error(f"Error adding target to rule: {e}")
        return False


def create_resource_policy(logs_client, rule_arn):
    """Create resource policy to allow EventBridge to write to CloudWatch Logs"""
    policy_name = "EventBridgeToCloudWatchLogs"
    
    # Extract region and account from rule ARN
    # Format: arn:aws:events:region:account-id:rule/rule-name
    arn_parts = rule_arn.split(':')
    region = arn_parts[3]
    account_id = arn_parts[4]
    
    policy_document = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "EventBridgeToCloudWatchLogs",
                "Effect": "Allow",
                "Principal": {
                    "Service": [
                        "events.amazonaws.com",
                        "delivery.logs.amazonaws.com"
                    ]
                },
                "Action": [
                    "logs:CreateLogStream",
                    "logs:PutLogEvents"
                ],
                "Resource": f"arn:aws:logs:{region}:{account_id}:log-group:{LOG_GROUP_NAME}:*"
            }
        ]
    }
    
    try:
        logs_client.put_resource_policy(
            policyName=policy_name,
            policyDocument=json.dumps(policy_document)
        )
        print(f"✓ Created resource policy to allow EventBridge to write to CloudWatch Logs")
        return True
    except ClientError as e:
        if e.response['Error']['Code'] == 'LimitExceededException':
            print("⚠ Resource policy already exists or limit reached")
            return True
        else:
            logger.error(f"Error creating resource policy: {e}")
            return False


def verify_setup(events_client, logs_client):
    """Verify the setup is complete"""
    print("\n" + "=" * 88)
    print("Verifying setup...")
    print("=" * 88)
    
    # Check rule
    try:
        rule = events_client.describe_rule(Name=RULE_NAME)
        print(f"✓ Rule '{RULE_NAME}' is {rule['State']}")
        print(f"  Event Pattern: {rule['EventPattern']}")
    except ClientError:
        print(f"✗ Rule '{RULE_NAME}' not found")
        return False
    
    # Check targets
    try:
        targets = events_client.list_targets_by_rule(Rule=RULE_NAME)
        if targets['Targets']:
            print(f"✓ Rule has {len(targets['Targets'])} target(s)")
            for target in targets['Targets']:
                print(f"  Target ARN: {target['Arn']}")
        else:
            print(f"✗ Rule has no targets")
            return False
    except ClientError:
        print(f"✗ Could not list targets")
        return False
    
    # Check log group
    try:
        response = logs_client.describe_log_groups(
            logGroupNamePrefix=LOG_GROUP_NAME,
            limit=1
        )
        if response['logGroups']:
            print(f"✓ Log group '{LOG_GROUP_NAME}' exists")
        else:
            print(f"✗ Log group '{LOG_GROUP_NAME}' not found")
            return False
    except ClientError:
        print(f"✗ Could not check log group")
        return False
    
    return True


def usage_demo():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    print("-" * 88)
    print("Setting up EventBridge Rule for AWS Marketplace Agreement Events")
    print("-" * 88)
    print(f"Rule Name: {RULE_NAME}")
    print(f"Log Group: {LOG_GROUP_NAME}")
    print(f"Event Pattern: {json.dumps(EVENT_PATTERN, indent=2)}")
    print("-" * 88)
    print()

    # Create AWS clients
    events_client = boto3.client('events')
    logs_client = boto3.client('logs')

    # Step 1: Create CloudWatch log group
    print("Step 1: Creating CloudWatch log group...")
    if not create_log_group(logs_client):
        print("✗ Failed to create log group")
        return
    
    # Set retention policy (optional, 7 days default)
    set_log_group_retention(logs_client, retention_days=7)
    print()

    # Step 2: Create EventBridge rule
    print("Step 2: Creating EventBridge rule...")
    rule_arn = create_eventbridge_rule(events_client)
    if not rule_arn:
        print("✗ Failed to create EventBridge rule")
        return
    print()

    # Step 3: Create resource policy
    print("Step 3: Creating resource policy...")
    if not create_resource_policy(logs_client, rule_arn):
        print("⚠ Warning: Resource policy creation failed, but setup may still work")
    print()

    # Step 4: Add CloudWatch Logs as target
    print("Step 4: Adding CloudWatch Logs as target...")
    if not add_cloudwatch_target(events_client, logs_client):
        print("✗ Failed to add target")
        return
    print()

    # Step 5: Verify setup
    if verify_setup(events_client, logs_client):
        print("\n" + "=" * 88)
        print("✓ Setup completed successfully!")
        print("=" * 88)
        print("\nThe EventBridge rule is now active and will capture:")
        print("  - Purchase Agreement Created - Proposer events")
        print(f"  - Events will be logged to: {LOG_GROUP_NAME}")
        print("\nYou can now use check_cloudwatch_logs.py to search for offer acceptance events.")
    else:
        print("\n✗ Setup verification failed. Please check the errors above.")


if __name__ == "__main__":
    usage_demo()
