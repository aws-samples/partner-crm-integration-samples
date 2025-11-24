# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0
"""
Purpose
Shows how to use the AWS SDK for Python (Boto3) to create a
public or limited SaaS product and public offer with contract pricing and standard EULA
CAPI-11

This version uses dynamic configuration values from utils/config.py and processes
templates to replace placeholders with actual values including BUYER_IDS.
"""

import os
import sys
import tempfile
import json

# Add parent directory to path to find utils module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import utils.start_changeset as sc
import utils.stringify_details as sd
import utils.template_processor as tp
import utils.config as config


def load_merged_config():
    """
    Load configuration from shared_env.json and merge with config defaults
    
    Returns:
        dict: Merged configuration with shared_env.json values taking priority
    """
    # Start with default config
    merged_config = config.get_config()
    
    # Load from shared_env.json if it exists
    env_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "shared_env.json")
    if os.path.exists(env_file_path):
        try:
            with open(env_file_path, "r") as f:
                env_data = json.load(f)
                # Update config with values from shared_env.json
                for key in merged_config.keys():
                    if key in env_data and env_data[key]:
                        merged_config[key] = env_data[key]
        except Exception as e:
            print(f"Warning: Could not read shared_env.json: {e}")
    
    return merged_config


def main(template_name=None):
    """
    Main function to create a SaaS product and public offer changeset
    
    Args:
        template_name: Optional template file name. If None, uses default logic.
    
    Returns:
        dict: Response from the changeset creation
    """
    # Load merged configuration from shared_env.json and defaults
    merged_config = load_merged_config()
    
    # Print current configuration
    print("Using configuration:")
    print("=" * 60)
    for key, value in merged_config.items():
        print(f"{key}: {value}")
    print("=" * 60)
    print()
    
    # Determine template file path
    if template_name:
        template_fname = template_name
    else:
        template_fname = "changeset.json"
    
    template_file = os.path.join(os.path.dirname(__file__), template_fname)
    
    # Check if template file exists
    if not os.path.exists(template_file):
        print(f"Template file {template_fname} not found")
        raise FileNotFoundError(f"Template file not found: {template_file}")
    
    print(f"Using template file: {os.path.basename(template_file)}")
    
    try:
        # Process the template with merged configuration
        processed_changeset = tp.process_changeset_template(template_file, merged_config)
        
        # Create a temporary file with the processed changeset
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as temp_file:
            json.dump(processed_changeset, temp_file, indent=2)
            temp_changeset_file = temp_file.name
        
        # Stringify the processed changeset
        change_set = sd.stringify_changeset(temp_changeset_file)
        
        # Execute the changeset
        response = sc.usage_demo(
            change_set,
            "Create a limited SaaS product with a public offer with contract pricing",
        )
        
        # Clean up temporary file
        os.unlink(temp_changeset_file)
        
        # If successful, extract and update product ID in config
        if response and 'ChangeSetId' in response:
            print(f"\n✅ SaaS product and offer changeset created successfully!")
            print(f"ChangeSet ID: {response['ChangeSetId']}")
            print(f"ChangeSet ARN: {response['ChangeSetArn']}")
            
            # Save changeset ID to shared_env.json
            env_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "shared_env.json")
            env_data = {}
            if os.path.exists(env_file_path):
                with open(env_file_path, "r") as f:
                    env_data = json.load(f)
            env_data["CHANGESET_ID"] = response['ChangeSetId']
            with open(env_file_path, "w") as f:
                json.dump(env_data, f, indent=2)
            print(f"✓ Saved CHANGESET_ID to shared_env.json")
            
            print(f"\nUse describe_changeset.py to monitor progress:")
            print(f"python3 1_publishSaasProcuct/describe_changeset.py {response['ChangeSetId']}")
            
            # Show key configuration values used
            print(f"\nKey values used in this changeset:")
            print(f"  Buyer IDs: {merged_config['BUYER_IDS']}")
            print(f"  Contract Duration: {merged_config.get('CONTRACT_DURATION_MONTHS', 'P12M')}")
        
        return response
        
    except Exception as e:
        print(f"Error processing changeset: {e}")
        raise


if __name__ == "__main__":
    # Check if template name is provided as command line argument
    template_name = None
    if len(sys.argv) > 1:
        template_name = sys.argv[1]
        print(f"Using custom template: {template_name}")
    
    main(template_name)
