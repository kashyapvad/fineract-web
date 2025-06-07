const { writeFileSync } = require('fs');
const { resolve } = require('path');

// Get NG_FINERACT_API_URL from Netlify environment variables
const fineractApiUrl = process.env.FINERACT_API_URL;

// Generate the env.js content
const envContent = `window['env'] = {
  fineractApiUrl: '${fineractApiUrl}',
};`;

// Write to the assets directory
const envFilePath = resolve(__dirname, 'src', 'assets', 'env.js');
writeFileSync(envFilePath, envContent, 'utf8');
