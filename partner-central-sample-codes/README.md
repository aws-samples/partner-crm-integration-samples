# AWS Partner Central API for Selling Sample Codes Library

AWS Partner Central API for Selling enables partners to create, update, view, and assign opportunities, as well as accept invitations to engage on AWS referrals. Additionally, partners can retrieve a list of their solutions on AWS Partner Central, and associate specific solutions, AWS products, or AWS Marketplace offers with opportunities as needed. More information about Partner Central API for Selling is available through [AWS Partner Central API reference guide](https://docs.aws.amazon.com/partner-central/latest/APIReference/aws-partner-central-api-reference-guide.html). 

This repository hosts a variety of useful sample codes to help partners automate their workflows with the
AWS Partner Central API. Sample codes found in this repository
are written in [Python 3.x](./python_preview), [Java](./java_preview)，[Go](./go_preview) and [C#](./dotnet_preview).

## Getting started

- You must have an AWS Marketplace [seller account](https://docs.aws.amazon.com/marketplace/latest/userguide/user-guide-for-sellers.html)
- You need an [AWS Identity and Access Management (IAM) role and/or an IAM user](https://docs.aws.amazon.com/partner-central/latest/selling-api/access-control.html#allowing-actions-with-aws-managed-policies) to make API calls. Associate the [AWSPartnerCentralOpportunityManagement](https://docs.aws.amazon.com/partner-central/latest/APIReference/access-control.html) managed policy to gain access to the APIs.
- Your AWS Marketplace Seller account (where you created the IAM role/user) must be [linked](https://docs.aws.amazon.com/partner-central/latest/getting-started/account-linking.html) to your AWS Partner Central account.

### Clone the Git repository to your local workstation:
```
git clone https://github.com/aws-samples/partner-crm-integration-samples.git

cd partner-crm-integration-samples/partner-central-sample-codes
```

Instructions on setting up your environment to run the sample codes can be found in each of the programming language folder of this repository.

## Partner Central APIs Sample Code


| Id       | Use case                                                                                                                                                                                                                                                                                             |Java    |Python   |Go   |C#    |
|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|----------|----------|----------|
| PC-API-01 | Partner Originated (PO) opp submission(Start Engagement From Opportunity Task for AO Originated Opportunity)                                                                                                                                   |[Link](./java_preview/src/main/java/org/example/StartEngagementFromOpportunityTask.java) |[Link](./python_preview/src/start_engagement_from_opportunity_task.py)|
| PC-API-02 | Update Partner Originated opportunity when LifeCycle.ReviewStatus is not Submitted or In-Review                                                                                                                                         |[Link](./java_preview/src/main/java/org/example/UpdateOpportunity.java) |[Link](./python_preview/src/update_opportunity/update_opportunity.py)|
| PC-API -03  | Partner Originated opportunity action required update                                                                                                                                                                  |[Link](./java_preview/src/main/java/org/example/UpdatePartnerOriginatedActionRequiredOpportunity.java) |[Link](./python_preview/src/update_opportunity/update_partner_originated_actionRequired_opportunity.py)|
| PC-API -04 | Start Engagement By Accepting InvitationTask for AWS Originated(AO) opportunity                                                                                                                         |[Link](./java_preview/src/main/java/org/example/StartEngagementByAcceptingInvitationTask.java) |[Link](./python_preview/src/start_engagement_by_accepting_invitation_task.py)|
| PC-API -05| AWS Originated(AO) rejection                                                                                                                                   |[Link](./java_preview/src/main/java/org/example/RejectEngagementInvitation.java) |[Link](./python_preview/src/reject_opportunity_engagement_invitation.py)|
| PC-API -08  | Get updated Opportunity                                                                              |[Link](./java_preview/src/main/java/org/example/GetOpportunity.java) |[Link](./python_preview/src/get_opportunity.py)|[Link](./go_preview/getOpportunity/get_opportunity.go)|[Link](./dotnet_preview/src/GetOpportunity)|
| PC-API -09  | Update Opportunity after launch                                                                                           |[Link](./java_preview/src/main/java/org/example/UpdateOpportunityAfterLaunch.java) |[Link](./python_preview/src/update_opportunity/update_opportunity_afterLaunch.py)|
| PC-API -10  | Getting list of solutions                                                                            |[Link](./java_preview/src/main/java/org/example/ListSolutions.java) |[Link](./python_preview/src/list_solutions.py)|
| PC-API -11/12/13  | Associating a product/solution/offer                                                                           |[Link](./java_preview/src/main/java/org/example/AssociateOpportunity.java) |[Link](./python_preview/src/associate_opportunity.py)|
| PC-API -14/15/16  | Removing a Solution                                                                   |[Link](./java_preview/src/main/java/org/example/DisassociateOpportunity.java) |[Link](./python_preview/src/disassociate_opportunity.py)|
| PC-API -17  | Replacing a solution                                                                                           |[Link](./java_preview/src/main/java/org/example/ReplaceSolution.java) |[Link](./python_preview/src/replace_solution.py)|
| PC-API -18  | Getting list of Opportunities                                                                                                                             |[Link](./java_preview/src/main/java/org/example/ListOpportunititesNoPaging.java) |[Link](./python_preview/src/list_opportunities_noPaging.py)|[Link](./go_preview/listOpportunities/list_opportunities.go)|[Link](./dotnet_preview/src/ListOpportunities/)|
| PC-API -19  | Bulk Creating Opportunities                                                                                                                                    |[Link](./java_preview/src/main/java/org/example/BulkCreateOpportunity.java) |[Link](./python_preview/src/bulk_create_opportunities/)|
| PC-API -20  | Bulk Updating Opportunities                                                                                                                    |[Link](./java_preview/src/main/java/org/example/BulkUpdateOpportunity.java) |[Link](./python_preview/src/bulk_update_opportunities/)|
| PC-API-21  | Getting list of Engagement Invitations Opportunities                                                                                                                                                                                |[Link](./java_preview/src/main/java/org/example/ListEngagementInvitations.java) |[Link](./python_preview/src/list_engagement_invitations.py)|
| PC-API-25  | Retrieves a summary of an AWS Opportunity.                                                                                                                                                                                                     |[Link](./java_preview/src/main/java/org/example/GetAwsOpportunitySummary.java) |[Link](./python_preview/src/get_aws_opportunity_summary.py)|
| PC-API-26/27/28/29 | Create Opportunity Created EventBridge rule and target is set to Lambda function                                                                                                                                                                                                   |[Link](./java_preview/src/main/java/org/example/OpportunityEventHandling.java) |[Link](./python_preview/src/opportunity_event_handling_create_rule_lambda_target.py)|                                                                                                



## License

This library is licensed under the MIT-0 License. See the [LICENSE file](https://github.com/aws-samples/aws-marketplace-reference-code/blob/main/LICENSE)

