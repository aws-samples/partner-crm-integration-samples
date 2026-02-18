#!/usr/bin/env python3
"""
Test script to verify configuration loading works correctly
"""

import sys
import os

def test_configuration():
    """Test that configuration loads correctly"""
    try:
        from utils.config import (
            CONFIG_VARS, 
            INVITING_AWS_ACCOUNT_ID, 
            RECEIVING_AWS_ACCOUNT_ID
        )
        
        print("✅ Configuration loaded successfully!")
        print()
        print("Configuration Values:")
        print("=" * 40)
        print(f"Inviting Account ID:  {INVITING_AWS_ACCOUNT_ID}")
        print(f"Receiving Account ID: {RECEIVING_AWS_ACCOUNT_ID}")
        print(f"Catalog:              {CONFIG_VARS['CATALOG']}")
        print(f"Endpoint URL:         {CONFIG_VARS['ENDPOINT_URL']}")
        print(f"Region:               {CONFIG_VARS['REGION']}")
        print("=" * 40)
        print()
        
        # Validate account IDs
        errors = []
        
        if not INVITING_AWS_ACCOUNT_ID.isdigit() or len(INVITING_AWS_ACCOUNT_ID) != 12:
            errors.append(f"Invalid inviting account ID: {INVITING_AWS_ACCOUNT_ID}")
            
        if not RECEIVING_AWS_ACCOUNT_ID.isdigit() or len(RECEIVING_AWS_ACCOUNT_ID) != 12:
            errors.append(f"Invalid receiving account ID: {RECEIVING_AWS_ACCOUNT_ID}")
            
        if CONFIG_VARS['CATALOG'] not in ["AWS", "Sandbox"]:
            errors.append(f"Invalid catalog: {CONFIG_VARS['CATALOG']}")
            
        if errors:
            print("❌ Configuration Errors:")
            for error in errors:
                print(f"  - {error}")
            return False
        else:
            print("✅ All configuration values are valid!")
            return True
            
    except FileNotFoundError:
        print("❌ Configuration file 'workflow_config.json' not found!")
        print("Please create workflow_config.json with your account IDs (see README.md)")
        return False
    except Exception as e:
        print(f"❌ Error loading configuration: {e}")
        return False

def test_workflow_config_file():
    """Test that workflow_config.json exists and is valid"""
    import json
    
    try:
        with open('workflow_config.json', 'r') as f:
            config = json.load(f)
            
        print("✅ workflow_config.json file is valid JSON")
        
        required_keys = ['accounts', 'catalog', 'endpoint_url', 'region']
        missing_keys = [key for key in required_keys if key not in config]
        
        if missing_keys:
            print(f"❌ Missing required keys: {missing_keys}")
            return False
            
        account_keys = ['inviting_partner', 'receiving_partner']
        missing_account_keys = [key for key in account_keys if key not in config['accounts']]
        
        if missing_account_keys:
            print(f"❌ Missing account keys: {missing_account_keys}")
            return False
            
        print("✅ workflow_config.json has all required keys")
        return True
        
    except FileNotFoundError:
        print("❌ workflow_config.json file not found!")
        print("Please create this file with your account IDs (see README.md)")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON in workflow_config.json: {e}")
        return False

if __name__ == "__main__":
    print("Testing Lead to Opportunity Configuration")
    print("=" * 50)
    print()
    
    # Test configuration file
    config_file_ok = test_workflow_config_file()
    print()
    
    # Test configuration loading
    config_loading_ok = test_configuration()
    print()
    
    if config_file_ok and config_loading_ok:
        print("🎉 All configuration tests passed!")
        print("You can now run the workflow using:")
        print("  ./run_complete_workflow.sh")
        sys.exit(0)
    else:
        print("❌ Configuration tests failed!")
        print("Please fix the issues above before running the workflow.")
        sys.exit(1)