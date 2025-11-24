# Sample Workflow Output

Complete end-to-end workflow execution with all commands, requests, and responses.

**Execution Date:** November 10, 2025  
**Catalog:** Sandbox  
**Status:** ✅ All Steps Completed Successfully

---

## Step 1: Create SaaS Product

### Command
```bash
source ../python_preview/pcapi/bin/activate
PYTHONPATH=. python 1_publishSaasProcuct/start_changeset.py
```

### Configuration Used
```
BUYER_IDS: ['222222222222']
PRODUCT_ID: prod-lnjsznntonxi2
CATALOG: Sandbox
EXPIRY_DATE: 2025-11-17
CONTRACT_DURATION_MONTHS: P12M
CONTRACT_DURATION_DAYS: P365D
CHARGE_DATE_1: 2025-11-17
CHARGE_DATE_2: 2025-11-24
```

### Response
```json
{
  "ChangeSetId": "dtkkxeq7k0d40blrck9k27wm2",
  "ChangeSetArn": "arn:aws:aws-marketplace:us-east-1:222222222222:AWSMarketplace/ChangeSet/dtkkxeq7k0d40blrck9k27wm2"
}
```

### Monitor Changeset

**Command:**
```bash
python 1_publishSaasProcuct/describe_changeset.py dtkkxeq7k0d40blrck9k27wm2
```

**Status Progression:**
- PREPARING → APPLYING → SUCCEEDED

**Final Status:**
```
ChangeSet ID: dtkkxeq7k0d40blrck9k27wm2
Status: SUCCEEDED
Start Time: 2025-11-10T20:29:34Z
End Time: 2025-11-10T20:33:47Z
```

**Product Created:**
- Product ID: `prod-lnjsznntonxi2`
- Product ARN: `arn:aws:aws-marketplace:us-east-1:222222222222:AWSMarketplace/SaaSProduct/prod-lnjsznntonxi2`

**Changes Applied:**
1. CreateProduct (SaaSProduct@1.0)
2. UpdateInformation
3. AddDeliveryOptions
4. AddDimensions (3 entitled + 3 metered)
5. UpdateTargeting
6. ReleaseProduct
7. CreateOffer
8. UpdatePricingTerms (ConfigurableUpfrontPricingTerm + UsageBasedPricingTerm)
9. UpdateLegalTerms
10. UpdateSupportTerms
11. UpdateInformation
12. UpdateRenewalTerms
13. ReleaseOffer

---

## Step 2: Create Private Offer

### Command
```bash
PYTHONPATH=. python 2_createPrivateOffer/start_changeset.py
```

### Configuration Used
```
Product ID: prod-lnjsznntonxi2
Buyer IDs: ['222222222222']
Expiry Date: 2025-11-17
Contract Duration: P12M
```

### Response
```json
{
  "ChangeSetId": "9f4s4v7k7nfiz9p5pd6g3662y",
  "ChangeSetArn": "arn:aws:aws-marketplace:us-east-1:222222222222:AWSMarketplace/ChangeSet/9f4s4v7k7nfiz9p5pd6g3662y"
}
```

### Monitor Changeset

**Command:**
```bash
python 2_createPrivateOffer/describe_changeset.py 9f4s4v7k7nfiz9p5pd6g3662y
```

**Status Progression:**
- PREPARING → APPLYING → SUCCEEDED

**Final Status:**
```
ChangeSet ID: 9f4s4v7k7nfiz9p5pd6g3662y
Status: SUCCEEDED
Start Time: 2025-11-10T20:46:24Z
End Time: 2025-11-10T20:50:02Z
```

**Offer Created:**
- Offer ID: `offer-e7ovpstzsdrz6`
- Offer ARN: `arn:aws:aws-marketplace:us-east-1:222222222222:AWSMarketplace/Offer/offer-e7ovpstzsdrz6`

