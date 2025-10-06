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

# Add the parent directory to Python path to access utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import utils.start_changeset as sc
import utils.stringify_details as sd
import utils.template_processor as tp
import utils.config as config


def main(change_set=None):
    """
    Main function to create a private offer changeset
    
    Args:
        change_set: Optional pre-processed changeset. If None, will process template.
    
    Returns:
        dict: Response from the changeset creation
    """
    if change_set is None:
        # Print current configuration
        print("Using configuration:")
        config.print_config()
        print()
        
        # Use the changeset.json file (which already contains template variables)
        template_file = os.path.join(os.path.dirname(__file__), "changeset.json")
        
        if not os.path.exists(template_file):
            raise FileNotFoundError(f"Changeset file not found: {template_file}")
        
        try:
            # Process the template with current configuration
            processed_changeset = tp.process_changeset_template(template_file)
            
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
        print(f"\nUse describe_changeset.py to monitor progress:")
        print(f"python3 1_publishSaasProcuct/describe_changeset.py {response['ChangeSetId']}")
        
        # Show key configuration values used
        current_config = config.get_config()
        print(f"\nKey values used in this offer:")
        print(f"  Product ID: {current_config['PRODUCT_ID']}")
        print(f"  Buyer ID: {current_config['BUYER_ID']}")
        print(f"  Expiry Date: {current_config['EXPIRY_DATE']}")
        print(f"  Contract Duration: {current_config['CONTRACT_DURATION_MONTHS']}")
    
    return response


if __name__ == "__main__":
    main()
