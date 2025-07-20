/**
 * Utility functions for handling opportunity data
 */

/**
 * Cleans an opportunity response by removing __type attributes and ensuring proper format
 * @param {Object} opportunityData - The raw opportunity data from API
 * @returns {Object} - Cleaned opportunity data
 */
export const cleanOpportunityData = (opportunityData) => {
  if (!opportunityData) return opportunityData;
  
  // Create a deep copy to avoid modifying the original
  const cleanedData = JSON.parse(JSON.stringify(opportunityData));
  
  // Remove $metadata field
  if (cleanedData.$metadata) {
    delete cleanedData.$metadata;
  }
  
  // Clean ExpectedCustomerSpend if it exists
  if (cleanedData.Project?.ExpectedCustomerSpend) {
    cleanedData.Project.ExpectedCustomerSpend = cleanedData.Project.ExpectedCustomerSpend.map(spend => ({
      Amount: spend.Amount,
      CurrencyCode: spend.CurrencyCode,
      EstimationUrl: null, // Always set to null as per the expected format
      Frequency: spend.Frequency,
      TargetCompany: spend.TargetCompany
    }));
  }
  
  return cleanedData;
};

/**
 * Enhances opportunity data with AWS opportunity summary data
 * @param {Object} opportunityData - The cleaned opportunity data
 * @param {Object} awsSummary - The AWS opportunity summary data
 * @returns {Object} - Enhanced opportunity data
 */
export const enhanceWithAwsSummary = (opportunityData, awsSummary) => {
  return {
    ...opportunityData,
    Origin: awsSummary.Origin || 'Partner referral',
    EngagementScore: awsSummary.Insights?.EngagementScore || '-',
    NextBestActions: awsSummary.Insights?.NextBestActions || '-',
    InvolvementType: awsSummary.InvolvementType || '-',
    AwsProducts: awsSummary.RelatedEntityIds?.AwsProducts || [],
    Solutions: awsSummary.RelatedEntityIds?.Solutions || []
  };
};