**Changes Applied:**
1. CreateOffer
2. UpdateAvailability (Expiry: 2025-11-17)
3. UpdateTargeting (Buyer: 222222222222)
4. UpdatePricingTerms (Contract with Consumption)
5. UpdateLegalTerms (StandardEula 2022-07-14)
6. UpdatePaymentScheduleTerms (2 payments)
7. UpdateValidityTerms (12 months)
8. UpdateInformation
9. ReleaseOffer

### Get Offer Details

**Command:**
```bash
python 2_createPrivateOffer/describe_offer.py offer-e7ovpstzsdrz6
```

**Response:**
```json
{
  "EntityType": "Offer@1.0",
  "EntityIdentifier": "offer-e7ovpstzsdrz6@1",
  "EntityArn": "arn:aws:aws-marketplace:us-east-1:222222222222:AWSMarketplace/Offer/offer-e7ovpstzsdrz6",
  "LastModifiedDate": "2025-11-10T20:46:58Z",
  "Details": {
    "Id": "offer-e7ovpstzsdrz6",
    "Name": "Demo Private Offer",
    "Description": "Demo Private Offer Description",
    "ProductId": "prod-lnjsznntonxi2",
    "State": "Released"
  }
}
```

---

## Step 3: Create and Submit Opportunity

### Step 3.1: Create Opportunity

**Command:**
```bash
PYTHONPATH=. python 3_createOpportunity/1_create_opportunity.py
```

**Request Details:**
```
Generated ClientToken: 93158719-37c3-43e5-9c25-aa805e2dde9b
Generated Opportunity Title: New Business Deal - 3062
Catalog: Sandbox
```

**Response:**
```json
{
  "Id": "O10708574",
  "LastModifiedDate": "2025-11-10T20:51:45.972000+00:00",
  "ResponseMetadata": {
    "RequestId": "9830f389-423b-494b-b28f-9a1d1a013ae4",
    "HTTPStatusCode": 200
  }
}
```

**Opportunity Created:**
- Opportunity ID: `O10708574`
- Title: "New Business Deal - 3062"

### Step 3.2: List Solutions

**Command:**
```bash
PYTHONPATH=. python 3_createOpportunity/2_list_solutions.py
```

**Response:**
```json
{
  "SolutionSummaries": [
    {
      "Catalog": "Sandbox",
      "Category": "Compute",
      "CreatedDate": "2024-10-25T18:00:00Z",
      "Id": "S-0059717",
      "Name": "Sample Solution",
      "Status": "Active"
    }
  ],
  "ResponseMetadata": {
    "RequestId": "9b630c02-a08d-4c3f-a7ab-d404fbb6bfc9",
    "HTTPStatusCode": 200
  }
}
```

**Solution Selected:**
- Solution ID: `S-0059717`
- Name: "Sample Solution"
- Category: Compute

### Step 3.3: Associate Opportunity

**Command:**
```bash
PYTHONPATH=. python 3_createOpportunity/3_associate_opportunity.py
```

**Request:**
```
Opportunity ID: O10708574
Solution ID: S-0059717
Catalog: Sandbox
```

**Response:**
```json
{
  "ResponseMetadata": {
    "RequestId": "85ebc9d3-f58b-4e19-8295-612234942030",
    "HTTPStatusCode": 200
  }
}
```

**Status:** ✅ Association Successful

### Step 3.4: Start Engagement from Opportunity

**Command:**
```bash
PYTHONPATH=. python 3_createOpportunity/4_start_engagement_from_opportunity_task.py
```

**Request:**
```
Opportunity ID: O10708574
InvolvementType: Co-Sell
Visibility: Full
Catalog: Sandbox
```

**Response:**
```json
{
  "EngagementId": "eng-ki9hqgr5h78k9r",
  "EngagementInvitationId": "engi-htwrooj2wi8az",
  "OpportunityId": "O10708574",
  "ResourceSnapshotJobId": "job-8gxfx5cpbnqyz",
  "StartTime": "2025-11-10T20:52:25.660000+00:00",
  "TaskArn": "arn:aws:partnercentral:us-east-1::catalog/Sandbox/engagement-from-opportunity-task/task-4xlyalfoyn1ek",
  "TaskId": "task-4xlyalfoyn1ek",
  "TaskStatus": "COMPLETE",
  "ResponseMetadata": {
    "RequestId": "57b32c2d-7921-4584-aff9-b0f71e64b4dc",
    "HTTPStatusCode": 200
  }
}
```

