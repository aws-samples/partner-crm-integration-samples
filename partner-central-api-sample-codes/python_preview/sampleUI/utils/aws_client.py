#!/usr/bin/env python

# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

"""
Purpose:
Utility functions for creating AWS clients with flexible credential sources
"""

import os
import boto3
import logging
import sys
from flask import session
import botocore.session
from botocore.exceptions import ProfileNotFound

# Create logs directory
log_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'logs')
os.makedirs(log_dir, exist_ok=True)
log_file = os.path.join(log_dir, 'aws_client.log')

# Reset root logger
for handler in logging.root.handlers[:]:
    logging.root.removeHandler(handler)

# Configure basic logging to file
logging.basicConfig(
    filename=log_file,
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filemode='a'  # append mode
)

# Add console output
console = logging.StreamHandler(sys.stdout)
console.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
console.setFormatter(formatter)
logging.getLogger('').addHandler(console)

# Get logger for this module
logger = logging.getLogger(__name__)

# Write a test message
with open(log_file, 'a') as f:
    f.write("Direct write test: AWS client module loaded\n")

# Log a test message
logger.info("AWS client module initialized")

def get_boto3_client(service_name, region_name='us-east-1'):
    """
    Get a boto3 client using the best available credential source
    
    Priority order:
    1. Environment variables (for local development)
    2. Session credentials (from web UI login)
    3. AWS credentials file (for local development)
    4. Instance profile (for EC2 deployment)
    
    Args:
        service_name (str): The AWS service name
        region_name (str): The AWS region name (default: us-east-1)
        
    Returns:
        boto3.client: A boto3 client for the specified service
    """
    # Check for environment variables first (for local development)
    if os.environ.get('AWS_ACCESS_KEY_ID') and os.environ.get('AWS_SECRET_ACCESS_KEY'):
        logger.info(f"Creating {service_name} client using environment variables")
        # Environment variables will be automatically used by boto3
        return boto3.client(service_name=service_name, region_name=region_name)
    
    # Then check for session credentials (for web UI login)
    if 'aws_access_key' in session and session['aws_access_key']:
        logger.info(f"Creating {service_name} client using session credentials")
        client_kwargs = {
            'service_name': service_name,
            'region_name': session.get('aws_region', region_name),
            'aws_access_key_id': session['aws_access_key'],
            'aws_secret_access_key': session['aws_secret_key']
        }
        
        if 'aws_session_token' in session and session['aws_session_token']:
            client_kwargs['aws_session_token'] = session['aws_session_token']
            
        return boto3.client(**client_kwargs)
    
    # Try to use the default profile from ~/.aws/credentials
    try:
        boto_session = botocore.session.get_session()
        credentials = boto_session.get_credentials()
        if credentials:
            logger.info(f"Creating {service_name} client using AWS credentials file")
            return boto3.client(
                service_name=service_name,
                region_name=region_name
            )
    except ProfileNotFound:
        logger.info("No default profile found in AWS credentials file")
    except Exception as e:
        logger.info(f"Error loading credentials from file: {str(e)}")
    
    # Finally, fall back to instance profile (for production)
    logger.info(f"Creating {service_name} client using instance profile")
    return boto3.client(
        service_name=service_name,
        region_name=region_name
    )
