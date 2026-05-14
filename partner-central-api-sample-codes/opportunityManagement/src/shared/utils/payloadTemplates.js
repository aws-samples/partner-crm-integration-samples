// Shared payload templates for both applications
// This file contains default JSON payloads that can be used across projects

// Generate UUID without external dependency
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Generate random title for opportunities
export const generateRandomOpportunityTitle = () => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `New Business Deal ${randomNum}`;
};

// Generate random title for products
export const generateRandomProductTitle = () => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `Sample Product ${randomNum}`;
};

// Calculate default dates
export const getDefaultAvailabilityEndDate = () => {
  const today = new Date();
  const sevenDaysFromToday = new Date(today);
  sevenDaysFromToday.setDate(today.getDate() + 7);
  return sevenDaysFromToday.toISOString().split('T')[0];
};

export const getDefaultTargetCloseDate = () => {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 90); // 90 days from today
  return futureDate.toISOString().split('T')[0];
};

export const calculateChargeDates = () => {
  const today = new Date();
  
  // ChargeDate 1: 7 days from today
  const firstChargeDate = new Date(today);
  firstChargeDate.setDate(today.getDate() + 7);
  const firstChargeDateStr = firstChargeDate.toISOString().split('T')[0];
  
  // ChargeDate 2: 14 days from today
  const secondChargeDate = new Date(today);
  secondChargeDate.setDate(today.getDate() + 14);
  const secondChargeDateStr = secondChargeDate.toISOString().split('T')[0];

  return { firstChargeDateStr, secondChargeDateStr };
};

export const calculateAgreementDates = () => {
  const today = new Date();
  
  // AGREEMENT_START_DATE: 8 days from today
  const agreementStartDate = new Date(today);
  agreementStartDate.setDate(today.getDate() + 8);
  
  // AGREEMENT_END_DATE: 38 days from today
  const agreementEndDate = new Date(today);
  agreementEndDate.setDate(today.getDate() + 38);
  
  return {
    agreementStartDate: agreementStartDate.toISOString().split('T')[0],
    agreementEndDate: agreementEndDate.toISOString().split('T')[0]
  };
};

// Default payload templates
export const createOpportunityPayload = () => ({
  "ClientToken": generateUUID(),
  "Catalog": "Sandbox",
  "Origin": "Partner Referral",
  "Customer": {
    "Account": {
      "Address": {
        "City": null,
        "CountryCode": "US",
        "PostalCode": "10001",
        "StateOrRegion": "New York",
        "StreetAddress": null
      },
      "AwsAccountId": "111111111112",
      "CompanyName": "ValidAWSCreate",
      "Duns": "111100111",
      "Industry": "Financial Services",
      "OtherIndustry": null,
      "WebsiteUrl": "veracode.com"
    },
    "Contacts": [
      {
        "BusinessTitle": "Executive",
        "Email": "test@test.com",
        "FirstName": "TestContact011",
        "LastName": "MLastName001",
        "Phone": "+14444444444"
      }
    ]
  },
  "LifeCycle": {
    "ClosedLostReason": null,
    "NextSteps": "Next steps on the opportunity. TEST is used to communicate to AWS the next action required, please update.",
    "NextStepsHistory": null,
    "ReviewComments": null,
    "ReviewStatus": "Pending Submission",
    "ReviewStatusReason": null,
    "Stage": "Prospect",
    "TargetCloseDate": "2029-10-05"
  },
  "Marketing": {
    "AwsFundingUsed": "Yes",
    "CampaignName": "TestCampaignName01",
    "Channels": ["Content Syndication"],
    "Source": "Marketing Activity",
    "UseCases": ["Analytics"]
  },
  "NationalSecurity": "No",
  "OpportunityTeam": [
    {
      "BusinessTitle": "PartnerAccountManager",
      "Email": "test@test.com",
      "FirstName": "TestContact001",
      "LastName": "CLastName001",
      "Phone": "+14444444444"
    }
  ],
  "OpportunityType": "Net New Business",
  "PartnerOpportunityIdentifier": null,
  "PrimaryNeedsFromAws": ["Co-Sell - Architectural Validation"],
  "Project": {
    "AdditionalComments": null,
    "ApnPrograms": [],
    "CompetitorName": "On-Prem",
    "CustomerBusinessProblem": "A very important problem goes here ValidAWSCreate",
    "CustomerUseCase": "Security & Compliance",
    "DeliveryModels": ["SaaS or PaaS"],
    "ExpectedCustomerSpend": [
      {
        "Amount": "12900",
        "CurrencyCode": "USD",
        "EstimationUrl": null,
        "Frequency": "Monthly",
        "TargetCompany": "AWS"
      }
    ],
    "OtherCompetitorNames": null,
    "OtherSolutionDescription": "TestSolution",
    "RelatedOpportunityIdentifier": null,
    "SalesActivities": ["Conducted POC / Demo"],
    "Title": generateRandomOpportunityTitle()
  },
  "SoftwareRevenue": {
    "DeliveryModel": "Pay-as-you-go",
    "EffectiveDate": new Date().toISOString().split('T')[0],
    "ExpirationDate": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    "Value": {
      "Amount": "6000",
      "CurrencyCode": "USD"
    }
  }
});

