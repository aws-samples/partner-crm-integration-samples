// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
package org.example.entity;

import com.google.gson.annotations.SerializedName;

public class Address {
	@SerializedName(value ="City")
	public String city;	
	
	@SerializedName(value ="CountryCode")
	public String countryCode;	
	
	@SerializedName(value ="PostalCode")
	public String postalCode;	
	
	@SerializedName(value ="StateOrRegion")
	public String stateOrRegion;	
	
	@SerializedName(value ="StreetAddress")
	public String streetAddress;	
}