/**
 * Utility functions for handling opportunity data
 */

/**
 * Recursively decodes HTML entities in all string values of an object.
 * The Partner Central Selling API returns colons encoded as &colon; in HTTP responses
 * to browser clients. This is a server-side encoding quirk (only affects ':').
 * @param {*} value - Any value to decode
 * @returns {*} - The value with &colon; decoded in all strings
 */
const decodeEntitiesInObject = (value) => {
  if (typeof value === 'string') {
    // Server returns &amp;colon; (double-encoded) for the : character
    return value.replace(/&amp;colon;/g, ':');
  }
  if (value instanceof Date) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(decodeEntitiesInObject);
  }
  if (value && typeof value === 'object') {
    const result = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = decodeEntitiesInObject(v);
    }
    return result;
  }
  return value;
};

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
  
  // Decode HTML entities in all string values
  return decodeEntitiesInObject(cleanedData);
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