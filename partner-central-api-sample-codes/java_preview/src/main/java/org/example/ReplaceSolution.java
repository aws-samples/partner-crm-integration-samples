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
import software.amazon.awssdk.services.partnercentralselling.model.DisassociateOpportunityRequest;
import software.amazon.awssdk.services.partnercentralselling.model.DisassociateOpportunityResponse;

/*
Purpose
PC-API -17 Replacing a solution
*/

public class ReplaceSolution {

	static PartnerCentralSellingClient client = PartnerCentralSellingClient.builder()
            .region(Region.US_EAST_1)
            .credentialsProvider(DefaultCredentialsProvider.create())
            .httpClient(ApacheHttpClient.builder().build())
            .build();
	
    public static void main(String[] args) {
    	
    	String opportunityId = args.length > 0 ? args[0] : OPPORTUNITY_ID;
    	
    	String entityType = "Solutions";
    	String originalEntityIdentifier = "S-0000000";
    	String newEntityIdentifier = "S-0011111";
    	
    	disassociateOppornitityResponse(opportunityId, entityType, originalEntityIdentifier );
    	AssociateOpportunityResponse associateOpportunityResponse = associateOpportunityResponse(opportunityId, entityType, newEntityIdentifier );
    	
    	ReferenceCodesUtils.formatOutput(associateOpportunityResponse);
    }

	private static AssociateOpportunityResponse associateOpportunityResponse(String opportunityId, String entityType, String entityIdentifier) {
		
        AssociateOpportunityRequest associateOpportunityRequest = AssociateOpportunityRequest.builder()
				.catalog(Constants.CATALOG_TO_USE)
        		.opportunityIdentifier(opportunityId)
        		.relatedEntityType(entityType)
        		.relatedEntityIdentifier(entityIdentifier)
        		.build();
        
        AssociateOpportunityResponse response = client.associateOpportunity(associateOpportunityRequest);
        
        return response;
	}
	
	private static DisassociateOpportunityResponse disassociateOppornitityResponse(String opportunityId, String entityType, String entityIdentifier) {
		PartnerCentralSellingClient client = PartnerCentralSellingClient.builder()
            .region(Region.US_EAST_1)
            .credentialsProvider(DefaultCredentialsProvider.create())
            .httpClient(ApacheHttpClient.builder().build())
            .build();

        DisassociateOpportunityRequest disassociateOpportunityRequest = DisassociateOpportunityRequest.builder()
				.catalog(Constants.CATALOG_TO_USE)
        		.opportunityIdentifier(opportunityId)
        		.relatedEntityType(entityType)
        		.relatedEntityIdentifier(entityIdentifier)
        		.build();
        
        DisassociateOpportunityResponse response = client.disassociateOpportunity(disassociateOpportunityRequest);
        
        return response;
	}
}
