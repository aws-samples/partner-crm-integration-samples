# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0
"""
Test script to validate configuration and template processing
"""

import os
import json
from config import get_config, print_config
from template_processor import process_changeset_template, validate_template_variables

def test_configuration():
    """Test the configuration values"""
    print("Testing Configuration:")
    print("=" * 50)
    
    config = get_config()
    print_config()
    
    # Validate date formats
    from datetime import datetime
    try:
        datetime.strptime(config['EXPIRY_DATE'], '%Y-%m-%d')
        print("✅ EXPIRY_DATE format is valid")
    except ValueError:
        print("❌ EXPIRY_DATE format is invalid")
    
    try:
        datetime.strptime(config['CHARGE_DATE_1'], '%Y-%m-%d')
        print("✅ CHARGE_DATE_1 format is valid")
    except ValueError:
        print("❌ CHARGE_DATE_1 format is invalid")
    
    try:
        datetime.strptime(config['CHARGE_DATE_2'], '%Y-%m-%d')
        print("✅ CHARGE_DATE_2 format is valid")
    except ValueError:
        print("❌ CHARGE_DATE_2 format is invalid")
    
    # Validate CONTRACT_DURATION_MONTHS format
    if config['CONTRACT_DURATION_MONTHS'].startswith('P') and config['CONTRACT_DURATION_MONTHS'].endswith('M'):
        print("✅ CONTRACT_DURATION_MONTHS format is valid")
    else:
        print("❌ CONTRACT_DURATION_MONTHS format is invalid")
    
    print()

def test_template_processing():
    """Test template processing for both changeset files"""
    print("Testing Template Processing:")
    print("=" * 50)
    
    # Test files to process
    test_files = [
        ('1_publishSaasProcuct/changeset_template.json', 'SaaS Product Creation'),
        ('2_createPrivateOffer/changeset.json', 'Private Offer Creation')
    ]
    
    for file_path, description in test_files:
        print(f"\nTesting {description}:")
        print("-" * 30)
        
        full_path = file_path
        if not os.path.exists(full_path):
            print(f"❌ File not found: {file_path}")
            continue
        
        try:
            # Read template content
            with open(full_path, 'r') as f:
                template_content = f.read()
            
            # Validate template variables
            is_valid, missing_vars = validate_template_variables(template_content)
            
            if not is_valid:
                print(f"❌ Missing template variables: {missing_vars}")
                continue
            
            # Process template
            processed = process_changeset_template(full_path)
            
            print(f"✅ Template processed successfully")
            print(f"   Changes in changeset: {len(processed['ChangeSet'])}")
            
            # Show some processed values
            config = get_config()
            
            # Find and show replaced values
            changeset_str = json.dumps(processed)
            
            for var_name, var_value in config.items():
                if var_value in changeset_str:
                    print(f"   ✅ {var_name}: {var_value} (replaced)")
            
        except Exception as e:
            print(f"❌ Error processing template: {e}")

def main():
    """Main test function"""
    print("Configuration and Template Processing Test")
    print("=" * 60)
    print()
    
    test_configuration()
    test_template_processing()
    
    print("\nTest completed!")

if __name__ == "__main__":
    main()