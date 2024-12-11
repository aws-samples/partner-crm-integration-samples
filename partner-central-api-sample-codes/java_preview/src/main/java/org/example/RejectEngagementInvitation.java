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
import software.amazon.awssdk.services.partnercentralselling.model.RejectEngagementInvitationRequest;
import software.amazon.awssdk.services.partnercentralselling.model.RejectEngagementInvitationResponse;

/*
 * Purpose
 * PC-API-05 AWS Originated(AO) rejection
 */

public class RejectEngagementInvitation {

	static PartnerCentralSellingClient client = PartnerCentralSellingClient.builder()
            .region(Region.US_EAST_1)
            .credentialsProvider(DefaultCredentialsProvider.create())
            .httpClient(ApacheHttpClient.builder().build())
            .build();
	
    public static void main(String[] args) {
    	
    	String opportunityId = args.length > 0 ? args[0] : OPPORTUNITY_ID;

		RejectEngagementInvitationResponse response = getResponse(opportunityId);
    	
    	ReferenceCodesUtils.formatOutput(response);
    }

	static RejectEngagementInvitationResponse getResponse(String invitationId) {
		
        RejectEngagementInvitationRequest rejectOpportunityRequest = RejectEngagementInvitationRequest.builder()
				.catalog(Constants.CATALOG_TO_USE)
        		.identifier(invitationId)
        		.rejectionReason("Unable to support")
        		.build();

		RejectEngagementInvitationResponse response = client.rejectEngagementInvitation(rejectOpportunityRequest);
        
        return response;
	}
}
