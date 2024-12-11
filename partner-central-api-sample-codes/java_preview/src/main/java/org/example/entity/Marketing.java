// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
package org.example.entity;

import java.util.ArrayList;

import com.google.gson.annotations.SerializedName;

import software.amazon.awssdk.services.partnercentralselling.model.Channel;

public class Marketing {
	
	@SerializedName(value ="AwsFundingUsed")
	public String awsFundingUsed;
	
	@SerializedName(value ="CampaignName")
	public String campaignName;
	
	@SerializedName(value ="Channels")
	public ArrayList<Channel> channels;	
	
	@SerializedName(value ="Source")
	public String source;
	
	@SerializedName(value ="UseCases")
	public ArrayList<String> useCases;

}