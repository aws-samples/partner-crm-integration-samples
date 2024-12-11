// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
package org.example.entity;

import com.google.gson.annotations.SerializedName;

public class NextStepsHistory {
	@SerializedName(value ="Time")
	public String time;	
	
	@SerializedName(value ="Value")
	public String value;
}