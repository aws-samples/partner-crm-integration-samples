# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0
"""
Configuration file for Lead to Opportunity workflow
Loads configuration values from workflow_config.json
"""

import json
import os
import sys

def load_workflow_config():
    """Load configuration from workflow_config.json"""
    config_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "workflow_config.json")
    
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"ERROR: Configuration file not found: {config_path}")
        print("Please create workflow_config.json with the required account IDs and settings")
        print("See README.md for configuration instructions")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid JSON in configuration file: {config_path}")
        print(f"JSON Error: {e}")
        sys.exit(1)

# Load configuration from file
_workflow_config = load_workflow_config()

# Extract values from configuration
ENDPOINT_URL = _workflow_config.get("endpoint_url", "https://partnercentral-selling.us-east-1.api.aws")
REGION = _workflow_config.get("region", "us-east-1")
CATALOG = _workflow_config.get("catalog", "Sandbox")
INVITING_AWS_ACCOUNT_ID = _workflow_config["accounts"]["inviting_partner"]
RECEIVING_AWS_ACCOUNT_ID = _workflow_config["accounts"]["receiving_partner"]

# Validate catalog value
if CATALOG not in ["AWS", "Sandbox"]:
    print(f"WARNING: Invalid catalog '{CATALOG}' in configuration. Must be 'AWS' or 'Sandbox'")
    sys.exit(1)

# Configuration dictionary - workflow scripts use CONFIG_VARS
CONFIG_VARS = {
    "CATALOG": CATALOG,
    "REGION": REGION,
    "ENDPOINT_URL": ENDPOINT_URL,
    "INVITING_AWS_ACCOUNT_ID": INVITING_AWS_ACCOUNT_ID,
    "RECEIVING_AWS_ACCOUNT_ID": RECEIVING_AWS_ACCOUNT_ID
}

def print_config():
    """Print the current configuration values"""
    print("Lead to Opportunity Configuration:")
    print("=" * 40)
    for key, value in CONFIG_VARS.items():
        print(f"{key}: {value}")
    print("=" * 40)

if __name__ == "__main__":
    print_config()
