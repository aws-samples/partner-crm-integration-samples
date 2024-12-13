// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
package org.example;

import static org.example.utils.Constants.*;

import org.example.utils.Constants;
import org.example.utils.ReferenceCodesUtils;

import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.http.apache.ApacheHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.partnercentralselling.PartnerCentralSellingClient;
import software.amazon.awssdk.services.partnercentralselling.model.AssignOpportunityRequest;
import software.amazon.awssdk.services.partnercentralselling.model.AssignOpportunityResponse;
import software.amazon.awssdk.services.partnercentralselling.model.AssigneeContact;

/*
Purpose
PC-API-07 Assigning a new owner
*/

public class AssignOpportunity {
	
	static PartnerCentralSellingClient client = PartnerCentralSellingClient.builder()
            .region(Region.US_EAST_1)
            .credentialsProvider(DefaultCredentialsProvider.create())
            .httpClient(ApacheHttpClient.builder().build())
            .build();

    public static void main(String[] args) {
    	
    	String opportunityId = args.length > 0 ? args[0] : OPPORTUNITY_ID;
    	    	
    	String assigneeFirstName = "John";
    	
    	String assigneeLastName = "Doe";
    	
    	String assigneeEmail = "test@test.com";
    	
    	String businessTitle = "PartnerAccountManager";
    	
    	AssignOpportunityResponse response = getResponse(opportunityId, assigneeFirstName, assigneeLastName, assigneeEmail, businessTitle);
    	
    	ReferenceCodesUtils.formatOutput(response);
    }

	static AssignOpportunityResponse getResponse(String opportunityId, String assigneeFirstName, String assigneeLastName, String assigneeEmail, String businessTitle) {
				
		AssignOpportunityRequest assignOpportunityRequest = AssignOpportunityRequest.builder()
				.catalog(Constants.CATALOG_TO_USE)
        		.identifier(opportunityId)
        		.assignee(AssigneeContact.builder()
        				.firstName(assigneeFirstName)
        				.lastName(assigneeLastName)
        				.email(assigneeEmail)
        				.businessTitle(businessTitle)
        				.build())
        		.build();
        
        AssignOpportunityResponse response = client.assignOpportunity(assignOpportunityRequest);
        
        return response;
	}
}
