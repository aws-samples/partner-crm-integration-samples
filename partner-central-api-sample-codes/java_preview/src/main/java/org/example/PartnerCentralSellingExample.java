// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
package org.example;

import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.http.apache.ApacheHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.partnercentralselling.PartnerCentralSellingClient;
import software.amazon.awssdk.services.partnercentralselling.model.Account;
import software.amazon.awssdk.services.partnercentralselling.model.Address;
import software.amazon.awssdk.services.partnercentralselling.model.CompetitorName;
import software.amazon.awssdk.services.partnercentralselling.model.Contact;
import software.amazon.awssdk.services.partnercentralselling.model.CreateOpportunityRequest;
import software.amazon.awssdk.services.partnercentralselling.model.CreateOpportunityResponse;
import software.amazon.awssdk.services.partnercentralselling.model.Customer;
import software.amazon.awssdk.services.partnercentralselling.model.DeliveryModel;
import software.amazon.awssdk.services.partnercentralselling.model.ExpectedCustomerSpend;
import software.amazon.awssdk.services.partnercentralselling.model.GetOpportunityRequest;
import software.amazon.awssdk.services.partnercentralselling.model.GetOpportunityResponse;
import software.amazon.awssdk.services.partnercentralselling.model.Industry;
import software.amazon.awssdk.services.partnercentralselling.model.LifeCycle;
import software.amazon.awssdk.services.partnercentralselling.model.OpportunityType;
import software.amazon.awssdk.services.partnercentralselling.model.PartnerCentralSellingException;
import software.amazon.awssdk.services.partnercentralselling.model.Project;
import software.amazon.awssdk.services.partnercentralselling.model.SalesActivity;

public class PartnerCentralSellingExample {

    public static void main(String[] args) {
        // Initializing the client
        // Remove the endpoint override to use the production environment
        PartnerCentralSellingClient client = PartnerCentralSellingClient.builder()
                .region(Region.US_EAST_1)
                .credentialsProvider(DefaultCredentialsProvider.create())
                .httpClient(ApacheHttpClient.builder().build())
                .build();

       //Building the Actual CreateOpportunity Request
        CreateOpportunityRequest createOpportunityRequest = CreateOpportunityRequest.builder()
                .catalog("AWS")
                .clientToken("clientToken-123")
                .primaryNeedsFromAwsWithStrings("Co-Sell - Business Presentation")
                .opportunityType(OpportunityType.NET_NEW_BUSINESS)
                .lifeCycle(LifeCycle.builder()
                        .targetCloseDate("2025-03-23")
                        .build())
                .customer(Customer.builder()
                        .account(Account.builder()
                                .address(Address.builder()
                                        .postalCode("10001")
                                        .stateOrRegion("New York")
                                        .countryCode("US")
                                        .build())
                                .duns("111100111")
                                .industry(Industry.FINANCIAL_SERVICES)
                                .companyName("Test Opportunity Company Name 07")
                                .websiteUrl("www.testsite011.amazon.com")
                                .build())
                        .contacts(Contact.builder()
                                .email("testnamelast09@gmail.com")
                                .firstName("TestContact011")
                                .lastName("MLastName001")
                                .phone("+14567898765")
                                .businessTitle("Executive")
                                .build())
                        .build())
                .project(Project.builder()
                        .title("Some New Project Name")
                        .customerBusinessProblem("A very important problem goes here. Test Opportunity Creation")
                        .customerUseCase("Blockchain")
                        .deliveryModels(DeliveryModel.SAAS_OR_PAAS)
                        .expectedCustomerSpend(ExpectedCustomerSpend.builder()
                                .amount("10000.0")
                                .currencyCode("USD")
                                .frequency("Monthly")
                                .targetCompany("AWS")
                                .build())
                        .salesActivities(SalesActivity.CONDUCTED_POC_DEMO)
                        .competitorName(CompetitorName.GOOGLE_CLOUD_PLATFORM)
                        .otherSolutionDescription("Test Solution Description")
                        .build())
                .partnerOpportunityIdentifier("23232323")
                .opportunityTeam(Contact.builder()
                                .email("testnamelast09@gmail.com")
                                .firstName("TestContactName07")
                                .lastName("ContactLastName07")
                                .phone("+123342111")
                                .businessTitle("PartnerAccountManager")
                                .build())
                .build();

        try {
            CreateOpportunityResponse response = client.createOpportunity(createOpportunityRequest);
            System.out.println("Successfully created: " + response);

            GetOpportunityResponse getResponse = client.getOpportunity(
                    GetOpportunityRequest.builder()
                        .catalog("AWS")
                        .identifier(response.partnerOpportunityIdentifier())
                        .build()
            );

            System.out.println("Opportunity: " + getResponse);
        } catch (PartnerCentralSellingException e) {
            System.out.println("Error creating opportunity: " + e.getMessage());
        }

        client.close();
    }
}
