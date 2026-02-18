# Lead to Opportunity Workflow Documentation

This document provides comprehensive documentation for the partner-side Lead to Opportunity workflow using AWS Partner Central Selling API. The workflow demonstrates the partner process of accepting engagement invitations, qualifying leads, converting them to opportunities, and managing the entire lifecycle.

## Workflow Overview

This repository contains the partner-side workflow (steps 1-10) for the Lead to Opportunity process:

**Note**: AWS-initiated engagement creation and invitation steps are not included in this documentation.

**Partner-Initiated Actions (Steps 1 - 10):**
1. Retrieving engagement invitation details (Partner)
2. Accepting engagement invitations (Partner)
3. Retrieving engagement details (Partner)
4. Updating engagement contexts (Partner)
5. Converting leads to opportunities (Partner)
6. Listing available solutions (Partner)
7. Associating solutions with opportunities (Partner)
8. Retrieving opportunity details (Partner)
9. Updating opportunities with complete data (Partner)
10. Submitting opportunity to AWS for review (Partner)

These actions represent the partner's lead qualification, opportunity management, and collaboration workflow in response to AWS invitations.

---

**Note**: AWS-initiated engagement creation and invitation steps are not included in this documentation. The workflow begins with step 1 where partners receive and process engagement invitations.

---

## 1_get_engagement_invitation.py

### Purpose
Retrieves details of the engagement invitation to verify its status and content.

**Actor: Partner** - This action is performed by the partner to review the invitation details from AWS.

### API Action
- `get_engagement_invitation`

### Request Payload
```json
{
    "Catalog": "AWS",
    "Identifier": "engi-5x2rtvhpgoyvz"
}
```

### Response Payload
```json
{
    "Arn": "arn:aws:partnercentral:us-east-1::catalog/AWS/engagement-invitation/engi-5x2rtvhpgoyvz",
    "PayloadType": "LeadInvitation",
    "Id": "engi-5x2rtvhpgoyvz",
    "EngagementId": "eng-xhyvbgfeme4xh4",
    "EngagementTitle": "visualize Initiative - 1336",
    "Status": "PENDING",
    "InvitationDate": "2025-11-03T03:12:02.078035+00:00",
    "ExpirationDate": "2025-11-18T03:12:02.078035+00:00",
    "SenderAwsAccountId": "aws",
    "SenderCompanyName": "AWS",
    "Receiver": {
        "Account": {
            "AwsAccountId": "[PARTNER_ACCOUNT_ID]"
        }
    },
    "Catalog": "AWS",
    "Payload": {
        "LeadInvitation": {
            "Insights": {
                "EngagementScore": "High"
            },
            "Customer": {
                "Industry": "Aerospace",
                "CompanyName": "Acme Corp",
                "WebsiteUrl": "https://acmecorp.example.com",
                "CountryCode": "US",
                "AwsMaturity": "Evaluating",
                "MarketSegment": "Enterprise"
            },
            "Interaction": {
                "SourceType": "Campaign",
                "SourceId": "SQFONL7I",
                "SourceName": "Recycled Wooden Shirt Campaign - 2025",
                "Usecase": "Database",
                "ContactBusinessTitle": "Investor Implementation Officer"
            }
        }
    },
    "InvitationMessage": "We have a qualified lead from Acme Corp that matches your expertise. Would you like to collaborate?",
    "EngagementDescription": "Lead generated from recent campaign activities",
    "ExistingMembers": [
        {
            "CompanyName": "ckPAk001aq000007AEld",
            "WebsiteUrl": "null"
        }
    ]
}
```

---

## 2_accept_engagement_invitation.py

### Purpose
Accepts the engagement invitation to join the engagement and participate in the lead qualification process.

**Actor: Partner** - This action is performed by the partner to accept AWS's invitation and join the engagement.

### API Action
- `accept_engagement_invitation`

### Request Payload
```json
{
    "Catalog": "AWS",
    "Identifier": "engi-5x2rtvhpgoyvz"
}
```

### Response Payload
```json
{
    "ResponseMetadata": {
        "RequestId": "74cfc8b0-3b73-4a3c-a915-53e4fda5f54e",
        "HTTPStatusCode": 200,
        "HTTPHeaders": {
            "date": "Mon, 03 Nov 2025 03:14:05 GMT",
            "content-type": "application/x-amz-json-1.0",
            "content-length": "0",
            "connection": "keep-alive",
            "x-amzn-requestid": "74cfc8b0-3b73-4a3c-a915-53e4fda5f54e"
        },
        "RetryAttempts": 0
    }
}
```

