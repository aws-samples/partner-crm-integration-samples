// Configuration file for the application
export const config = {
  // Internal flag to show additional configuration options
  Internal: false,
  // Skip login page and auto-login with credentials from local credentials file
  // SECURITY: Only enable auto-login in development, never in production builds
  SkipLogin: false
};

// Catalog options for internal use
export const CATALOG_OPTIONS = [
  { name: 'Sandbox', value: 'Sandbox' },
  { name: 'AWS', value: 'AWS' }
];