export const getOpportunityPayload = (opportunityId = 'O-1234567890abcdef') => ({
  "Catalog": "Sandbox",
  "Identifier": opportunityId
});

export const assignOpportunityPayload = (opportunityId = 'O-1234567890abcdef') => ({
  "Catalog": "Sandbox",
  "Identifier": opportunityId,
  "Assignee": {
    "BusinessTitle": "",
    "Email": "",
    "FirstName": "",
    "LastName": ""
  }
});

export const publishSaaSProductPayload = () => {
  
  return {
    "Catalog": "AWSMarketplace",
    "ChangeSet": [
      {
        "ChangeType": "CreateProduct",
        "Entity": {
          "Type": "SaaSProduct@1.0"
        },
        "ChangeName": "CreateProductChange",
        "DetailsDocument": {}
      },
      {
        "ChangeType": "UpdateInformation",
        "Entity": {
          "Type": "SaaSProduct@1.0",
          "Identifier": "$CreateProductChange.Entity.Identifier"
        },
        "DetailsDocument": {
          "ProductTitle": generateRandomProductTitle(),
          "ShortDescription": "Brief description",
          "LongDescription": "Detailed description",
          "SupportDescription": "Support details goes here.",
          "Highlights": ["Sample highlight"],
          "SearchKeywords": ["Sample keyword"],
          "Categories": ["Data Catalogs"],
          "LogoUrl": "https://awsmp-logos.s3.amazonaws.com/ca60b754fe05a24257176cdbf31c4e0d",
          "AdditionalResources": []
        }
      },
      {
        "ChangeType": "UpdateTargeting",
        "Entity": {
          "Type": "SaaSProduct@1.0",
          "Identifier": "$CreateProductChange.Entity.Identifier"
        },
        "DetailsDocument": {
          "PositiveTargeting": {
            "BuyerAccounts": ["222222222222", "222222222222"]
          }
        }
      },
      {
        "ChangeType": "AddDeliveryOptions",
        "Entity": {
          "Type": "SaaSProduct@1.0",
          "Identifier": "$CreateProductChange.Entity.Identifier"
        },
        "DetailsDocument": {
          "DeliveryOptions": [
            {
              "Details": {
                "SaaSUrlDeliveryOptionDetails": {
                  "FulfillmentUrl": "https://sample.amazonaws.com/sample-saas-fulfillment-url"
                }
              }
            }
          ]
        }
      },
      {
        "ChangeType": "AddDimensions",
        "Entity": {
          "Type": "SaaSProduct@1.0",
          "Identifier": "$CreateProductChange.Entity.Identifier"
        },
        "DetailsDocument": [
          {
            "Name": "Dimension 1",
            "Description": "Dimension 1 description goes here",
            "Key": "dimension_1_id",
            "Unit": "Units",
            "Types": ["Entitled"]
          },
          {
            "Name": "Dimension 2",
            "Description": "Dimension 2 description goes here",
            "Key": "dimension_2_id",
            "Unit": "Units",
            "Types": ["Entitled"]
          },
          {
            "Name": "Dimension 3",
            "Description": "Dimension 3 description goes here",
            "Key": "dimension_3_id",
            "Unit": "Units",
            "Types": ["Entitled"]
          },
          {
            "Name": "metered 1",
            "Description": "Metered dimension 1 desc goes here",
            "Key": "metered_1_id",
            "Unit": "Units",
            "Types": ["ExternallyMetered"]
          },
          {
            "Name": "metered 2",
            "Description": "Metered dimension 2 desc goes here",
            "Key": "metered_2_id",
            "Unit": "Units",
            "Types": ["ExternallyMetered"]
          },
          {
            "Name": "metered 3",
            "Description": "Metered dimension 3 desc goes here",
            "Key": "metered_3_id",
            "Unit": "Units",
            "Types": ["ExternallyMetered"]
          }
        ]
      },
      {
        "ChangeType": "ReleaseProduct",
        "Entity": {
          "Type": "SaaSProduct@1.0",
          "Identifier": "$CreateProductChange.Entity.Identifier"
        },
        "DetailsDocument": {}
      },
      {
        "ChangeType": "CreateOffer",
        "Entity": {
          "Type": "Offer@1.0"
        },
        "ChangeName": "CreateOfferChange",
        "DetailsDocument": {
          "ProductId": "$CreateProductChange.Entity.Identifier"
        }
      },
      {
        "ChangeType": "UpdateInformation",
        "Entity": {
          "Type": "Offer@1.0",
          "Identifier": "$CreateOfferChange.Entity.Identifier"
        },
        "DetailsDocument": {
          "Name": "Test public offer for SaaSProduct using AWS Marketplace API Reference Code",
          "Description": "Test public offer with contract pricing for SaaSProduct using AWS Marketplace API Reference Code"
        }
      },
      {
        "ChangeType": "UpdatePricingTerms",
        "Entity": {
          "Type": "Offer@1.0",
          "Identifier": "$CreateOfferChange.Entity.Identifier"
        },
        "DetailsDocument": {
          "PricingModel": "Contract",
          "Terms": [
            {
              "Type": "ConfigurableUpfrontPricingTerm",
              "CurrencyCode": "USD",
              "RateCards": [
                {
                  "Selector": {
                    "Type": "Duration",
                    "Value": "P1M"
                  },
                  "RateCard": [
                    {
                      "DimensionKey": "dimension_1_id",
                      "Price": "20"
                    },
                    {
                      "DimensionKey": "dimension_2_id",
                      "Price": "25"
                    }
                  ],
                  "Constraints": {
                    "MultipleDimensionSelection": "Allowed",
                    "QuantityConfiguration": "Allowed"
                  }
                },
                {
                  "Selector": {
                    "Type": "Duration",
                    "Value": "P12M"
                  },
                  "RateCard": [
                    {
                      "DimensionKey": "dimension_1_id",
                      "Price": "150"
                    },
                    {
                      "DimensionKey": "dimension_2_id",
                      "Price": "300"
                    }
                  ],
                  "Constraints": {
                    "MultipleDimensionSelection": "Allowed",
                    "QuantityConfiguration": "Allowed"
                  }
                }
              ]
            }
          ]
        }
      },
      {
        "ChangeType": "UpdateRenewalTerms",
        "Entity": {
          "Type": "Offer@1.0",
          "Identifier": "$CreateOfferChange.Entity.Identifier"
        },
        "DetailsDocument": {
          "Terms": [
            {
              "Type": "RenewalTerm"
            }
          ]
        }
      },
      {
        "ChangeType": "UpdateLegalTerms",
        "Entity": {
          "Type": "Offer@1.0",
          "Identifier": "$CreateOfferChange.Entity.Identifier"
        },
        "DetailsDocument": {
          "Terms": [
            {
              "Type": "LegalTerm",
              "Documents": [
                {
                  "Type": "StandardEula",
                  "Version": "2022-07-14"
                }
              ]
            }
          ]
        }
      },
      {
        "ChangeType": "UpdateSupportTerms",
        "Entity": {
          "Type": "Offer@1.0",
          "Identifier": "$CreateOfferChange.Entity.Identifier"
        },
        "DetailsDocument": {
          "Terms": [
            {
              "Type": "SupportTerm",
              "RefundPolicy": "Absolutely no refund, period."
            }
          ]
        }
      },
      {
        "ChangeType": "ReleaseOffer",
        "Entity": {
          "Type": "Offer@1.0",
          "Identifier": "$CreateOfferChange.Entity.Identifier"
        },
        "DetailsDocument": {}
      }
    ]
  };
};