---

## 3_getEngagement.py

### Purpose
Retrieves complete engagement details including all contexts and lead information after accepting the invitation.

**Actor: Partner** - This action is performed by the partner to get detailed engagement information for lead qualification.

### API Action
- `get_engagement`

### Request Payload
```json
{
    "Catalog": "AWS",
    "Identifier": "eng-xhyvbgfeme4xh4"
}
```

### Response Payload
```json
{
    "Id": "eng-xhyvbgfeme4xh4",
    "Arn": "arn:aws:partnercentral:us-east-1::catalog/AWS/engagement/eng-xhyvbgfeme4xh4",
    "Title": "visualize Initiative - 1336",
    "Description": "Lead generated from recent campaign activities",
    "CreatedAt": "2025-11-03T03:11:42.981225+00:00",
    "CreatedBy": "aws",
    "MemberCount": 2,
    "ModifiedAt": "2025-11-03T03:14:05.368914+00:00",
    "ModifiedBy": "[PARTNER_ACCOUNT_ID]",
    "Contexts": [
        {
            "Id": "1",
            "Type": "Lead",
            "Payload": {
                "Lead": {
                    "Customer": {
                        "Industry": "Aerospace",
                        "CompanyName": "Acme Corp",
                        "Address": {
                            "CountryCode": "US"
                        }
                    },
                    "Interactions": [
                        {
                            "SourceType": "Campaign",
                            "SourceId": "SQFONL7I",
                            "SourceName": "Recycled Wooden Shirt Campaign - 2025",
                            "InteractionDate": "2025-11-03T03:11:42.978218+00:00",
                            "CustomerAction": "Completed Form",
                            "Contact": {
                                "BusinessTitle": "Investor Implementation Officer",
                                "Email": "test@test.com",
                                "FirstName": "Torey",
                                "LastName": "Orn"
                            }
                        }
                    ]
                }
            }
        }
    ]
}
```

---

## 4_update_engagement_context.py

### Purpose
Updates the engagement context with additional lead qualification information and new interactions.

**Actor: Partner** - This action is performed by the partner to add qualification details and update lead information.

### API Action
- `update_engagement_context`

### Request Payload
```json
{
    "Catalog": "AWS",
    "EngagementIdentifier": "eng-xhyvbgfeme4xh4",
    "ContextIdentifier": "1",
    "EngagementLastModifiedAt": "2025-11-03T03:14:05.368914936Z",
    "Type": "Lead",
    "Payload": {
        "Lead": {
            "QualificationStatus": "Qualified",
            "Customer": {
                "CompanyName": "Acme Corp",
                "Industry": "Software and Internet",
                "Address": {
                    "CountryCode": "US",
                    "StateOrRegion": "California",
                    "City": "San Francisco"
                },
                "WebsiteUrl": "https://acmecorp-updated.example.com",
                "MarketSegment": "Enterprise",
                "AwsMaturity": "Single-Account"
            },
            "Interaction": {
                "InteractionDate": "2025-11-04T03:11:42.978218Z",
                "SourceType": "Campaign",
                "SourceId": "SQFONL7I",
                "SourceName": "Recycled Wooden Shirt Campaign - 2025",
                "CustomerAction": "Completed Form",
                "BusinessProblem": "Need to modernize legacy database infrastructure for better scalability",
                "Usecase": "Database",
                "Contact": {
                    "BusinessTitle": "Investor Implementation Officer",
                    "Email": "test@test.com",
                    "FirstName": "Torey",
                    "LastName": "Orn"
                }
            }
        }
    }
}
```

### Response Payload
```json
{
    "ContextId": "1",
    "EngagementArn": "arn:aws:partnercentral:us-east-1::catalog/AWS/engagement/eng-xhyvbgfeme4xh4",
    "EngagementId": "eng-xhyvbgfeme4xh4",
    "EngagementLastModifiedAt": "2025-11-03T03:15:40.726520097Z"
}
```

---

## 5_start_opportunity_from_engagement_task.py

### Purpose
Initiates the conversion process from engagement lead to opportunity by starting an asynchronous task.

**Actor: Partner** - This action is performed by the partner to convert a qualified lead into an opportunity.

