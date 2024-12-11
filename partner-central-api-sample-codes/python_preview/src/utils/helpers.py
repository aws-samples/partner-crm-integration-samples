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
        print("Object to print is null.")

def remove_nulls(data):
    if isinstance(data, dict):
        return {k: remove_nulls(v) for k, v in data.items() if v is not None}
    elif isinstance(data, list):
        return [remove_nulls(item) for item in data if item is not None]
    else:
        return data

class DateTimeEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime):
            return o.isoformat()

        return json.JSONEncoder.default(self, o)