**Engagement Created:**
- Engagement ID: `eng-ki9hqgr5h78k9r`
- Task Status: COMPLETE
- Task ID: `task-4xlyalfoyn1ek`

### Step 3.5: Simulate AWS Approval

**Command:**
```bash
PYTHONPATH=. python 3_createOpportunity/aws_simulate_approval_update_opportunity.py
```

**Request:**
```
Opportunity ID: O10708574
Action: Update LifeCycle.ReviewStatus to "Approved"
```

**Response:**
```json
{
  "Identifier": "O10708574",
  "LifeCycle": {
    "ReviewStatus": "Approved",
    "Stage": "Prospect",
    "TargetCloseDate": "2029-10-11"
  },
  "Project": {
    "Title": "New Business Deal - 3062"
  }
}
```

**Status:** ✅ Opportunity Approved

---

## Step 4: Associate Private Offer to Opportunity

### Command
```bash
PYTHONPATH=. python 4_associatePrivateOfferToOpportunity/associate_opportunity.py
```

### Request
```
Opportunity ID: O10708574
Offer ID: offer-e7ovpstzsdrz6
Catalog: Sandbox
```

### Response
```json
{
  "ResponseMetadata": {
    "RequestId": "a14eace7-adf1-41b4-a206-da44c52b3872",
    "HTTPStatusCode": 200
  }
}
```

**Status:** ✅ Offer Associated with Opportunity

---

## Step 5: Search for Agreement (Buyer Accepts Offer)

### Command
```bash
PYTHONPATH=. python 5_buyerAcceptPrivateOffer/search_agreements_by_offer_id.py offer-e7ovpstzsdrz6
```

### Request
```
Offer ID: offer-e7ovpstzsdrz6
```

### Response
```json
[
  {
    "acceptanceTime": "2025-11-10T12:54:43.232000-08:00",
    "acceptor": {
      "accountId": "222222222222"
    },
    "agreementId": "agmt-29sxr5hn90tfw6gjrmhahm3p4",
    "agreementType": "PurchaseAgreement",
    "endTime": "2026-11-10T12:54:43.232000-08:00",
    "proposalSummary": {
      "offerId": "offer-e7ovpstzsdrz6",
      "resources": [
        {
          "id": "prod-lnjsznntonxi2",
          "type": "SaaSProduct"
        }
      ]
    },
    "proposer": {
      "accountId": "222222222222"
    },
    "startTime": "2025-11-10T12:54:43.232000-08:00",
    "status": "ACTIVE"
  }
]
```

**Agreement Details:**
- Agreement ID: `agmt-29sxr5hn90tfw6gjrmhahm3p4`
- Status: **ACTIVE**
- Type: PurchaseAgreement
- Start Time: 2025-11-10
- End Time: 2026-11-10
- Acceptor: 222222222222

**Status:** ✅ Agreement Active

---

## Step 6: Update Opportunity to Committed

### Command
```bash
PYTHONPATH=. python 6_updateOpportunity/update_opportunity_to_committed.py
```

### Request
```
Opportunity ID: O10708574
Action: Update LifeCycle.Stage to "Closed Won"
```

