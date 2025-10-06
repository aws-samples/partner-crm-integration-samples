# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0
"""
Configuration file for opportunityToOffer workflow
Contains dynamic values that are used across different scripts
"""

from datetime import datetime, timedelta

# Calculate dynamic dates
today = datetime.now().date()
expiry_date = today + timedelta(days=7)
charge_date_2 = today + timedelta(days=14)

# Configuration variables
BUYER_ID = "111111111111"
PRODUCT_ID = "prod-45becev5xgcru"  # This will be updated after product creation
EXPIRY_DATE = expiry_date.strftime("%Y-%m-%d")
CONTRACT_DURATION_MONTHS = "P12M"
CHARGE_DATE_1 = expiry_date.strftime("%Y-%m-%d")  # Same as EXPIRY_DATE
CHARGE_DATE_2 = charge_date_2.strftime("%Y-%m-%d")

# Dictionary for easy access and template replacement
CONFIG_VARS = {
    "BUYER_ID": BUYER_ID,
    "PRODUCT_ID": PRODUCT_ID,
    "EXPIRY_DATE": EXPIRY_DATE,
    "CONTRACT_DURATION_MONTHS": CONTRACT_DURATION_MONTHS,
    "CHARGE_DATE_1": CHARGE_DATE_1,
    "CHARGE_DATE_2": CHARGE_DATE_2
}

def get_config():
    """
    Returns the configuration dictionary with current values
    """
    return CONFIG_VARS.copy()

def update_product_id(new_product_id):
    """
    Update the PRODUCT_ID in the configuration
    
    Args:
        new_product_id (str): The new product ID to set
    """
    global PRODUCT_ID
    PRODUCT_ID = new_product_id
    CONFIG_VARS["PRODUCT_ID"] = new_product_id

def print_config():
    """
    Print the current configuration values
    """
    print("Current Configuration:")
    print("=" * 40)
    for key, value in CONFIG_VARS.items():
        print(f"{key}: {value}")
    print("=" * 40)

if __name__ == "__main__":
    print_config()