export const describeChangeSetPayload = (changeSetId = 'cs-1234567890abcdef') => ({
  "Catalog": "AWSMarketplace",
  "ChangeSetId": changeSetId
});

export const createPrivateOfferPayload = (options = {}) => {
  const { firstChargeDateStr, secondChargeDateStr } = calculateChargeDates();
  
  return {
    "Catalog": "AWSMarketplace",
    "ChangeSet": [
      {
        "ChangeName": "MyCreateOfferChange",
        "ChangeType": "CreateOffer",
        "Entity": {
          "Type": "Offer@1.0"
        },
        "DetailsDocument": {
          "ProductId": "prod-uxaz6zgh52ooa"
        }
      },
      {
        "ChangeType": "UpdateInformation",
        "Entity": {
          "Type": "Offer@1.0",
          "Identifier": "$MyCreateOfferChange.Entity.Identifier"
        },
        "DetailsDocument": {
          "Name": "Demo Private Offer",
          "Description": "Demo Private Offer Description"
        }
      },
      {
        "ChangeType": "UpdateTargeting",
        "Entity": {
          "Type": "Offer@1.0",
          "Identifier": "$MyCreateOfferChange.Entity.Identifier"
        },
        "DetailsDocument": {
          "PositiveTargeting": {
            "BuyerAccounts": ["222222222222"]
          }
        }
      },
      {
        "ChangeType": "UpdateAvailability",
        "Entity": {
          "Type": "Offer@1.0",
          "Identifier": "$MyCreateOfferChange.Entity.Identifier"
        },
        "DetailsDocument": {
          "AvailabilityEndDate": getDefaultAvailabilityEndDate()
        }
      },
      {
        "ChangeType": "UpdateLegalTerms",
        "Entity": {
          "Identifier": "$MyCreateOfferChange.Entity.Identifier",
          "Type": "Offer@1.0"
        },
        "DetailsDocument": {
          "Terms": [
            {
              "Type": "LegalTerm",
              "Documents": [
                {
                  "Type": "StandardEula",
                  "Version": "2022-07-14"
                }
              ]
            }
          ]
        }
      },
      {
        "ChangeType": "UpdatePricingTerms",
        "Entity": {
          "Type": "Offer@1.0",
          "Identifier": "$MyCreateOfferChange.Entity.Identifier"
        },
        "DetailsDocument": {
          "PricingModel": "Contract",
          "Terms": [
            {
              "Type": "FixedUpfrontPricingTerm",
              "CurrencyCode": "USD",
              "Price": "0",
              "Duration": "P24M",
              "Grants": [
                {
                  "DimensionKey": "dimension_1_id",
                  "MaxQuantity": 22000
                },
                {
                  "DimensionKey": "dimension_2_id",
                  "MaxQuantity": 22000
                },
                {
                  "DimensionKey": "dimension_3_id",
                  "MaxQuantity": 22000
                }
              ]
            },
            {
              "Type": "UsageBasedPricingTerm",
              "CurrencyCode": "USD",
              "RateCards": [
                {
                  "RateCard": [
                    {
                      "DimensionKey": "metered_1_id",
                      "Price": "0"
                    },
                    {
                      "DimensionKey": "metered_2_id",
                      "Price": "0"
                    },
                    {
                      "DimensionKey": "metered_3_id",
                      "Price": "0"
                    }
                  ]
                }
              ]
            }
          ]
        }
      },
      {
        "ChangeType": "UpdatePaymentScheduleTerms",
        "Entity": {
          "Identifier": "$MyCreateOfferChange.Entity.Identifier",
          "Type": "Offer@1.0"
        },
        "DetailsDocument": {
          "Terms": [
            {
              "Type": "PaymentScheduleTerm",
              "CurrencyCode": "USD",
              "Schedule": [
                {
                  "ChargeDate": firstChargeDateStr,
                  "ChargeAmount": "0"
                },
                {
                  "ChargeDate": secondChargeDateStr,
                  "ChargeAmount": "0"
                }
              ]
            }
          ]
        }
      },
      {
        "ChangeType": "UpdateValidityTerms",
        "Entity": {
          "Type": "Offer@1.0",
          "Identifier": "$MyCreateOfferChange.Entity.Identifier"
        },
        "DetailsDocument": {
          "Terms": [
            {
              "Type": "ValidityTerm",
              "AgreementDuration": "P24M"
            }
          ]
        }
      },
      {
        "ChangeType": "ReleaseOffer",
        "DetailsDocument": {},
        "Entity": {
          "Type": "Offer@1.0",
          "Identifier": "$MyCreateOfferChange.Entity.Identifier"
        }
      }
    ]
  };
};

