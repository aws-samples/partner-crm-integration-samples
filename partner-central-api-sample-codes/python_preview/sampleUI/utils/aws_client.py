#!/usr/bin/env python

# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

"""
Purpose:
Utility functions for creating AWS clients with flexible credential sources
"""

import os
import boto3
import datetime
import botocore.session
from botocore.exceptions import ProfileNotFound

# Create logs directory and log file
log_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'logs')
os.makedirs(log_dir, exist_ok=True)
log_file = os.path.join(log_dir, 'aws_client.log')

# Create the log file if it doesn't exist
if not os.path.exists(log_file):
    try:
        with open(log_file, 'w') as f:
            f.write(f"{datetime.datetime.now()} - Log file created\n")
        print(f"Created log file: {log_file}")
    except Exception as e:
        print(f"Error creating log file: {str(e)}")

# Simple direct file logging
def log_message(message):
    """Write a message directly to the log file"""
    try:
        with open(log_file, 'a') as f:
            f.write(f"{datetime.datetime.now()} - {message}\n")
    except Exception as e:
        print(f"Error writing to log file: {str(e)}")


# Log initialization
log_message("AWS client module initialized")

def get_boto3_client(service_name, region_name='us-east-1'):
    """
    Get a boto3 client using the best available credential source
    
    Priority order when useLogin is True:
    1. Environment variables (set from session in app.py)
    2. AWS credentials file (for local development)
    3. Instance profile (for EC2 deployment)
    
    Priority order when useLogin is False:
    1. AWS credentials file (for local development)
    2. Instance profile (for EC2 deployment)
    
    Args:
        service_name (str): The AWS service name
        region_name (str): The AWS region name (default: us-east-1)
        
    Returns:
        boto3.client: A boto3 client for the specified service
    """
    # Import CONFIG to check useLogin flag
    try:
        from config import CONFIG
        use_login = CONFIG.get('useLogin', False)
        log_message(f"useLogin is {use_login}")
    except ImportError:
        use_login = False
        log_message("Failed to import CONFIG, defaulting useLogin to False")
    
    # Save environment variables
    saved_env_vars = {}
    aws_env_vars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN', 'AWS_REGION']
    
    # If useLogin is False, temporarily clear environment variables
    if not use_login:
        for var in aws_env_vars:
            if var in os.environ:
                saved_env_vars[var] = os.environ[var]
                del os.environ[var]
                log_message(f"Temporarily removed {var} from environment")
    
    try:
        # Check for environment variables only if useLogin is True
        if use_login and os.environ.get('AWS_ACCESS_KEY_ID') and os.environ.get('AWS_SECRET_ACCESS_KEY'):
            log_message(f"Creating {service_name} client using environment variables")
            
            # Explicitly pass credentials to ensure we're using the right ones
            client_kwargs = {
                'service_name': service_name,
                'region_name': os.environ.get('AWS_REGION', region_name),
                'aws_access_key_id': os.environ.get('AWS_ACCESS_KEY_ID'),
                'aws_secret_access_key': os.environ.get('AWS_SECRET_ACCESS_KEY')
            }
            
            # Add session token if available
            if os.environ.get('AWS_SESSION_TOKEN'):
                client_kwargs['aws_session_token'] = os.environ.get('AWS_SESSION_TOKEN')
            
            return boto3.client(**client_kwargs)
        
        # Try to use the default profile from ~/.aws/credentials
        try:
            log_message("Attempting to load credentials from AWS credentials file")
            boto_session = boto3.Session(region_name=region_name)
            credentials = boto_session.get_credentials()
            
            if credentials and credentials.access_key and credentials.secret_key:
                log_message("Found credentials in AWS credentials file")
                
                # Create a client with explicit credentials
                client_kwargs = {
                    'service_name': service_name,
                    'region_name': region_name,
                    'aws_access_key_id': credentials.access_key,
                    'aws_secret_access_key': credentials.secret_key
                }
                
                # Add token if available
                if hasattr(credentials, 'token') and credentials.token:
                    client_kwargs['aws_session_token'] = credentials.token
                    
                return boto3.client(**client_kwargs)
            else:
                log_message("No credentials found in AWS credentials file")
        except Exception as e:
            log_message(f"Error loading credentials from file: {str(e)}")
        
        # Finally, fall back to instance profile (for production)
        log_message(f"Creating {service_name} client using instance profile")
        return boto3.client(
            service_name=service_name,
            region_name=region_name
        )
    finally:
        # Restore environment variables
        for var, value in saved_env_vars.items():
            os.environ[var] = value
            log_message(f"Restored {var} to environment")
