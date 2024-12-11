// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
package org.example.entity;

import com.google.gson.annotations.SerializedName;

public class ExpectedCustomerSpend {
	@SerializedName(value ="Amount")
	public String amount;	
	
	@SerializedName(value ="CurrencyCode")
	public String currencyCode;
	
	@SerializedName(value ="Frequency")
	public String frequency;
	
	@SerializedName(value ="TargetCompany")
	public String targetCompany;
}