export const createPrivateOfferFuturePayload = () => {
  const { firstChargeDateStr, secondChargeDateStr } = calculateChargeDates();
  const { agreementStartDate, agreementEndDate } = calculateAgreementDates();
  
  return {
    "Catalog": "AWSMarketplace",
    "ChangeSet": [
      {
        "ChangeName": "MyCreateOfferChange",
        "ChangeType": "CreateOffer",
        "Entity": {
          "Type": "Offer@1.0"
        },
        "DetailsDocument": {
          "ProductId": "prod-uxaz6zgh52ooa"
        }
      },
      {
        "ChangeType": "UpdateInformation",
        "Entity": {
          "Type": "Offer@1.0",
          "Identifier": "$MyCreateOfferChange.Entity.Identifier"
        },
        "DetailsDocument": {
          "Name": "Demo Private Offer with Future Service Date",
          "Description": "Demo Private Offer with Future Service Date Description"
        }
      },
      {
        "ChangeType": "UpdateTargeting",
        "Entity": {
          "Type": "Offer@1.0",
          "Identifier": "$MyCreateOfferChange.Entity.Identifier"
        },
        "DetailsDocument": {
          "PositiveTargeting": {
            "BuyerAccounts": ["222222222222"]
          }
        }
      },
      {
        "ChangeType": "UpdateAvailability",
        "Entity": {
          "Type": "Offer@1.0",
          "Identifier": "$MyCreateOfferChange.Entity.Identifier"
        },
        "DetailsDocument": {
          "AvailabilityEndDate": getDefaultAvailabilityEndDate()
        }
      },
      {
        "ChangeType": "UpdateLegalTerms",
        "Entity": {
          "Identifier": "$MyCreateOfferChange.Entity.Identifier",
          "Type": "Offer@1.0"
        },
        "DetailsDocument": {
          "Terms": [
            {
              "Type": "LegalTerm",
              "Documents": [
                {
                  "Type": "StandardEula",
                  "Version": "2022-07-14"
                }
              ]
            }
          ]
        }
      },
      {
        "ChangeType": "UpdatePricingTerms",
        "Entity": {
          "Type": "Offer@1.0",
          "Identifier": "$MyCreateOfferChange.Entity.Identifier"
        },
        "DetailsDocument": {
          "PricingModel": "Contract",
          "Terms": [
            {
              "Type": "FixedUpfrontPricingTerm",
              "CurrencyCode": "USD",
              "Price": "0",
              "Grants": [
                {
                  "DimensionKey": "dimension_1_id",
                  "MaxQuantity": 22000
                },
                {
                  "DimensionKey": "dimension_2_id",
                  "MaxQuantity": 22000
                },
                {
                  "DimensionKey": "dimension_3_id",
                  "MaxQuantity": 22000
                }
              ]
            },
            {
              "Type": "UsageBasedPricingTerm",
              "CurrencyCode": "USD",
              "RateCards": [
                {
                  "RateCard": [
                    {
                      "DimensionKey": "metered_1_id",
                      "Price": "0"
                    },
                    {
                      "DimensionKey": "metered_2_id",
                      "Price": "0"
                    },
                    {
                      "DimensionKey": "metered_3_id",
                      "Price": "0"
                    }
                  ]
                }
              ]
            }
          ]
        }
      },
      {
        "ChangeType": "UpdatePaymentScheduleTerms",
        "Entity": {
          "Identifier": "$MyCreateOfferChange.Entity.Identifier",
          "Type": "Offer@1.0"
        },
        "DetailsDocument": {
          "Terms": [
            {
              "Type": "PaymentScheduleTerm",
              "CurrencyCode": "USD",
              "Schedule": [
                {
                  "ChargeDate": firstChargeDateStr,
                  "ChargeAmount": "0"
                },
                {
                  "ChargeDate": secondChargeDateStr,
                  "ChargeAmount": "0"
                }
              ]
            }
          ]
        }
      },
      {
        "ChangeType": "UpdateValidityTerms",
        "Entity": {
          "Type": "Offer@1.0",
          "Identifier": "$MyCreateOfferChange.Entity.Identifier"
        },
        "DetailsDocument": {
          "Terms": [
            {
              "Type": "ValidityTerm",
              "AgreementStartDate": agreementStartDate,
              "AgreementEndDate": agreementEndDate
            }
          ]
        }
      },
      {
        "ChangeType": "ReleaseOffer",
        "DetailsDocument": {},
        "Entity": {
          "Type": "Offer@1.0",
          "Identifier": "$MyCreateOfferChange.Entity.Identifier"
        }
      }
    ]
  };
};

