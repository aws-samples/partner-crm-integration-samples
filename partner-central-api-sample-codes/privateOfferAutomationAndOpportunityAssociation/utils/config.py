# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0
"""
Configuration file for opportunityToOffer workflow
Loads configuration from config.json and buyer_ids.txt
"""

import json
import os
import csv
from datetime import datetime, timedelta

# Calculate dynamic dates
today = datetime.now().date()
expiry_date = today + timedelta(days=7)
charge_date_2 = today + timedelta(days=14)

# Load main configuration from config.json
def _load_config_file():
    """Load configuration from config.json file"""
    config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config.json')
    try:
        with open(config_path, 'r') as f:
            config = json.load(f)
            print(f"✓ Loaded configuration from config.json")
            return config
    except FileNotFoundError:
        raise FileNotFoundError(
            f"Configuration file not found at {config_path}. "
            "Please create config.json with required settings."
        )
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in config.json: {e}")

# Load PRODUCT_ID from command line or shared_env.json
def _load_product_id():
    """Load product ID from command line or shared_env.json (no default)"""
    import sys
    
    # Check command line arguments first
    # Look for product ID pattern (starts with 'prod-')
    for arg in sys.argv[1:]:  # Skip script name
        if arg.startswith('prod-'):
            print(f"Using product ID from command line: {arg}")
            return arg
    
    # Fall back to shared_env.json
    shared_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'shared_env.json')
    try:
        with open(shared_env_path, 'r') as f:
            shared_env = json.load(f)
            product_id = shared_env.get('PRODUCT_ID')
            if product_id:
                print(f"Using product ID from shared_env.json: {product_id}")
                return product_id
    except (FileNotFoundError, json.JSONDecodeError):
        pass
    
    # No default - raise error if not found
    raise ValueError(
        "PRODUCT_ID not found. Please provide it via:\n"
        "  1. Command line argument (e.g., prod-xxxxx), or\n"
        "  2. Set PRODUCT_ID in shared_env.json"
    )

# Load BUYER_IDS from buyer_ids.txt
def _load_buyer_ids():
    """Load buyer IDs from buyer_ids.txt (no default)"""
    buyer_ids_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'buyer_ids.txt')
    try:
        with open(buyer_ids_path, 'r') as f:
            # Read lines, strip whitespace, and filter out empty lines
            buyer_ids = [line.strip() for line in f.readlines() if line.strip()]
            if not buyer_ids:
                raise ValueError("buyer_ids.txt is empty. Please add at least one buyer account ID.")
            print(f"✓ Loaded {len(buyer_ids)} buyer ID(s) from buyer_ids.txt")
            return buyer_ids
    except FileNotFoundError:
        raise FileNotFoundError(
            f"buyer_ids.txt not found at {buyer_ids_path}. "
            "Please create this file with buyer account IDs (one per line)."
        )
    except Exception as e:
        raise Exception(f"Error loading buyer_ids.txt: {e}")

# Load configuration
_config_data = _load_config_file()

# Configuration variables from config.json
CATALOG = _config_data.get('catalog')
CONTRACT_DURATION_MONTHS = _config_data.get('contract_duration_months')
CONTRACT_DURATION_DAYS = _config_data.get('contract_duration_days')
CUSTOM_EULA_URL = _config_data.get('custom_eula_url')
OFFER_NAME = _config_data.get('offer_name')
OFFER_DESCRIPTION = _config_data.get('offer_description')

# Validate required config fields
if not CATALOG:
    raise ValueError("'catalog' is required in config.json")
if not CONTRACT_DURATION_MONTHS:
    raise ValueError("'contract_duration_months' is required in config.json")

# Load buyer IDs and product ID (no defaults)
BUYER_IDS = _load_buyer_ids()
PRODUCT_ID = _load_product_id()

# Dynamic date calculations
EXPIRY_DATE = expiry_date.strftime("%Y-%m-%d")
CHARGE_DATE_1 = expiry_date.strftime("%Y-%m-%d")  # Same as EXPIRY_DATE
CHARGE_DATE_2 = charge_date_2.strftime("%Y-%m-%d")

