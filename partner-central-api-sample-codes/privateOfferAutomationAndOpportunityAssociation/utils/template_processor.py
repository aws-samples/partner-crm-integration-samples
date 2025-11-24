# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0
"""
Template processor for replacing configuration variables in JSON files
"""

import json
import re
try:
    from .config import get_config
except ImportError:
    from config import get_config

def replace_template_variables(content, config_vars=None):
    """
    Replace template variables in content with actual values
    
    Template variables should be in the format: {{VARIABLE_NAME}}
    
    Args:
        content (str): The content containing template variables
        config_vars (dict): Configuration variables to use for replacement
        
    Returns:
        str: Content with variables replaced
    """
    if config_vars is None:
        config_vars = get_config()
    
    # Replace template variables in the format {{VARIABLE_NAME}}
    for key, value in config_vars.items():
        # Handle quoted array placeholders like "{{BUYER_IDS}}"
        quoted_pattern = f'"{{{{{key}}}}}"'
        unquoted_pattern = f"{{{{{key}}}}}"
        
        if isinstance(value, list):
            # For arrays, replace quoted placeholder with unquoted JSON array
            json_array = json.dumps(value)
            if quoted_pattern in content:
                content = content.replace(quoted_pattern, json_array)
            else:
                content = content.replace(unquoted_pattern, json_array)
        else:
            # For non-arrays, just replace the placeholder
            replacement = str(value)
            content = content.replace(unquoted_pattern, replacement)
    
    return content

def process_changeset_template(template_file_path, config_vars=None):
    """
    Process a changeset template file and return the processed content
    
    Args:
        template_file_path (str): Path to the template file
        config_vars (dict): Configuration variables to use for replacement
        
    Returns:
        dict: Processed changeset as a dictionary
    """
    if config_vars is None:
        config_vars = get_config()
    
    # Read the template file
    with open(template_file_path, 'r') as f:
        template_content = f.read()
    
    # Replace template variables
    processed_content = replace_template_variables(template_content, config_vars)
    
    # Parse as JSON and return
    return json.loads(processed_content)

def save_processed_changeset(template_file_path, output_file_path, config_vars=None):
    """
    Process a changeset template and save it to a new file
    
    Args:
        template_file_path (str): Path to the template file
        output_file_path (str): Path where processed file should be saved
        config_vars (dict): Configuration variables to use for replacement
    """
    processed_changeset = process_changeset_template(template_file_path, config_vars)
    
    with open(output_file_path, 'w') as f:
        json.dump(processed_changeset, f, indent=2)
    
    print(f"Processed changeset saved to: {output_file_path}")

def validate_template_variables(template_content, config_vars=None):
    """
    Validate that all template variables in content have corresponding config values
    
    Args:
        template_content (str): The template content to validate
        config_vars (dict): Configuration variables to check against
        
    Returns:
        tuple: (is_valid, missing_variables)
    """
    if config_vars is None:
        config_vars = get_config()
    
    # Find all template variables in the format {{VARIABLE_NAME}}
    template_vars = re.findall(r'\{\{([^}]+)\}\}', template_content)
    
    # Check which variables are missing from config
    missing_vars = [var for var in template_vars if var not in config_vars]
    
    return len(missing_vars) == 0, missing_vars