export const createCPPOPayload = () => {
  const { firstChargeDateStr, secondChargeDateStr } = calculateChargeDates();
  
  return {
    "Catalog": "AWSMarketplace",
    "ChangeSet": [
      {
        "ChangeName": "MyCreateResaleAuthorizationChange",
        "ChangeType": "CreateResaleAuthorization",
        "Entity": {
          "Type": "ResaleAuthorization@1.0"
        },
        "DetailsDocument": {
          "ProductId": "prod-uxaz6zgh52ooa",
          "ResellerAccountId": "333333333333",
          "Name": "DemoResaleAuthorization"
        }
      },
      {
        "ChangeType": "UpdateInformation",
        "Entity": {
          "Type": "ResaleAuthorization@1.0",
          "Identifier": "$MyCreateResaleAuthorizationChange.Entity.Identifier"
        },
        "DetailsDocument": {
          "Name": "DemoResaleAuthorization",
          "Description": "Demo Resale Authorization Description"
        }
      },
      {
        "ChangeType": "UpdateAvailability",
        "Entity": {
          "Type": "ResaleAuthorization@1.0",
          "Identifier": "$MyCreateResaleAuthorizationChange.Entity.Identifier"
        },
        "DetailsDocument": {
          "AvailabilityEndDate": getDefaultAvailabilityEndDate(),
          "OffersMaxQuantity": 1
        }
      },
      {
        "ChangeType": "UpdateLegalTerms",
        "Entity": {
          "Type": "ResaleAuthorization@1.0",
          "Identifier": "$MyCreateResaleAuthorizationChange.Entity.Identifier"
        },
        "DetailsDocument": {
          "Terms": [
            {
              "Type": "BuyerLegalTerm",
              "Documents": [
                {
                  "Type": "StandardEula"
                }
              ]
            },
            {
              "Type": "ResaleLegalTerm",
              "Documents": [
                {
                  "Type": "StandardResellerContract"
                }
              ]
            }
          ]
        }
      },
      {
        "ChangeType": "UpdatePricingTerms",
        "Entity": {
          "Identifier": "$MyCreateResaleAuthorizationChange.Entity.Identifier",
          "Type": "ResaleAuthorization@1.0"
        },
        "DetailsDocument": {
          "PricingModel": "Contract",
          "Terms": [
            {
              "Type": "ResaleFixedUpfrontPricingTerm",
              "CurrencyCode": "USD",
              "Price": "0",
              "Duration": "P24M",
              "Grants": [
                {
                  "DimensionKey": "dimension_1_id",
                  "MaxQuantity": 22000
                },
                {
                  "DimensionKey": "dimension_2_id",
                  "MaxQuantity": 22000
                },
                {
                  "DimensionKey": "dimension_3_id",
                  "MaxQuantity": 22000
                }
              ]
            },
            {
              "Type": "ResaleUsageBasedPricingTerm",
              "CurrencyCode": "USD",
              "RateCards": [
                {
                  "RateCard": [
                    {
                      "DimensionKey": "metered_1_id",
                      "Price": "0.001"
                    },
                    {
                      "DimensionKey": "metered_2_id",
                      "Price": "0.001"
                    },
                    {
                      "DimensionKey": "metered_3_id",
                      "Price": "0.001"
                    }
                  ]
                }
              ]
            }
          ]
        }
      },
      {
        "ChangeType": "UpdatePaymentScheduleTerms",
        "Entity": {
          "Identifier": "$MyCreateResaleAuthorizationChange.Entity.Identifier",
          "Type": "ResaleAuthorization@1.0"
        },
        "DetailsDocument": {
          "Terms": [
            {
              "Type": "ResalePaymentScheduleTerm",
              "CurrencyCode": "USD",
              "Schedule": [
                {
                  "ChargeDate": firstChargeDateStr,
                  "ChargeAmount": "30.00"
                },
                {
                  "ChargeDate": secondChargeDateStr,
                  "ChargeAmount": "30.00"
                }
              ]
            }
          ]
        }
      },
      {
        "ChangeType": "ReleaseResaleAuthorization",
        "DetailsDocument": {},
        "Entity": {
          "Identifier": "$MyCreateResaleAuthorizationChange.Entity.Identifier",
          "Type": "ResaleAuthorization@1.0"
        }
      }
    ]
  };
};

