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
import software.amazon.awssdk.services.partnercentralselling.model.AssociateOpportunityRequest;
import software.amazon.awssdk.services.partnercentralselling.model.AssociateOpportunityResponse;

/*
Purpose
PC-API -11 Associating a product
PC-API -12 Associating a solution
PC-API -13 Associating an offer
entity_type = Solutions | AWSProducts | AWSMarketplaceOffers 
*/

public class AssociateOpportunity {
	
	static PartnerCentralSellingClient client = PartnerCentralSellingClient.builder()
            .region(Region.US_EAST_1)
            .credentialsProvider(DefaultCredentialsProvider.create())
            .httpClient(ApacheHttpClient.builder().build())
            .build();

    public static void main(String[] args) {
    	
    	String opportunityId = args.length > 0 ? args[0] : OPPORTUNITY_ID;
    	    	
    	String entityType = "Solutions";
    	
    	String entityIdentifier = "S-0000000";
    	
    	AssociateOpportunityResponse response = getResponse(opportunityId, entityType, entityIdentifier );
    	
    	ReferenceCodesUtils.formatOutput(response);
    }

static AssociateOpportunityResponse getResponse(String opportunityId, String entityType, String entityIdentifier) {
		
        AssociateOpportunityRequest associateOpportunityRequest = AssociateOpportunityRequest.builder()
				.catalog(Constants.CATALOG_TO_USE)
        		.opportunityIdentifier(opportunityId)
        		.relatedEntityType(entityType)
        		.relatedEntityIdentifier(entityIdentifier)
        		.build();
        
        AssociateOpportunityResponse response = client.associateOpportunity(associateOpportunityRequest);
        
        return response;
	}
}
