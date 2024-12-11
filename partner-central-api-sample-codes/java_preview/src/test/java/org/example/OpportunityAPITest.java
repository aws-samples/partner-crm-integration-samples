// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
package org.example;

import org.junit.jupiter.api.Test;

import software.amazon.awssdk.services.partnercentralselling.model.AssignOpportunityResponse;
import software.amazon.awssdk.services.partnercentralselling.model.AssociateOpportunityResponse;
import software.amazon.awssdk.services.partnercentralselling.model.CreateOpportunityResponse;
import software.amazon.awssdk.services.partnercentralselling.model.DisassociateOpportunityResponse;
import software.amazon.awssdk.services.partnercentralselling.model.EngagementInvitationSummary;
import software.amazon.awssdk.services.partnercentralselling.model.GetEngagementInvitationResponse;
import software.amazon.awssdk.services.partnercentralselling.model.GetOpportunityResponse;
import software.amazon.awssdk.services.partnercentralselling.model.OpportunitySummary;
import software.amazon.awssdk.services.partnercentralselling.model.RejectEngagementInvitationResponse;
import software.amazon.awssdk.services.partnercentralselling.model.SolutionBase;
import software.amazon.awssdk.services.partnercentralselling.model.StartEngagementByAcceptingInvitationTaskResponse;
import software.amazon.awssdk.services.partnercentralselling.model.StartEngagementFromOpportunityTaskResponse;
import software.amazon.awssdk.services.partnercentralselling.model.UpdateOpportunityResponse;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

class OpportunityAPITest {
	
	@Test
	public void testAcceptOpportunityEngagementInvitation() {
		String invitationId = "test_invitation_id";
		StartEngagementByAcceptingInvitationTaskResponse response = StartEngagementByAcceptingInvitationTask.getResponse(invitationId);
		if ( response != null && response.sdkHttpResponse() != null ) {
			assertEquals(response.sdkHttpResponse().statusCode(), 200);
		} else {
			fail("Response or SDK HTTP Response is null");
		}
	
	}
    
    @Test
	public void testListOpportunities() {
		List<OpportunitySummary> opportunitySummaries = ListOpportunititesNoPaging.getResponse();
		assertNotNull(opportunitySummaries);
        assertTrue(opportunitySummaries instanceof List);
        assertFalse(opportunitySummaries.isEmpty());
	}
    
    @Test
	public void testListOpportunityEngagementInvitation() {
		List<EngagementInvitationSummary> opportunitySummaries = ListEngagementInvitations.getResponse();
		assertNotNull(opportunitySummaries);
        assertTrue(opportunitySummaries instanceof List);
        assertFalse(opportunitySummaries.isEmpty());
	}
    
    @Test
	public void testSolutons() {
		List<SolutionBase> solutionSummaries = ListSolutions.getResponse();
		assertNotNull(solutionSummaries);
        assertTrue(solutionSummaries instanceof List);
        assertFalse(solutionSummaries.isEmpty());
	}
        
    @Test
    public void testGetOpportunity() {
    	String opportunityId = "O1111111";
    	GetOpportunityResponse response = GetOpportunity.getResponse(opportunityId);
    	if ( response != null && response.sdkHttpResponse() != null ) {
			assertEquals(response.sdkHttpResponse().statusCode(), 200);
		} else {
			fail("Response or SDK HTTP Response is null");
		}
    }
    
    @Test
    public void testGetOpportunityEngagementInvitation() {
    	String opportunityId = "O1111111";
    	GetEngagementInvitationResponse response = GetEngagementInvitation.getResponse(opportunityId);
    	if ( response != null && response.sdkHttpResponse() != null ) {
			assertEquals(response.sdkHttpResponse().statusCode(), 200);
		} else {
			fail("Response or SDK HTTP Response is null");
		}
    }
    
    @Test
    public void testAssignOpportunity() {
    	String opportunityId = "O1111111";
    	String assigneeEmail = "test@test.com";
        String assigneeFirstName = "John";
    	String assigneeLastName = "Doe";
    	String businessTitle = "PartnerAccountManager";
    	
    	
    	
    	AssignOpportunityResponse response = AssignOpportunity.getResponse(opportunityId, assigneeFirstName, assigneeLastName, assigneeEmail, businessTitle);
    	if ( response != null && response.sdkHttpResponse() != null ) {
			assertEquals(response.sdkHttpResponse().statusCode(), 200);
		} else {
			fail("Response or SDK HTTP Response is null");
		}
    }
    
    @Test
    public void testAssociateOpportunity() {
    	String opportunityId = "O1111111";
    	String entityType = "Solutions";    	
    	String entityIdentifier = "S-0000000";
    	AssociateOpportunityResponse response = AssociateOpportunity.getResponse(opportunityId, entityType, entityIdentifier);
    	if ( response != null && response.sdkHttpResponse() != null ) {
			assertEquals(response.sdkHttpResponse().statusCode(), 200);
		} else {
			fail("Response or SDK HTTP Response is null");
		}
    }
    
    @Test
    public void testCreateOpportunity() {
    	String createOpportunityJsonPayloadFile = "CeateOpportunity.json";
    	CreateOpportunityResponse response = CreateOpportunity.createOpportunity(createOpportunityJsonPayloadFile);
    	if ( response != null && response.sdkHttpResponse() != null ) {
			assertEquals(response.sdkHttpResponse().statusCode(), 200);
		} else {
			fail("Response or SDK HTTP Response is null");
		}
    }
    
    @Test
    public void testUpdateOpportunity() {
    	String updateOpportunityJsonPayloadFile = "UpdateOpportunity.json";
    	UpdateOpportunityResponse response = UpdatePartnerOriginatedActionRequiredOpportunity.updateOpportunity(updateOpportunityJsonPayloadFile);
    	if ( response != null && response.sdkHttpResponse() != null ) {
			assertEquals(response.sdkHttpResponse().statusCode(), 200);
		} else {
			fail("Response or SDK HTTP Response is null");
		}
    }
    
    @Test
    public void testDisassociateOpportunity() {
    	String opportunityId = "O1111111";
    	String entityType = "Solutions";    	
    	String entityIdentifier = "S-0000000";
    	DisassociateOpportunityResponse response = DisassociateOpportunity.getResponse(opportunityId, entityType, entityIdentifier);
    	if ( response != null && response.sdkHttpResponse() != null ) {
			assertEquals(response.sdkHttpResponse().statusCode(), 200);
		} else {
			fail("Response or SDK HTTP Response is null");
		}
    }
    
    @Test
    public void testRejectOpportunity() {
    	String opportunityId = "O1111111";
    	RejectEngagementInvitationResponse response = RejectEngagementInvitation.getResponse(opportunityId);
    	if ( response != null && response.sdkHttpResponse() != null ) {
			assertEquals(response.sdkHttpResponse().statusCode(), 200);
		} else {
			fail("Response or SDK HTTP Response is null");
		}
    }
    
    @Test
    public void testStartEngagementFromOpportunityTask() {
    	String opportunityId = "O1111111";
    	StartEngagementFromOpportunityTaskResponse response = StartEngagementFromOpportunityTask.getResponse(opportunityId);
    	if ( response != null && response.sdkHttpResponse() != null ) {
			assertEquals(response.sdkHttpResponse().statusCode(), 200);
		} else {
			fail("Response or SDK HTTP Response is null");
		}
    }
    
    
    
    
}