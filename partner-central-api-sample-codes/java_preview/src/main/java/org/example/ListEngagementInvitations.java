// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
package org.example;

import java.util.ArrayList;
import java.util.List;

import org.example.utils.ReferenceCodesUtils;
import static org.example.utils.Constants.*;

import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.http.apache.ApacheHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.partnercentralselling.PartnerCentralSellingClient;
import software.amazon.awssdk.services.partnercentralselling.model.ListEngagementInvitationsRequest;
import software.amazon.awssdk.services.partnercentralselling.model.ListEngagementInvitationsResponse;
import software.amazon.awssdk.services.partnercentralselling.model.ParticipantType;
import software.amazon.awssdk.services.partnercentralselling.model.EngagementInvitationSummary;

public class ListEngagementInvitations {
	
	static PartnerCentralSellingClient client = PartnerCentralSellingClient.builder()
            .region(Region.US_EAST_1)
            .credentialsProvider(DefaultCredentialsProvider.create())
            .httpClient(ApacheHttpClient.builder().build())
            .build();
	
    public static void main(String[] args) {
    	
    	List<EngagementInvitationSummary> opportunitySummaries = getResponse();
        ReferenceCodesUtils.formatOutput(opportunitySummaries);
    }
    
    static List<EngagementInvitationSummary> getResponse() {
		
		List<EngagementInvitationSummary> opportunitySummaries = new ArrayList<EngagementInvitationSummary>();
		
		ListEngagementInvitationsRequest listOpportunityRequest = ListEngagementInvitationsRequest.builder()
                .catalog(CATALOG_TO_USE)
                .participantType(ParticipantType.RECEIVER)
        		.maxResults(5)
        		.build();
        
		ListEngagementInvitationsResponse response = client.listEngagementInvitations(listOpportunityRequest);
    	
    	opportunitySummaries.addAll(response.engagementInvitationSummaries());
    	
    	client.close();
    	
        return opportunitySummaries;
	}
}