### Response
```json
{
  "Identifier": "O10708574",
  "LifeCycle": {
    "ReviewStatus": "Approved",
    "Stage": "Closed Won",
    "TargetCloseDate": "2029-10-11"
  },
  "Project": {
    "Title": "New Business Deal - 3062",
    "ExpectedCustomerSpend": [
      {
        "Amount": "12500",
        "CurrencyCode": "USD",
        "Frequency": "Monthly",
        "TargetCompany": "AWS"
      }
    ]
  },
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

**Status:** ✅ Opportunity Committed (Closed Won)

---

## Workflow Summary

### Final State

| Resource | ID | Status |
|----------|-----|--------|
| Product | prod-lnjsznntonxi2 | Released |
| Public Offer | (created with product) | Released |
| Private Offer | offer-e7ovpstzsdrz6 | Released |
| Opportunity | O10708574 | Closed Won |
| Solution | S-0059717 | Associated |
| Engagement | eng-ki9hqgr5h78k9r | Complete |
| Agreement | agmt-29sxr5hn90tfw6gjrmhahm3p4 | Active |

### Execution Timeline

1. **Step 1** (Create Product): ~4 minutes (PREPARING → APPLYING → SUCCEEDED)
2. **Step 2** (Create Offer): ~3.5 minutes (PREPARING → APPLYING → SUCCEEDED)
3. **Step 3** (Create Opportunity): ~1 minute (5 sub-steps)
4. **Step 4** (Associate Offer): <1 second
5. **Step 5** (Search Agreement): <1 second
6. **Step 6** (Update to Committed): <1 second

**Total Execution Time:** ~9 minutes

### Configuration Files Used

**config.json:**
```json
{
  "catalog": "Sandbox",
  "contract_duration_months": "P12M",
  "contract_duration_days": "P365D",
  "custom_eula_url": "https://s3.amazonaws.com/aws-mp-standard-contracts/Standard-Contact-for-AWS-Marketplace-2022-07-14.pdf",
  "offer_name": "Demo Private Offer",
  "offer_description": "Demo Private Offer Description"
}
```

**buyer_ids.txt:**
```
222222222222
```

**shared_env.json (Final State):**
```json
{
  "PRODUCT_ID": "prod-lnjsznntonxi2",
  "PRODUCT_CHANGESET_ID": "dtkkxeq7k0d40blrck9k27wm2",
  "OFFER_ID": "offer-e7ovpstzsdrz6",
  "OFFER_ARN": "arn:aws:aws-marketplace:us-east-1:222222222222:AWSMarketplace/Offer/offer-e7ovpstzsdrz6",
  "OFFER_CHANGESET_ID": "9f4s4v7k7nfiz9p5pd6g3662y",
  "OPPORTUNITY_ID": "O10708574",
  "SOLUTION_ID": "S-0059717"
}
```

---

## Key Learnings

### Required Configuration
1. Valid AWS account IDs in `buyer_ids.txt`
2. Product ID must be set in `shared_env.json` or passed via command line
3. Catalog must be "Sandbox" for testing

### Pricing Model
- **Contract with Consumption**: Combines upfront contract pricing with usage-based metering
- **ConfigurableUpfrontPricingTerm**: For entitled dimensions
- **UsageBasedPricingTerm**: For metered dimensions (required)

### Workflow Dependencies
1. Product must be SUCCEEDED before creating private offer
2. Private offer must be SUCCEEDED before creating opportunity
3. Opportunity must be created before association
4. Agreement becomes ACTIVE after buyer acceptance (simulated)

### Common Issues Fixed
1. Missing `UsageBasedPricingTerm` in product changeset
2. Invalid buyer account IDs (must be real AWS accounts)
3. Interactive prompts blocking automation (fixed with `sys.stdin.isatty()`)
4. Variable name mismatch (`BUYER_ID` vs `BUYER_IDS`)

---

## Automated Workflow Execution

To run the complete workflow automatically:

```bash
source ../python_preview/pcapi/bin/activate
python test_workflow.py
```

The automated workflow will:
- Execute all 6 steps sequentially
- Poll changeset status every 10 seconds (max 20 minutes)
- Log all actions to `workflow.TIMESTAMP.log`
- Save progress to `shared_env.json`
- Stop on first failure with detailed error logs

**Log File:** `workflow.YYYYMMDD_HHMMSS.log`

---

## Success Criteria

✅ All HTTP responses returned 200 status codes  
✅ All changesets reached SUCCEEDED status  
✅ Product and offer were released  
✅ Opportunity was created and submitted  
✅ Engagement task completed successfully  
✅ Agreement status is ACTIVE  
✅ Opportunity stage updated to "Closed Won"  

**Result:** Complete end-to-end workflow executed successfully!
