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
import software.amazon.awssdk.services.partnercentralselling.model.StartEngagementByAcceptingInvitationTaskRequest;
import software.amazon.awssdk.services.partnercentralselling.model.StartEngagementByAcceptingInvitationTaskResponse;
import software.amazon.awssdk.services.partnercentralselling.model.GetEngagementInvitationRequest;
import software.amazon.awssdk.services.partnercentralselling.model.GetEngagementInvitationResponse;
import software.amazon.awssdk.services.partnercentralselling.model.InvitationStatus;

/*
Purpose
PC-API-04: Start Engagement By Accepting InvitationTask for AWS Originated(AO) opportunity
*/

public class StartEngagementByAcceptingInvitationTask {
	
	static PartnerCentralSellingClient client = PartnerCentralSellingClient.builder()
            .region(Region.US_EAST_1)
            .credentialsProvider(DefaultCredentialsProvider.create())            
            .httpClient(ApacheHttpClient.builder().build())
            .build();
	
	static String clientToken = "test-a30d161";

    public static void main(String[] args) {
    	
    	String opportunityId = args.length > 0 ? args[0] : OPPORTUNITY_ID;
    	
    	StartEngagementByAcceptingInvitationTaskResponse response = getResponse(opportunityId);
    	
    	if ( response == null) {
    		System.out.println("Opportunity is not AWS Originated.");
    	} else {
    		ReferenceCodesUtils.formatOutput(response);
    	}
    }
    
    private static GetEngagementInvitationResponse getInvitation(String invitationId) {
		
    	GetEngagementInvitationRequest getRequest = GetEngagementInvitationRequest.builder()
        		.catalog(Constants.CATALOG_TO_USE)
        		.identifier(invitationId)
        		.build();

		GetEngagementInvitationResponse response = client.getEngagementInvitation(getRequest);
        
        return response;
	}

	static StartEngagementByAcceptingInvitationTaskResponse getResponse(String invitationId) {
		
		if ( getInvitation(invitationId).status().equals(InvitationStatus.PENDING)) {
			StartEngagementByAcceptingInvitationTaskRequest acceptOpportunityRequest = 
					StartEngagementByAcceptingInvitationTaskRequest.builder()
					.catalog(Constants.CATALOG_TO_USE)
	        		.identifier(invitationId)
	        		.clientToken(clientToken)
	        		.build();

			StartEngagementByAcceptingInvitationTaskResponse response = client.startEngagementByAcceptingInvitationTask(acceptOpportunityRequest);
	        return response;
		}
		return null;
	}
}
