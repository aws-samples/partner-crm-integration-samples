// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
package org.example;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static org.example.utils.Constants.*;

import org.example.entity.Root;
import org.example.utils.Constants;
import org.example.utils.ReferenceCodesUtils;
import org.example.utils.StringSerializer;

import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.http.apache.ApacheHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.partnercentralselling.PartnerCentralSellingClient;
import software.amazon.awssdk.services.partnercentralselling.model.Account;
import software.amazon.awssdk.services.partnercentralselling.model.Address;
import software.amazon.awssdk.services.partnercentralselling.model.Contact;
import software.amazon.awssdk.services.partnercentralselling.model.Customer;
import software.amazon.awssdk.services.partnercentralselling.model.ExpectedCustomerSpend;
import software.amazon.awssdk.services.partnercentralselling.model.GetOpportunityRequest;
import software.amazon.awssdk.services.partnercentralselling.model.GetOpportunityResponse;
import software.amazon.awssdk.services.partnercentralselling.model.LifeCycle;
import software.amazon.awssdk.services.partnercentralselling.model.Marketing;
import software.amazon.awssdk.services.partnercentralselling.model.NextStepsHistory;
import software.amazon.awssdk.services.partnercentralselling.model.Project;
import software.amazon.awssdk.services.partnercentralselling.model.ReviewStatus;
import software.amazon.awssdk.services.partnercentralselling.model.UpdateOpportunityRequest;
import software.amazon.awssdk.services.partnercentralselling.model.UpdateOpportunityResponse;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.ToNumberPolicy;

/*
 * Purpose
 * PC-API-02/06 Update opportunity when LifeCycle.ReviewStatus is not Submitted or In-Review
 */

public class UpdateOpportunity {
	
	static final Gson GSON = new GsonBuilder()
			.setObjectToNumberStrategy(ToNumberPolicy.LAZILY_PARSED_NUMBER)
			.registerTypeAdapter(String.class, new StringSerializer())
			.create();
	
	static PartnerCentralSellingClient client = PartnerCentralSellingClient.builder()
            .region(Region.US_EAST_1)
            .credentialsProvider(DefaultCredentialsProvider.create())
            .httpClient(ApacheHttpClient.builder().build())
            .build();
	
	static String OPPORTUNITY_ORIGIN = ORIGIN_PARTNER_ORIGINATED;

	public static void main(String[] args) {

		String inputFile = "updateOpportunity.json";
		
		if (args.length > 0)
			inputFile = args[0];
		
		UpdateOpportunityResponse response = updateOpportunity(inputFile);
		
		client.close();
	}
	
	public static GetOpportunityResponse getResponse(String opportunityId) {

        GetOpportunityRequest getOpportunityRequest = GetOpportunityRequest.builder()
				.catalog(Constants.CATALOG_TO_USE)
        		.identifier(opportunityId)
        		.build();
        
        GetOpportunityResponse response = client.getOpportunity(getOpportunityRequest);
        System.out.println(opportunityId + ":" + response);
        return response;
	}
	
