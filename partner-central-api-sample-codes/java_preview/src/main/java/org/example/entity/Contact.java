// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
package org.example.entity;

import com.google.gson.annotations.SerializedName;

public class Contact {
	@SerializedName(value ="Email")
	public String email;	
	
	@SerializedName(value ="FirstName")
	public String firstName;
	
	@SerializedName(value ="LastName")
	public String lastName;	
	
	@SerializedName(value ="Phone")
	public String phone;	
	
	@SerializedName(value ="BusinessTitle")
	public String businessTitle;
}