// Associate Opportunity Payload Template
export const associateOpportunityPayload = () => ({
  "Catalog": "Sandbox",
  "OpportunityIdentifier": "O1234567890123456789",
  "RelatedEntityIdentifier": "solution-12345678-1234-1234-1234-123456789012",
  "RelatedEntityType": "Solutions"
});

// Update Opportunity Payload Template (based on GetOpportunity response)
export const updateOpportunityPayload = () => ({
  "Catalog": "Sandbox",
  "Identifier": "O1234567",
  "Customer": {
    "Account": {
      "Address": {
        "City": "Seattle",
        "CountryCode": "US",
        "PostalCode": "98101",
        "StateOrRegion": "Washington",
        "StreetAddress": "123 Main St"
      },
      "AwsAccountId": "123456789012",
      "CompanyName": "Example Company",
      "Duns": "123456789",
      "Industry": "Technology",
      "OtherIndustry": null,
      "WebsiteUrl": "https://example.com"
    },
    "Contacts": [
      {
        "BusinessTitle": "CTO",
        "Email": "contact@example.com",
        "FirstName": "John",
        "LastName": "Doe",
        "Phone": "+1-555-0123"
      }
    ]
  },
  "Description": "Updated opportunity description",
  "LifeCycle": {
    "ClosedLostReason": null,
    "NextSteps": "Updated next steps for the opportunity",
    "NextStepsHistory": [
      {
        "Time": "2024-01-15T10:00:00Z",
        "Value": "Initial contact made"
      }
    ],
    "ReviewComments": null,
    "ReviewStatus": "In review",
    "ReviewStatusReason": null,
    "Stage": "Qualified",
    "TargetCloseDate": "2024-12-31"
  },
  "Marketing": {
    "AwsFundingUsed": "Yes",
    "CampaignName": "Q4 Campaign",
    "Channels": ["Partner Referral"],
    "Source": "Partner",
    "UseCases": ["Analytics", "Machine Learning"]
  },
  "NationalSecurity": "No",
  "OpportunityType": "Net New Business",
  "Origin": "Partner Referral",
  "PartnerOpportunityIdentifier": "PARTNER-OPP-001",
  "PrimaryNeedsFromAws": ["Co-Sell - Architectural Validation"],
  "Project": {
    "AdditionalComments": "Updated project comments",
    "ApnPrograms": ["ISV Workload Migration"],
    "CompetitorName": "Other",
    "CustomerBusinessProblem": "Updated business problem description",
    "CustomerUseCase": "Updated use case description",
    "DeliveryModels": ["SaaS or PaaS"],
    "ExpectedCustomerSpend": [
      {
        "Amount": "100000",
        "CurrencyCode": "USD",
        "Frequency": "Monthly",
        "TargetCompany": "AWS"
      }
    ],
    "OtherCompetitorNames": "Competitor ABC",
    "OtherSolutionDescription": "Alternative solution details",
    "RelatedOpportunityIdentifier": null,
    "SalesActivities": ["Architectural Design Review"],
    "Title": "Updated Opportunity Title"
  },
  "SoftwareRevenue": {
    "DeliveryModel": "Contract",
    "EffectiveDate": "2024-02-01",
    "ExpirationDate": "2025-01-31",
    "Value": {
      "Amount": "50000",
      "CurrencyCode": "USD"
    }
  }
});

