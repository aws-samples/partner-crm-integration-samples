# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0
"""
Purpose
Shows how to use the AWS SDK for Python (Boto3) to create a
public or limited SaaS product and public offer with contract pricing and standard EULA
CAPI-11

This version uses dynamic configuration values from utils/config.py and processes
templates to replace placeholders with actual values.
"""

import os
import tempfile

import utils.start_changeset as sc
import utils.stringify_details as sd
import utils.template_processor as tp
import utils.config as config


def main():
    # Print current configuration
    print("Using configuration:")
    config.print_config()
    print()
    
    # Determine template file path
    template_fname = "changeset_template.json"
    template_file = os.path.join(os.path.dirname(__file__), template_fname)
    
    # Check if template file exists, fallback to regular changeset.json
    if not os.path.exists(template_file):
        print(f"Template file {template_fname} not found, using changeset.json")
        template_file = os.path.join(os.path.dirname(__file__), "changeset.json")
    
    try:
        # Process the template with current configuration
        processed_changeset = tp.process_changeset_template(template_file)
        
        # Create a temporary file with the processed changeset
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as temp_file:
            import json
            json.dump(processed_changeset, temp_file, indent=2)
            temp_changeset_file = temp_file.name
        
        # Stringify the processed changeset
        change_set = sd.stringify_changeset(temp_changeset_file)
        
        # Execute the changeset
        response = sc.usage_demo(
            change_set,
            "Create a limited saas product with a public offer with contract pricing",
        )
        
        # Clean up temporary file
        os.unlink(temp_changeset_file)
        
        # If successful, extract and update product ID in config
        if response and 'ChangeSetId' in response:
            print(f"\n✅ Changeset created successfully!")
            print(f"ChangeSet ID: {response['ChangeSetId']}")
            print(f"ChangeSet ARN: {response['ChangeSetArn']}")
            print(f"\nUse describe_changeset.py to monitor progress:")
            print(f"python3 1_publishSaasProcuct/describe_changeset.py {response['ChangeSetId']}")
        
        return response
        
    except Exception as e:
        print(f"Error processing changeset: {e}")
        raise


if __name__ == "__main__":
    main()
