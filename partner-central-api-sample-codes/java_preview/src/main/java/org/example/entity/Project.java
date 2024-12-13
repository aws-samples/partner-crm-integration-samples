// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
package org.example.entity;

import java.util.ArrayList;

import com.google.gson.annotations.SerializedName;

import software.amazon.awssdk.services.partnercentralselling.model.CompetitorName;
import software.amazon.awssdk.services.partnercentralselling.model.DeliveryModel;
import software.amazon.awssdk.services.partnercentralselling.model.SalesActivity;

public class Project {
	@SerializedName(value ="ExpectedCustomerSpend")
	public ArrayList<ExpectedCustomerSpend> expectedCustomerSpend;	
	
	@SerializedName(value ="AdditionalComments")
	public String additionalComments;
	
	@SerializedName(value ="ApnPrograms")
	public ArrayList<String> aPNPrograms;	
	
	@SerializedName(value ="CompetitorName")
	public CompetitorName competitorName;
	
	@SerializedName(value ="CustomerBusinessProblem")
	public String customerBusinessProblem;	
	
	@SerializedName(value ="CustomerUseCase")
	public String customerUseCase;
	
	@SerializedName(value ="DeliveryModels")
	public ArrayList<DeliveryModel> deliveryModels;	
	
	@SerializedName(value ="OtherCompetitorNames")
	public String otherCompetitorNames;
	
	@SerializedName(value ="OtherSolutionDescription")
	public String otherSolutionDescription;
	
	@SerializedName(value ="RelatedOpportunityIdentifier")
	public String relatedOpportunityIdentifier;
	
	@SerializedName(value ="SalesActivities")
	public ArrayList<SalesActivity> salesActivities;
	
	@SerializedName(value ="Title")
	public String title;

}