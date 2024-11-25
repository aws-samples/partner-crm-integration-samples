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
import software.amazon.awssdk.services.partnercentralselling.model.GetEngagementInvitationRequest;
import software.amazon.awssdk.services.partnercentralselling.model.GetEngagementInvitationResponse;

/*
 * Purpose
 * PC-API-22 Get engagement invitation opportunity
 */

public class GetEngagementInvitation {

	static PartnerCentralSellingClient client = PartnerCentralSellingClient.builder()
            .region(Region.US_EAST_1)
            .credentialsProvider(DefaultCredentialsProvider.create())
            .httpClient(ApacheHttpClient.builder().build())
            .build();
	
    public static void main(String[] args) {
    	
    	String opportunityId = args.length > 0 ? args[0] : OPPORTUNITY_ID;
    	    	
    	GetEngagementInvitationResponse response = getResponse(opportunityId);
    	
    	ReferenceCodesUtils.formatOutput(response);
    }

	static GetEngagementInvitationResponse getResponse(String opportunityId) {
		
		GetEngagementInvitationRequest getOpportunityRequest = GetEngagementInvitationRequest.builder()
				.catalog(Constants.CATALOG_TO_USE)
        		.identifier(opportunityId)
        		.build();
        
		GetEngagementInvitationResponse response = client.getEngagementInvitation(getOpportunityRequest);
        
        return response;
	}
}