### API Action
- `start_opportunity_from_engagement_task`

### Request Payload
```json
{
    "Catalog": "AWS",
    "ClientToken": "c0a22980-53d3-40bc-a228-751a096d5b6c",
    "ContextIdentifier": "1",
    "Identifier": "eng-xhyvbgfeme4xh4",
    "Tags": [
        {
            "Key": "Source",
            "Value": "LeadConversion"
        }
    ]
}
```

### Response Payload
```json
{
    "TaskId": "task-twmewxh11jjbn",
    "TaskArn": "arn:aws:partnercentral:us-east-1::catalog/AWS/opportunity-from-engagement-task/task-twmewxh11jjbn",
    "StartTime": "2025-11-03T03:16:04.741000+00:00",
    "TaskStatus": "COMPLETE",
    "OpportunityId": "O14890686",
    "ResourceSnapshotJobId": "job-j4b4yy3zu3sam",
    "EngagementId": "eng-xhyvbgfeme4xh4",
    "ContextId": "2"
}
```

---

## 6_list_solutions.py

### Purpose
Retrieves available solutions that can be associated with opportunities.

**Actor: Partner** - This action is performed by the partner to discover available solutions for opportunity association.

### API Action
- `list_solutions`

### Request Payload
```json
{
    "Catalog": "AWS",
    "Status": ["Active"],
    "MaxResults": 20
}
```

### Response Payload
```json
{
    "SolutionSummaries": [
        {
            "Catalog": "AWS",
            "Id": "S-0052021",
            "Arn": "arn:aws:partnercentral:us-east-1:[PARTNER_ACCOUNT_ID]:catalog/AWS/solution/S-0052021",
            "Name": "TestSolution11",
            "Status": "Active",
            "Category": "Hardware Product",
            "CreatedDate": "2024-03-01T19:09:39+00:00"
        },
        {
            "Catalog": "AWS",
            "Id": "S-0052019",
            "Arn": "arn:aws:partnercentral:us-east-1:[PARTNER_ACCOUNT_ID]:catalog/AWS/solution/S-0052019",
            "Name": "TestSolution19",
            "Status": "Active",
            "Category": "Software Product",
            "CreatedDate": "2024-03-01T19:09:39+00:00"
        },
        {
            "Catalog": "AWS",
            "Id": "S-0052018",
            "Arn": "arn:aws:partnercentral:us-east-1:[PARTNER_ACCOUNT_ID]:catalog/AWS/solution/S-0052018",
            "Name": "TestSolution13",
            "Status": "Active",
            "Category": "Software Product",
            "CreatedDate": "2024-03-01T19:09:39+00:00"
        }
    ],
    "NextToken": "AAMA-EFRSURBSGdsbE54dERGMStMUnJRVVYvZFJBanFra0xRTlRXZFJUZHpaZDdRLy9LUDl3R09aSmJKKzhuWlJaYzNUQldoc05sNkFBQUFmakI4QmdrcWhraUc5dzBCQndhZ2J6QnRBZ0VBTUdnR0NTcUdTSWIzRFFFSEFUQWVCZ2xnaGtnQlpRTUVBUzR3RVFRTXJNYklYWnZLYTBvcDl0VllBZ0VRZ0R1Sndza3ZGM0tlV0tHS0Nsd3hXT0lPRHMxMFBuSjk5bFRxY3FKN1JIYjhnb0NPdnI2Q3oralRpWmx5aXZrR3hOam82dHA3OVFtZ0NRNGVJZz09ylO71M4o8m6_uoFrGF6eMCO5tK1a3TA8k_fTpkNIG5r_u5Cw4cdqNzHejXwIib9H5lo9AIh_MEgkf49HVibcn7izogywAloGXrFyYzT7Acv9Vs6y1RhMpdbtrrm_"
}
```

---

## 7_associate_opportunity.py

### Purpose
Associates a solution with the created opportunity to establish the technical relationship.

**Actor: Partner** - This action is performed by the partner to link their solutions with the opportunity.

### API Action
- `associate_opportunity`

### Request Payload
```json
{
    "Catalog": "AWS",
    "OpportunityIdentifier": "O14890686",
    "RelatedEntityType": "Solutions",
    "RelatedEntityIdentifier": "S-0052021"
}
```

