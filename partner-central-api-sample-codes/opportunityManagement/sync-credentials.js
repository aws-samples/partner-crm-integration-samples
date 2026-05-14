#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('Syncing AWS credentials from ~/.aws/credentials to .env.local...');

try {
    // Read ~/.aws/credentials file
    const credentialsPath = path.join(os.homedir(), '.aws', 'credentials');
    const credentialsContent = fs.readFileSync(credentialsPath, 'utf8');
    
    // Parse credentials
    const lines = credentialsContent.split('\n');
    let inDefaultSection = false;
    let accessKeyId = '';
    let secretAccessKey = '';
    let sessionToken = '';
    let region = 'us-east-1'; // default
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine === '[default]') {
            inDefaultSection = true;
            continue;
        }
        
        if (trimmedLine.startsWith('[') && trimmedLine !== '[default]') {
            inDefaultSection = false;
            continue;
        }
        
        if (inDefaultSection && trimmedLine.includes('=')) {
            const [key, value] = trimmedLine.split('=').map(s => s.trim());
            
            switch (key) {
                case 'aws_access_key_id':
                    accessKeyId = value;
                    break;
                case 'aws_secret_access_key':
                    secretAccessKey = value;
                    break;
                case 'aws_session_token':
                    sessionToken = value;
                    break;
                case 'region':
                    region = value;
                    break;
            }
        }
    }
    
    // Create .env.local content
    const envContent = `# AWS Credentials for Auto-Login (Development Only)
# These are only used when SkipLogin=true in config.js
REACT_APP_AWS_ACCESS_KEY_ID=${accessKeyId}
REACT_APP_AWS_SECRET_ACCESS_KEY=${secretAccessKey}
REACT_APP_AWS_SESSION_TOKEN=${sessionToken}
REACT_APP_AWS_REGION=${region}
`;
    
    // Write .env.local file
    fs.writeFileSync('.env.local', envContent);
    
    console.log('✅ Credentials synced successfully!');
    console.log('🔄 Restart your React app (npm start) to pick up the new credentials');
    
} catch (error) {
    console.error('❌ Error syncing credentials:', error.message);
    process.exit(1);
}