	public static UpdateOpportunityResponse updateOpportunity(String inputFile) {
		
		String inputString = ReferenceCodesUtils.readInputFileToString(inputFile);

		Root root = GSON.fromJson(inputString, Root.class);
		GetOpportunityResponse response = getResponse(root.identifier);

		if (response != null 
				&& response.lifeCycle() != null
				&& response.lifeCycle().reviewStatus() != null
				&& response.lifeCycle().reviewStatus() != ReviewStatus.SUBMITTED
				&& response.lifeCycle().reviewStatus() != ReviewStatus.IN_REVIEW) {
			
			List<NextStepsHistory> nextStepsHistories = new ArrayList<NextStepsHistory>();
			if ( root.lifeCycle != null && root.lifeCycle.nextStepsHistories != null) {		
				for (org.example.entity.NextStepsHistory nextStepsHistoryJson : root.lifeCycle.nextStepsHistories) {
					NextStepsHistory nextStepsHistory = NextStepsHistory.builder()
							.time(Instant.parse(nextStepsHistoryJson.time))
							.value(nextStepsHistoryJson.value)
			                .build();
					nextStepsHistories.add(nextStepsHistory);
				}
			}
			
			LifeCycle lifeCycle = null;
			if ( root.lifeCycle != null ) {
				lifeCycle = LifeCycle.builder()
					.closedLostReason(root.lifeCycle.closedLostReason)
					.nextSteps(root.lifeCycle.nextSteps)
					.nextStepsHistory(nextStepsHistories)
					.reviewComments(root.lifeCycle.reviewComments)
					.reviewStatus(root.lifeCycle.reviewStatus)
					.reviewStatusReason(root.lifeCycle.reviewStatusReason)
					.stage(root.lifeCycle.stage)
					.targetCloseDate(root.lifeCycle.targetCloseDate)
					.build();
			}
			
			Marketing marketing = null;
			if ( root.marketing != null ) {
				marketing = Marketing.builder()
						.awsFundingUsed(root.marketing.awsFundingUsed)
						.campaignName(root.marketing.campaignName)
						.channels(root.marketing.channels)
						.source(root.marketing.source)
						.useCases(root.marketing.useCases)
						.build();
						
			}

			Address address = null;
			if (root.customer != null && root.customer.account != null && root.customer.account.address != null) {
				address = Address.builder().postalCode(root.customer.account.address.postalCode)
						.stateOrRegion(root.customer.account.address.stateOrRegion)
						.countryCode(root.customer.account.address.countryCode).build();
			}

			Account account = null;
			if (root.customer != null && root.customer.account != null) {
				account = Account.builder().address(address).duns(root.customer.account.duns)
						.industry(root.customer.account.industry).companyName(root.customer.account.companyName)
						.websiteUrl(root.customer.account.websiteUrl).build();
			}

			List<Contact> contacts = new ArrayList<Contact>();
			if ( root.customer != null && root.customer.contacts != null) {		
				for (org.example.entity.Contact jsonContact : root.customer.contacts) {
					Contact contact = Contact.builder()
			                .email(jsonContact.email)
			                .firstName(jsonContact.firstName)
			                .lastName(jsonContact.lastName)
			                .phone(jsonContact.phone)
			                .businessTitle(jsonContact.businessTitle)
			                .build();
					contacts.add(contact);
				}
			}

			Customer customer = Customer.builder().account(account).contacts(contacts).build();

			List<ExpectedCustomerSpend> expectedCustomerSpends = new ArrayList<ExpectedCustomerSpend>();
			if ( root.project != null && root.project.expectedCustomerSpend != null) {
				for (org.example.entity.ExpectedCustomerSpend expectedCustomerSpendJson : root.project.expectedCustomerSpend) {
					ExpectedCustomerSpend expectedCustomerSpend = null;
					expectedCustomerSpend = ExpectedCustomerSpend.builder()
							.amount(expectedCustomerSpendJson.amount)
							.currencyCode(expectedCustomerSpendJson.currencyCode)
							.frequency(expectedCustomerSpendJson.frequency)
							.targetCompany(expectedCustomerSpendJson.targetCompany)
							.build();
					expectedCustomerSpends.add(expectedCustomerSpend);
				}
	        }

			Project project = null;
			if (root.project != null) {
				project = Project.builder().title(root.project.title)
						.customerBusinessProblem(root.project.customerBusinessProblem)
						.customerUseCase(root.project.customerUseCase).deliveryModels(root.project.deliveryModels)
						.expectedCustomerSpend(expectedCustomerSpends)
						.salesActivities(root.project.salesActivities).competitorName(root.project.competitorName)
						.otherSolutionDescription(root.project.otherSolutionDescription).build();
			}

			// Building the Actual CreateOpportunity Request
			UpdateOpportunityRequest updateOpportunityRequest = UpdateOpportunityRequest.builder().catalog(root.catalog)
					.identifier(root.identifier).lastModifiedDate(Instant.parse(root.lastModifiedDate))
					.primaryNeedsFromAwsWithStrings(root.primaryNeedsFromAws).opportunityType(root.opportunityType)
					.lifeCycle(lifeCycle)
					.customer(customer)
					.project(project)
					.partnerOpportunityIdentifier(root.partnerOpportunityIdentifier)
					.marketing(marketing)
					.nationalSecurity(root.nationalSecurity)
					.opportunityType(root.opportunityType)
					.build();

			UpdateOpportunityResponse updateResponse = client.updateOpportunity(updateOpportunityRequest);
			System.out.println("Successfully updated opportunity: " + updateResponse);

			return updateResponse;
		} else {
			System.out.println("Opportunity cannot be updated.");
			return null;
		}
    }
}
