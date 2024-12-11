// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
package org.example.entity;

import com.google.gson.annotations.SerializedName;

public class Account {
	@SerializedName(value ="Address")
	public Address address;	
	
	@SerializedName(value ="AWSAccountId")
	public String awsAccountId;	
	
	@SerializedName(value ="CompanyName")
	public String companyName;
	
	@SerializedName(value ="Duns")
	public String duns;	
	
	@SerializedName(value ="Industry")
	public String industry;	
	
	@SerializedName(value ="OtherIndustry")
	public String otherIndustry;	
	
	@SerializedName(value ="WebsiteUrl")
	public String websiteUrl;

}