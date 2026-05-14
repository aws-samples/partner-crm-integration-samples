// Shared AWS client utilities for both applications
import { MarketplaceCatalogClient } from '@aws-sdk/client-marketplace-catalog';
import { PartnerCentralSellingClient } from '@aws-sdk/client-partnercentral-selling';
import { MarketplaceAgreementClient } from '@aws-sdk/client-marketplace-agreement';

export const createMarketplaceCatalogClient = (credentials) => {
  const clientConfig = {
    region: credentials.region || 'us-east-1',
    credentials: {
      accessKeyId: credentials.accessKey,
      secretAccessKey: credentials.secretKey,
      sessionToken: credentials.sessionToken
    }
  };

  return new MarketplaceCatalogClient(clientConfig);
};

export const createPartnerCentralClient = (credentials) => {
  const clientConfig = {
    region: credentials.region || 'us-east-1',
    credentials: {
      accessKeyId: credentials.accessKey,
      secretAccessKey: credentials.secretKey,
      sessionToken: credentials.sessionToken
    }
  };

  return new PartnerCentralSellingClient(clientConfig);
};

export const createMarketplaceAgreementClient = (credentials) => {
  const clientConfig = {
    region: credentials.region || 'us-east-1',
    credentials: {
      accessKeyId: credentials.accessKey,
      secretAccessKey: credentials.secretKey,
      sessionToken: credentials.sessionToken
    }
  };

  return new MarketplaceAgreementClient(clientConfig);
};

// Shared date calculation utilities
export const calculateChargeDatesFromToday = () => {
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