// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
package org.example.entity;

import java.util.ArrayList;

import com.google.gson.annotations.SerializedName;

public class Root {
	
	@SerializedName(value = "Catalog")
	public String catalog;
	
	@SerializedName(value = "Identifier")
	public String identifier;
	
	@SerializedName(value = "LastModifiedDate")
	public String lastModifiedDate;
	
	@SerializedName(value = "ClientToken")
	public String clientToken;
	
	@SerializedName(value = "OpportunityType")
	public String opportunityType;
	
	@SerializedName(value = "PartnerOpportunityIdentifier")
	public String partnerOpportunityIdentifier;
	
	@SerializedName(value ="PrimaryNeedsFromAws")
	public ArrayList<String> primaryNeedsFromAws;
	
	@SerializedName(value="LifeCycle")
	public LifeCycle lifeCycle;
	
	@SerializedName(value="Marketing")
	public Marketing marketing;
	
	@SerializedName(value = "NationalSecurity")
	public String nationalSecurity;
	
	@SerializedName(value = "Origin")
	public String origin;
	
	@SerializedName(value="Customer")
	public Customer customer;
	
	@SerializedName(value="Project")
	public Project project;
	
	@SerializedName(value="OpportunityTeam")
	public ArrayList<Contact> opportunityTeam;
	
	@SerializedName(value="SoftwareRevenue")
	public SoftwareRevenue softwareRevenue;
	
}