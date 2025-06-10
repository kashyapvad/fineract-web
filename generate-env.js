const { writeFileSync } = require('fs');
const { resolve } = require('path');

// Generate the env.js content with the proper structure
const envContent = `(function(window) {
  window["env"] = window["env"] || {};

  // BackEnd Environment variables
  window["env"]["fineractApiUrls"] = '${process.env.FINERACT_API_URLS || ''}';
  window["env"]["fineractApiUrl"]  = '${process.env.FINERACT_API_URL || ''}';

  window["env"]["apiProvider"] = '${process.env.FINERACT_API_PROVIDER || ''}';
  window["env"]["apiVersion"]  = '${process.env.FINERACT_API_VERSION || ''}';

  window["env"]["fineractPlatformTenantId"]  = '${process.env.FINERACT_PLATFORM_TENANT_IDENTIFIER || ''}';
  window["env"]["fineractPlatformTenantIds"]  = '${process.env.FINERACT_PLATFORM_TENANTS_IDENTIFIER || ''}';

  // Language Environment variables
  window["env"]["defaultLanguage"] = '${process.env.MIFOS_DEFAULT_LANGUAGE || ''}';
  window["env"]["supportedLanguages"] = '${process.env.MIFOS_SUPPORTED_LANGUAGES || ''}';

  window['env']['preloadClients'] = '${process.env.MIFOS_PRELOAD_CLIENTS || ''}';

  // Char delimiter to Export CSV options: ',' ';' '|' ' '
  window['env']['defaultCharDelimiter'] = '${process.env.MIFOS_DEFAULT_CHAR_DELIMITER || ''}';

  // Display or not the BackEnd Info
  window['env']['displayBackEndInfo'] = '';

  // Display or not the Tenant Selector
  window['env']['displayTenantSelector'] = '';

  // Time in seconds for Notifications, default 60 seconds
  window['env']['waitTimeForNotifications'] = '';

  // Time in seconds for COB Catch-Up, default 30 seconds
  window['env']['waitTimeForCOBCatchUp'] = '';

  // Time in milliseconds for Session idle timeout, default 300000 seconds
  window['env']['sessionIdleTimeout'] = '0';

  // OAuth Server Enabled  
  window['env']['oauthServerEnabled'] = '${process.env.MIFOS_OAUTH_SERVER_ENABLED || ''}';

  // OAuth Server URL  
  window['env']['oauthServerUrl'] = '${process.env.MIFOS_OAUTH_SERVER_URL || ''}';

  // OAuth Client Id  
  window['env']['oauthAppId'] = '${process.env.MIFOS_OAUTH_CLIENT_ID || ''}';

})(this);`;

// Write to the assets directory
const envFilePath = resolve(__dirname, 'src', 'assets', 'env.js');
writeFileSync(envFilePath, envContent, 'utf8');

console.log('Generated env.js with environment variables:');
