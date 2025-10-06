# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0
"""
Purpose:

This module contains commmonly used functions for the API.
"""

import json
from datetime import datetime


# open json file from path
def open_json_file(filename):
    with open(filename, "r") as f:
        return json.load(f)


def pretty_print_datetime(json_object):
    if json_object is not None:
        json_string = json.dumps(json_object, cls=DateTimeEncoder, indent=4)
        print(json_string)
    else:
        print("Oject to print is null.")


def load_shared_env_vars():
    """Load shared environment variables from the shared_env.json file"""
    import os
    env_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "shared_env.json")
    
    if os.path.exists(env_file_path):
        try:
            with open(env_file_path, "r") as f:
                env_data = json.load(f)
            
            # Set environment variables in current process
            for key, value in env_data.items():
                os.environ[key] = value
                print(f"Loaded {key}={value} from shared environment")
            
            return env_data
        except Exception as e:
            print(f"Error loading shared environment variables: {e}")
            return {}
    else:
        print("No shared environment file found")
        return {}


class DateTimeEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime):
            return o.isoformat()

        return json.JSONEncoder.default(self, o)