// List Solutions Payload Template
export const listSolutionsPayload = () => ({
  "Catalog": "Sandbox",
  "MaxResults": 10,
  "Sort": {
    "SortBy": "CreatedDate",
    "SortOrder": "DESCENDING"
  },
  "Status": ["Active"]
});

// Simulate Approval from AWS Payload Template (based on UpdateOpportunity with Approved status)
export const simulateApprovalPayload = () => ({
  "Catalog": "Sandbox",
  "Identifier": "O1234567",
  "Customer": {
    "Account": {
      "Address": {
        "City": "Seattle",
        "CountryCode": "US",
        "PostalCode": "98101",
        "StateOrRegion": "Washington",
        "StreetAddress": "123 Main St"
      },
      "AwsAccountId": "123456789012",
      "CompanyName": "Example Company",
      "Duns": "123456789",
      "Industry": "Technology",
      "OtherIndustry": null,
      "WebsiteUrl": "https://example.com"
    },
    "Contacts": [
      {
        "BusinessTitle": "CTO",
        "Email": "contact@example.com",
        "FirstName": "John",
        "LastName": "Doe",
        "Phone": "+1-555-0123"
      }
    ]
  },
  "Description": "Opportunity approved by AWS for partner collaboration",
  "LifeCycle": {
    "ClosedLostReason": null,
    "NextSteps": "AWS has approved this opportunity for collaboration",
    "NextStepsHistory": [
      {
        "Time": "2024-01-15T10:00:00Z",
        "Value": "Initial contact made"
      },
      {
        "Time": "2024-01-20T14:30:00Z",
        "Value": "AWS review completed - Approved"
      }
    ],
    "ReviewComments": "Opportunity meets AWS collaboration criteria and has been approved for partner engagement",
    "ReviewStatus": "Approved",
    "ReviewStatusReason": "Meets technical and business requirements for AWS partnership",
    "Stage": "Qualified",
    "TargetCloseDate": "2024-12-31"
  },
  "Marketing": {
    "AwsFundingUsed": "Yes",
    "CampaignName": "Q4 Campaign",
    "Channels": ["Partner Referral"],
    "Source": "Partner",
    "UseCases": ["Analytics", "Machine Learning"]
  },
  "NationalSecurity": "No",
  "OpportunityType": "Net New Business",
  "Origin": "Partner Referral",
  "PartnerOpportunityIdentifier": "PARTNER-OPP-001",
  "PrimaryNeedsFromAws": ["Co-Sell - Architectural Validation"],
  "Project": {
    "AdditionalComments": "AWS approved opportunity with validated architecture",
    "ApnPrograms": ["ISV Workload Migration"],
    "CompetitorName": "Other",
    "CustomerBusinessProblem": "Business problem validated by AWS",
    "CustomerUseCase": "Use case approved for AWS collaboration",
    "DeliveryModels": ["SaaS or PaaS"],
    "ExpectedCustomerSpend": [
      {
        "Amount": "100000",
        "CurrencyCode": "USD",
        "Frequency": "Monthly",
        "TargetCompany": "AWS"
      }
    ],
    "OtherCompetitorNames": "Competitor ABC",
    "OtherSolutionDescription": "Alternative solution details",
    "RelatedOpportunityIdentifier": null,
    "SalesActivities": ["Architectural Design Review"],
    "Title": "AWS Approved Opportunity"
  },
  "SoftwareRevenue": {
    "DeliveryModel": "Contract",
    "EffectiveDate": "2024-02-01",
    "ExpirationDate": "2025-01-31",
    "Value": {
      "Amount": "50000",
      "CurrencyCode": "USD"
    }
  }
});

// Start Engagement From Opportunity Task Payload Template
export const startEngagementFromOpportunityTaskPayload = () => ({
  "Catalog": "Sandbox",
  "Identifier": "O1234567890123456789",
  "ClientToken": generateUUID(),
  "AwsSubmission": {
    "InvolvementType": "Co-Sell",
    "Visibility": "Full"
  }
});