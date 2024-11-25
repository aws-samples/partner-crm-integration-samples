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
import software.amazon.awssdk.services.partnercentralselling.model.ListOpportunitiesRequest;
import software.amazon.awssdk.services.partnercentralselling.model.ListOpportunitiesResponse;
import software.amazon.awssdk.services.partnercentralselling.model.OpportunitySummary;
import software.amazon.awssdk.services.partnercentralselling.model.ReviewStatus;
import software.amazon.awssdk.services.partnercentralselling.model.Stage;

/*
 * Purpose
 * PC-API-18 Getting list of Opportunities with filters
 */

public class ListOpportunititesNoPagingWithFilters {
	
	static PartnerCentralSellingClient client = PartnerCentralSellingClient.builder()
            .region(Region.US_EAST_1)
            .credentialsProvider(DefaultCredentialsProvider.create())
            .httpClient(ApacheHttpClient.builder().build())
            .build();
	
    public static void main(String[] args) {
    	
    	List<OpportunitySummary> opportunitySummaries = getResponse();
        ReferenceCodesUtils.formatOutput(opportunitySummaries);
    }
    
    public static List<OpportunitySummary> getResponse() {

		List<OpportunitySummary> opportunitySummaries = new ArrayList<OpportunitySummary>();
		
		ListOpportunitiesRequest listOpportunityRequest = ListOpportunitiesRequest.builder()
                .catalog(CATALOG_TO_USE)
                .lifeCycleReviewStatus(ReviewStatus.APPROVED)
                .lifeCycleStage(Stage.QUALIFIED)
        		.maxResults(5)
        		.build();
        
    	ListOpportunitiesResponse response = client.listOpportunities(listOpportunityRequest);
    	
    	opportunitySummaries.addAll(response.opportunitySummaries());
    	
    	client.close();
    	
        return opportunitySummaries;
	}
}
