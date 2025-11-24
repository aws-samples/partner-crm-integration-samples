# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0
"""
Purpose
Shows how to use the AWS SDK for Python (Boto3) to create a private offer
with contract pricing and flexible payment schedule for my SaaS product
CAPI-39

This version uses dynamic configuration values from utils/config.py and processes
templates to replace placeholders with actual values.
"""

import os
import sys
import tempfile
import json

# Add the parent directory to Python path to access utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

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


def main(change_set=None):
    """
    Main function to create a private offer changeset
    
    Args:
        change_set: Optional pre-processed changeset. If None, will process template.
    
    Returns:
        dict: Response from the changeset creation
    """
    if change_set is None:
        # Load merged configuration from shared_env.json and defaults
        merged_config = load_merged_config()
        
        # Print current configuration
        print("Using configuration:")
        print("=" * 40)
        for key, value in merged_config.items():
            print(f"{key}: {value}")
        print("=" * 40)
        print()
        
        # Use the changeset.json file (which already contains template variables)
        template_file = os.path.join(os.path.dirname(__file__), "changeset.json")
        
        if not os.path.exists(template_file):
            raise FileNotFoundError(f"Changeset file not found: {template_file}")
        
        try:
            # Process the template with merged configuration
            processed_changeset = tp.process_changeset_template(template_file, merged_config)
            
            # Create a temporary file with the processed changeset
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as temp_file:
                import json
                json.dump(processed_changeset, temp_file, indent=2)
                temp_changeset_file = temp_file.name
            
            # Stringify the processed changeset
            stringified_change_set = sd.stringify_changeset(temp_changeset_file)
            
            # Clean up temporary file
            os.unlink(temp_changeset_file)
            
        except Exception as e:
            print(f"Error processing changeset template: {e}")
            raise
    else:
        stringified_change_set = change_set

    # Execute the changeset
    response = sc.usage_demo(
        stringified_change_set,
        "Create private offer with contract pricing and flexible payment schedule for my SaaS product",
    )
    
    # If successful, provide helpful information
    if response and 'ChangeSetId' in response:
        print(f"\n✅ Private offer changeset created successfully!")
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
        merged_config = load_merged_config()
        print(f"\nKey values used in this offer:")
        print(f"  Product ID: {merged_config['PRODUCT_ID']}")
        print(f"  Buyer IDs: {merged_config['BUYER_IDS']}")
        print(f"  Expiry Date: {merged_config['EXPIRY_DATE']}")
        print(f"  Contract Duration: {merged_config['CONTRACT_DURATION_MONTHS']}")
    
    return response


if __name__ == "__main__":
    main()
