// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
package org.example.entity;

import com.google.gson.annotations.SerializedName;

public class SoftwareRevenue {
	@SerializedName(value ="DeliveryModel")
	public String deliveryModel;	
	
	@SerializedName(value ="EffectiveDate")
	public String effectiveDate;
	
	@SerializedName(value ="ExpirationDate")
	public String expirationDate;
	
	@SerializedName(value ="Value")
	public MonetaryValue value;
}