# Backward compatibility alias
CATALOG_TO_USE = CATALOG

# Dictionary for easy access and template replacement
CONFIG_VARS = {
    "BUYER_IDS": BUYER_IDS,
    "PRODUCT_ID": PRODUCT_ID,
    "CATALOG": CATALOG,
    "CATALOG_TO_USE": CATALOG,  # Backward compatibility
    "EXPIRY_DATE": EXPIRY_DATE,
    "CONTRACT_DURATION_MONTHS": CONTRACT_DURATION_MONTHS,
    "CONTRACT_DURATION_DAYS": CONTRACT_DURATION_DAYS,
    "CHARGE_DATE_1": CHARGE_DATE_1,
    "CHARGE_DATE_2": CHARGE_DATE_2,
    "CUSTOM_EULA_URL": CUSTOM_EULA_URL,
    "OFFER_NAME": OFFER_NAME,
    "OFFER_DESCRIPTION": OFFER_DESCRIPTION
}

def get_config():
    """
    Returns the configuration dictionary with current values
    """
    return CONFIG_VARS.copy()

def update_product_id(new_product_id):
    """
    Update the PRODUCT_ID in the configuration and save to shared_env.json
    
    Args:
        new_product_id (str): The new product ID to set
    """
    global PRODUCT_ID
    PRODUCT_ID = new_product_id
    CONFIG_VARS["PRODUCT_ID"] = new_product_id
    
    # Save to shared_env.json
    shared_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'shared_env.json')
    try:
        # Load existing shared_env or create new
        if os.path.exists(shared_env_path):
            with open(shared_env_path, 'r') as f:
                shared_env = json.load(f)
        else:
            shared_env = {}
        
        # Update PRODUCT_ID
        shared_env['PRODUCT_ID'] = new_product_id
        
        # Save back
        with open(shared_env_path, 'w') as f:
            json.dump(shared_env, f, indent=2)
        
        print(f"✓ Updated PRODUCT_ID to {new_product_id} in shared_env.json")
    except Exception as e:
        print(f"Warning: Could not save PRODUCT_ID to shared_env.json: {e}")

def add_buyer_id(buyer_id):
    """
    Add a buyer ID to the BUYER_IDS list
    
    Args:
        buyer_id (str): The buyer account ID to add
    """
    global BUYER_IDS
    if buyer_id not in BUYER_IDS:
        BUYER_IDS.append(buyer_id)
        CONFIG_VARS["BUYER_IDS"] = BUYER_IDS

def remove_buyer_id(buyer_id):
    """
    Remove a buyer ID from the BUYER_IDS list
    
    Args:
        buyer_id (str): The buyer account ID to remove
    """
    global BUYER_IDS
    if buyer_id in BUYER_IDS:
        BUYER_IDS.remove(buyer_id)
        CONFIG_VARS["BUYER_IDS"] = BUYER_IDS

def set_buyer_ids(buyer_ids):
    """
    Set the entire BUYER_IDS list and optionally save to file
    
    Args:
        buyer_ids (list): List of buyer account IDs
    """
    global BUYER_IDS
    BUYER_IDS = buyer_ids.copy()
    CONFIG_VARS["BUYER_IDS"] = BUYER_IDS

def save_buyer_ids_to_file(buyer_ids=None):
    """
    Save buyer IDs to buyer_ids.txt file
    
    Args:
        buyer_ids (list): Optional list of buyer IDs. If None, uses current BUYER_IDS
    """
    if buyer_ids is None:
        buyer_ids = BUYER_IDS
    
    buyer_ids_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'buyer_ids.txt')
    try:
        with open(buyer_ids_path, 'w') as f:
            for buyer_id in buyer_ids:
                f.write(f"{buyer_id}\n")
        print(f"✓ Saved {len(buyer_ids)} buyer IDs to {buyer_ids_path}")
    except Exception as e:
        print(f"Error saving buyer_ids.txt: {e}")

def reload_buyer_ids():
    """
    Reload buyer IDs from buyer_ids.txt file
    """
    global BUYER_IDS
    BUYER_IDS = _load_buyer_ids()
    CONFIG_VARS["BUYER_IDS"] = BUYER_IDS
    print(f"✓ Reloaded {len(BUYER_IDS)} buyer IDs from file")

