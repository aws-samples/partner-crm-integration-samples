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
import software.amazon.awssdk.services.partnercentralselling.model.AwsSubmission;
import software.amazon.awssdk.services.partnercentralselling.model.SalesInvolvementType;
import software.amazon.awssdk.services.partnercentralselling.model.StartEngagementFromOpportunityTaskRequest;
import software.amazon.awssdk.services.partnercentralselling.model.StartEngagementFromOpportunityTaskResponse;
import software.amazon.awssdk.services.partnercentralselling.model.Visibility;

/*
 * Purpose
 * PC-API-01 Partner Originated (PO) opp submission(Start Engagement From Opportunity Task for AO Originated Opportunity)
 */

public class StartEngagementFromOpportunityTask {

	static PartnerCentralSellingClient client = PartnerCentralSellingClient.builder()
            .region(Region.US_EAST_1)
            .credentialsProvider(DefaultCredentialsProvider.create())
            .httpClient(ApacheHttpClient.builder().build())
            .build();
	
    public static void main(String[] args) {
    	
    	String opportunityId = args.length > 0 ? args[0] : OPPORTUNITY_ID;
    	
    	StartEngagementFromOpportunityTaskResponse response = getResponse(opportunityId);
    	
    	ReferenceCodesUtils.formatOutput(response);
    }

	static StartEngagementFromOpportunityTaskResponse getResponse(String opportunityId) {
		
		StartEngagementFromOpportunityTaskRequest submitOpportunityRequest = StartEngagementFromOpportunityTaskRequest.builder()
				.catalog(Constants.CATALOG_TO_USE)
        		.identifier(opportunityId)
        		.clientToken("test-annjqwesdsd99")
        		.awsSubmission(AwsSubmission.builder().involvementType(SalesInvolvementType.CO_SELL).visibility(Visibility.FULL).build())
        		.build();

		StartEngagementFromOpportunityTaskResponse response = client.startEngagementFromOpportunityTask(submitOpportunityRequest);
        
        return response;
	}
}
