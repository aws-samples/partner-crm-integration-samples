// Store AWS credentials in session storage
export const storeCredentials = (accessKey, secretKey, sessionToken, region = 'us-east-1') => {
  sessionStorage.setItem('aws_access_key', accessKey);
  sessionStorage.setItem('aws_secret_key', secretKey);
  sessionStorage.setItem('aws_session_token', sessionToken);
  sessionStorage.setItem('aws_region', region);
};

// Get AWS credentials from session storage
export const getCredentials = () => {
  return {
    accessKey: sessionStorage.getItem('aws_access_key'),
    secretKey: sessionStorage.getItem('aws_secret_key'),
    sessionToken: sessionStorage.getItem('aws_session_token'),
    region: sessionStorage.getItem('aws_region') || 'us-east-1'
  };
};

// Check if credentials exist in session storage
export const hasCredentials = () => {
  return sessionStorage.getItem('aws_access_key') && sessionStorage.getItem('aws_secret_key');
};

// Clear credentials from session storage
export const clearCredentials = () => {
  sessionStorage.removeItem('aws_access_key');
  sessionStorage.removeItem('aws_secret_key');
  sessionStorage.removeItem('aws_session_token');
  sessionStorage.removeItem('aws_region');
};

export const saveOpportunityId = (id) => {
  sessionStorage.setItem('opportunityId', id);
};

export const getOpportunityId = () => {
  return sessionStorage.getItem('opportunityId');
};

export const saveEngagementInvitationId = (id) => {
  sessionStorage.setItem('engagementInvitationId', id);
};

export const getEngagementInvitationId = () => {
  return sessionStorage.getItem('engagementInvitationId');
};