def set_offer_name(offer_name):
    """
    Set the offer name and save to config.json
    
    Args:
        offer_name (str): The offer name to set
    """
    global OFFER_NAME
    OFFER_NAME = offer_name
    CONFIG_VARS["OFFER_NAME"] = OFFER_NAME
    _save_config_file()

def set_offer_description(offer_description):
    """
    Set the offer description and save to config.json
    
    Args:
        offer_description (str): The offer description to set
    """
    global OFFER_DESCRIPTION
    OFFER_DESCRIPTION = offer_description
    CONFIG_VARS["OFFER_DESCRIPTION"] = OFFER_DESCRIPTION
    _save_config_file()

def set_offer_info(offer_name, offer_description):
    """
    Set both offer name and description and save to config.json
    
    Args:
        offer_name (str): The offer name to set
        offer_description (str): The offer description to set
    """
    global OFFER_NAME, OFFER_DESCRIPTION
    OFFER_NAME = offer_name
    OFFER_DESCRIPTION = offer_description
    CONFIG_VARS["OFFER_NAME"] = OFFER_NAME
    CONFIG_VARS["OFFER_DESCRIPTION"] = OFFER_DESCRIPTION
    _save_config_file()

def _save_config_file():
    """Save current configuration to config.json"""
    config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config.json')
    try:
        config_data = {
            "catalog": CATALOG,
            "contract_duration_months": CONTRACT_DURATION_MONTHS,
            "contract_duration_days": CONTRACT_DURATION_DAYS,
            "custom_eula_url": CUSTOM_EULA_URL,
            "offer_name": OFFER_NAME,
            "offer_description": OFFER_DESCRIPTION
        }
        with open(config_path, 'w') as f:
            json.dump(config_data, f, indent=2)
        print(f"✓ Saved configuration to config.json")
    except Exception as e:
        print(f"Warning: Could not save config.json: {e}")

def load_rate_cards(rate_card_file_path=None):
    """
    Load rate cards from CSV file and calculate discounted prices
    
    Args:
        rate_card_file_path (str): Path to the rate card CSV file
        
    Returns:
        list: List of rate card dictionaries with DimensionKey and calculated Price
    """
    if rate_card_file_path is None:
        # Default path relative to the script location
        script_dir = os.path.dirname(os.path.dirname(__file__))
        rate_card_file_path = os.path.join(script_dir, '2_createPrivateOffer', 'rateCard.txt')
    
    rate_cards = []
    
    try:
        with open(rate_card_file_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                dimension_key = row['DimensionKey']
                original_price = float(row['OriginalPrice'])
                discount_percent = float(row['DiscountPercent'])
                
                # Calculate discounted price: OriginalPrice * (1 - DiscountPercent/100)
                discounted_price = original_price * (1 - discount_percent / 100)
                
                rate_card = {
                    "DimensionKey": dimension_key,
                    "Price": str(round(discounted_price, 2))  # Round to 2 decimal places and convert to string
                }
                rate_cards.append(rate_card)
                
    except FileNotFoundError:
        print(f"Warning: Rate card file not found at {rate_card_file_path}")
        # Return default rate cards if file not found
        rate_cards = [
            {"DimensionKey": "metered_1_id", "Price": "0.9"},  # 1 * (1 - 10/100)
            {"DimensionKey": "metered_2_id", "Price": "1.7"},  # 2 * (1 - 15/100)
            {"DimensionKey": "metered_3_id", "Price": "2.4"}   # 3 * (1 - 20/100)
        ]
    except Exception as e:
        print(f"Error loading rate card file: {e}")
        rate_cards = []
    
    return rate_cards

def get_config_with_rate_cards(rate_card_file_path=None):
    """
    Returns the configuration dictionary with rate cards included
    
    Args:
        rate_card_file_path (str): Path to the rate card CSV file
        
    Returns:
        dict: Configuration dictionary including RATE_CARDS
    """
    config = get_config()
    rate_cards = load_rate_cards(rate_card_file_path)
    config["RATE_CARDS"] = rate_cards
    return config

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