// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
package org.example.entity;

import java.util.ArrayList;

import com.google.gson.annotations.SerializedName;

public class LifeCycle {
	@SerializedName(value ="ClosedLostReason")
	public String closedLostReason;	
	
	@SerializedName(value ="NextSteps")
	public String nextSteps;
	
	@SerializedName(value ="NextStepsHistory")
	public ArrayList<NextStepsHistory> nextStepsHistories;
	
	@SerializedName(value ="ReviewComments")
	public String reviewComments;
	
	@SerializedName(value ="ReviewStatus")
	public String reviewStatus;
	
	@SerializedName(value ="ReviewStatusReason")
	public String reviewStatusReason;
	
	@SerializedName(value ="Stage")
	public String stage;
	
	@SerializedName(value ="TargetCloseDate")
	public String targetCloseDate;	
	
	
}