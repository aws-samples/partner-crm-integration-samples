# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0
"""
Utility script to update the PRODUCT_ID in configuration after successful product creation
"""

import sys
import boto3
from botocore.exceptions import ClientError
from config import update_product_id, print_config

def get_product_id_from_changeset(changeset_id):
    """
    Extract product ID from a successful changeset
    
    Args:
        changeset_id (str): The changeset ID to check
        
    Returns:
        str: The product ID if found, None otherwise
    """
    try:
        mp_client = boto3.client("marketplace-catalog")
        
        response = mp_client.describe_change_set(
            Catalog="AWSMarketplace",
            ChangeSetId=changeset_id
        )
        
        if response.get('Status') != 'SUCCEEDED':
            print(f"❌ Changeset {changeset_id} has not succeeded yet (Status: {response.get('Status')})")
            return None
        
        # Find the CreateProduct change
        for change in response.get('ChangeSet', []):
            if change.get('ChangeType') == 'CreateProduct':
                entity_id = change.get('Entity', {}).get('Identifier', '')
                if entity_id:
                    # Remove version suffix (@1) if present
                    product_id = entity_id.split('@')[0]
                    return product_id
        
        print("❌ No CreateProduct change found in changeset")
        return None
        
    except ClientError as e:
        print(f"❌ Error describing changeset: {e}")
        return None

def main():
    """
    Main function to update product ID from changeset
    """
    if len(sys.argv) != 2:
        print("Usage: python update_product_id.py <changeset_id>")
        print("Example: python update_product_id.py 1nhjeo6fvc3s81vfoejyq8cwq")
        sys.exit(1)
    
    changeset_id = sys.argv[1]
    
    print(f"Extracting product ID from changeset: {changeset_id}")
    print("-" * 50)
    
    # Get product ID from changeset
    product_id = get_product_id_from_changeset(changeset_id)
    
    if product_id:
        print(f"✅ Found product ID: {product_id}")
        
        # Update configuration
        old_config = print_config()
        update_product_id(product_id)
        
        print("\nUpdated configuration:")
        print_config()
        
        print(f"\n✅ Product ID updated successfully!")
        print(f"You can now create private offers using this product ID.")
        
    else:
        print("❌ Could not extract product ID from changeset")
        sys.exit(1)

if __name__ == "__main__":
    main()