### Response Payload
```json
{
    "ResponseMetadata": {
        "RequestId": "2ea4e4ee-27fc-4834-8438-14941b9f5d80",
        "HTTPStatusCode": 200,
        "HTTPHeaders": {
            "date": "Mon, 03 Nov 2025 03:16:41 GMT",
            "content-type": "application/x-amz-json-1.0",
            "content-length": "0",
            "connection": "keep-alive",
            "x-amzn-requestid": "2ea4e4ee-27fc-4834-8438-14941b9f5d80"
        },
        "RetryAttempts": 0
    }
}
```

---

## 8_get_opportunity.py

### Purpose
Retrieves complete opportunity details and prepares data structure for updates.

**Actor: Partner** - This action is performed by the partner to get current opportunity information before making updates.

### API Action
- `get_opportunity`

### Request Payload
```json
{
    "Catalog": "AWS",
    "Identifier": "O14890686"
}
```

### Response Payload
```json
{
    "Catalog": "AWS",
    "NationalSecurity": "No",
    "Customer": {
        "Account": {
            "Industry": "Software and Internet",
            "CompanyName": "Acme Corp",
            "WebsiteUrl": "https://acmecorp-updated.example.com",
            "Address": {
                "CountryCode": "US"
            }
        },
        "Contacts": []
    },
    "Project": {
        "ExpectedCustomerSpend": [],
        "Title": "Converted from Lead",
        "CustomerBusinessProblem": "Need to modernize legacy database infrastructure for better scalability"
    },
    "OpportunityType": "Net New Business",
    "Marketing": {
        "Source": "None"
    },
    "Id": "O14890686",
    "Arn": "arn:aws:partnercentral:us-east-1:[PARTNER_ACCOUNT_ID]:catalog/AWS/opportunity/O14890686",
    "LastModifiedDate": "2025-11-03T03:16:07.038000+00:00",
    "CreatedDate": "2025-11-03T03:16:07+00:00",
    "RelatedEntityIdentifiers": {
        "AwsMarketplaceOffers": [],
        "Solutions": [
            "S-0052021"
        ],
        "AwsProducts": []
    },
    "LifeCycle": {
        "Stage": "Prospect",
        "TargetCloseDate": "2026-02-01",
        "ReviewStatus": "Pending Submission"
    },
    "OpportunityTeam": []
}
```

---

## 9_update_opportunity.py

### Purpose
Updates the opportunity with complete information by merging current data with template fields from createOpportunity.json.

**Actor: Partner** - This action is performed by the partner to enrich the opportunity with detailed business information.

### API Action
- `get_opportunity` (to retrieve current data)
- `update_opportunity` (to update with merged data)

### Workflow Steps
1. **Get current opportunity data** using `get_opportunity`
2. **Transform data** by changing `Id` to `Identifier` and removing read-only fields
3. **Merge with template** by adding missing fields from `createOpportunity.json`
4. **Update opportunity** using the merged payload

### Request Payload (Update)
```json
{
    "Catalog": "AWS",
    "NationalSecurity": "No",
    "Customer": {
        "Account": {
            "Industry": "Software and Internet",
            "CompanyName": "Acme Corp",
            "WebsiteUrl": "https://acmecorp-updated.example.com",
            "Address": {
                "CountryCode": "US",
                "PostalCode": "10001",
                "StateOrRegion": "New York"
            },
            "AwsAccountId": "111111111111",
            "Duns": "111100111"
        },
        "Contacts": [
            {
                "BusinessTitle": "Executive",
                "Email": "testnamelast09@test.com",
                "FirstName": "TestContact011",
                "LastName": "MLastName001",
                "Phone": "+14444444444"
            }
        ]
    },
    "Project": {
        "ExpectedCustomerSpend": [
            {
                "Amount": "12500",
                "CurrencyCode": "USD",
                "Frequency": "Monthly",
                "TargetCompany": "AWS"
            }
        ],
        "Title": "Converted from Lead",
        "CustomerBusinessProblem": "Need to modernize legacy database infrastructure for better scalability",
        "CompetitorName": "No Competition",
        "CustomerUseCase": "Security & Compliance",
        "DeliveryModels": ["SaaS or PaaS"],
        "SalesActivities": ["Conducted POC / Demo"]
    },
    "OpportunityType": "Net New Business",
    "Marketing": {
        "AwsFundingUsed": "Yes",
        "CampaignName": "TestCampaignName01",
        "Channels": ["Content Syndication"],
        "Source": "Marketing Activity",
        "UseCases": ["Analytics"]
    },
    "LastModifiedDate": "2025-11-03T03:16:07.038000+00:00",
    "LifeCycle": {
        "Stage": "Prospect",
        "TargetCloseDate": "2026-02-01",
        "ReviewStatus": "Pending Submission",
        "NextSteps": "Next steps on the opportunity. TEST is used to communicate to AWS the next action required, please update."
    },
    "Identifier": "O14890686",
    "PrimaryNeedsFromAws": ["Co-Sell - Architectural Validation"],
    "SoftwareRevenue": {
        "DeliveryModel": "Pay-as-you-go",
        "EffectiveDate": "2023-10-31",
        "ExpirationDate": "2024-03-31",
        "Value": {
            "Amount": "10000.0",
            "CurrencyCode": "USD"
        }
    }
}
```

### Response Payload
```json
{
    "Id": "O14890686",
    "LastModifiedDate": "2025-11-03T03:17:09.792000+00:00"
}
```

---

## 10_start_engagement_from_opportunity_task.py

### Purpose
Submits the opportunity to AWS for review by creating an engagement from the opportunity.

**Actor: Partner** - This action is performed by the partner to submit their completed opportunity to AWS for review and potential collaboration.

### API Action
- `start_engagement_from_opportunity_task`

### Request Payload
```json
{
    "AwsSubmission": {
        "InvolvementType": "Co-Sell",
        "Visibility": "Full"
    },
    "Catalog": "AWS",
    "Identifier": "O14890686",
    "ClientToken": "3c6c453e-c4cc-41f5-98ec-56f104e84b9f"
}
```

### Response Payload
```json
{
    "TaskId": "task-ixdseleb24mt5",
    "TaskArn": "arn:aws:partnercentral:us-east-1::catalog/AWS/engagement-from-opportunity-task/task-ixdseleb24mt5",
    "StartTime": "2025-11-03T03:17:26.019000+00:00",
    "TaskStatus": "COMPLETE",
    "OpportunityId": "O14890686",
    "ResourceSnapshotJobId": "job-eqqax1555wdod",
    "EngagementId": "eng-xhyvbgfeme4xh4"
}
```

---

## Workflow Summary

This partner-side workflow demonstrates the complete process from receiving an AWS engagement invitation for a lead to submitting an opportunity for review:

**Prerequisites (Provided by AWS):**
- Engagement invitation for lead created by AWS
- Engagement with lead information created by AWS

**Partner Workflow Steps:**

1. **Lead Invitation Retrieval**: Retrieving engagement invitation for lead details from AWS
2. **Lead Invitation Acceptance**: Accepting the engagement invitation to join the lead collaboration
3. **Engagement Review**: Retrieving complete engagement and lead information
4. **Lead Qualification**: Adding detailed customer qualification and interaction data
5. **Lead Conversion**: Converting qualified leads to opportunities
6. **Solution Discovery**: Listing available solutions for association
7. **Solution Association**: Linking technical solutions to business opportunities
8. **Opportunity Review**: Retrieving current opportunity details
9. **Opportunity Enhancement**: Enriching opportunities with complete business data
10. **Opportunity Submission**: Submitting completed opportunities to AWS for review

### Key Features

- **AWS-Provided Starting Point**: Workflow begins with engagement invitation for lead and engagement already created by AWS
- **Automated ID Management**: All scripts use shared environment variables for seamless workflow execution
- **Template-Based Updates**: Opportunity updates use template merging for consistent data structure
- **Error Handling**: Comprehensive error handling with fallback to default values
- **Data Transformation**: Proper transformation between API response and request formats
- **Validation**: Business rule validation and conflict resolution

### Usage

Each script can be run independently with command-line arguments or as part of the complete workflow using shared environment variables stored in `shared_env.json`.

Example workflow execution:
```bash
# Partner account for opportunity management
python 1_get_engagement_invitation.py
python 2_accept_engagement_invitation.py
python 3_getEngagement.py
python 4_update_engagement_context.py
python 5_start_opportunity_from_engagement_task.py
python 6_list_solutions.py
python 7_associate_opportunity.py
python 8_get_opportunity.py
python 9_update_opportunity.py
python 10_start_engagement_from_opportunity_task.py
```

This workflow provides a complete demonstration of the partner-side AWS Partner Central Selling API capabilities, starting from an AWS-provided engagement invitation through to opportunity submission, with real-world request and response examples.