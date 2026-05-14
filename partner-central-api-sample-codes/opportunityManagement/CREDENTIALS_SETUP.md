# Credentials Setup for Auto-Login (Secure)

## Overview
When `SkipLogin: true` is set in `src/config/config.js`, the application will automatically read AWS credentials from environment variables for secure auto-login. This credential system supports both the **Opportunity Management** and **Offer Automation** applications in the dual-app architecture.

## 🚀 Quick Setup (Recommended)

### Method 1: Automated Sync (Easiest)

This method automatically syncs credentials from your AWS CLI configuration:

1. **Ensure your AWS credentials are in `~/.aws/credentials`**:
   ```ini
   [default]
   aws_access_key_id = AKIAIOSFODNN7EXAMPLE
   aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   aws_session_token = IQoJb3JpZ2luX2VjEHoaCXVzLWVhc3QtMSJHMEUCIQDEXAMPLETOKEN...
   region = us-east-1
   ```

2. **Run the sync command**:
   ```bash
   npm run sync-creds
   ```

3. **Restart the development server**:
   ```bash
   # Stop current server (Ctrl+C)
   npm start
   ```

**That's it!** The sync script automatically:
- ✅ Reads credentials from `~/.aws/credentials`
- ✅ Converts to React environment variable format
- ✅ Handles multi-line session tokens correctly
- ✅ Creates/updates `.env.local` file
- ✅ Sets default region if not specified

### Method 2: Manual Environment File

Create a `.env.local` file in the project root with your AWS credentials:

```bash
# .env.local
REACT_APP_AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
REACT_APP_AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
REACT_APP_AWS_SESSION_TOKEN=IQoJb3JpZ2luX2VjEHoaCXVzLWVhc3QtMSJHMEUCIQDEXAMPLETOKEN...
REACT_APP_AWS_REGION=us-east-1
```

## 🔄 Credential Management Workflow

### When Credentials Expire (Common with Temporary Credentials)

1. **Get new credentials** from your AWS source:
   - AWS Workshop Studio
   - AWS Console
   - AWS CLI `aws configure`
   - Workshop instructor

2. **Update `~/.aws/credentials`** with new credentials:
   ```ini
   [default]
   aws_access_key_id = AKIAIOSFODNN7EXAMPLE
   aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   aws_session_token = IQoJb3JpZ2luX2VjEHoaCXVzLWVhc3QtMSJHMEUCIQDEXAMPLETOKEN...
   region = us-east-1
   ```

3. **Sync to React app**:
   ```bash
   npm run sync-creds
   ```

4. **Restart React app**:
   ```bash
   # Stop current app (Ctrl+C)
   npm start
   ```

### Sync Script Features

The `npm run sync-creds` command:
- 📖 **Reads** `~/.aws/credentials` [default] section
- 🔄 **Converts** to React environment variable format (`REACT_APP_*`)
- 📝 **Creates/Updates** `.env.local` file automatically
- 🛡️ **Handles** multi-line session tokens correctly
- 🌍 **Sets** default region (`us-east-1`) if not specified
- ✅ **Validates** credential format and provides helpful error messages

## ⚙️ Configuration Options

### Enable Auto-Login (default):
```javascript
// src/config/config.js
export const config = {
  Internal: true,
  SkipLogin: true  // Uses .env.local credentials
};
```

### Disable Auto-Login (use manual login form):
```javascript
// src/config/config.js
export const config = {
  Internal: true,
  SkipLogin: false  // Shows login form
};
```

## 🔒 Security Notes

### Automatic Security Features
- ✅ **Git Ignore**: `.env.local` is automatically excluded from version control
- ✅ **Local Only**: Environment variables only exist in your local development environment
- ✅ **Build-time Embedding**: Credentials embedded during build, not served as files
- ✅ **Session Storage**: Temporary credential storage in browser, cleared on logout
- ✅ **Multi-App Security**: Same security model applies to both applications
- ✅ **Production Safety**: Auto-login disabled in production builds for both apps

### Best Practices
- 🔐 **Never commit** `.env.local` or credential files to version control
- ⏰ **Use temporary credentials** with limited permissions when possible
- 🔄 **Rotate credentials** regularly, especially for long-running projects
- 👥 **Use least privilege** principle for AWS permissions
- 📊 **Monitor API usage** for unauthorized access

## 🐛 Troubleshooting

### Sync Command Issues

#### ❌ "Cannot read ~/.aws/credentials file"
```bash
# Check if file exists
ls -la ~/.aws/credentials

# Create if missing
mkdir -p ~/.aws
touch ~/.aws/credentials
```

#### ❌ "No [default] section found"
Ensure your `~/.aws/credentials` has a `[default]` section:
```ini
[default]
aws_access_key_id = AKIAIOSFODNN7EXAMPLE
aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
aws_session_token = IQoJb3JpZ2luX2VjEHoaCXVzLWVhc3QtMSJHMEUCIQDEXAMPLETOKEN...
region = us-east-1
```

#### ❌ "Sync script not found"
```bash
# Ensure you're in the project root directory
pwd
# Should show: /path/to/opportunityManagement

# Check if sync script exists
ls -la sync-credentials.js

# If missing, reinstall dependencies
npm install
```

### Application Issues

#### ❌ "Could not read credentials"
- ✅ Run `npm run sync-creds` to sync credentials
- ✅ Restart development server: `npm start`
- ✅ Check `.env.local` file was created in project root

#### ❌ "Missing required credentials"
- ✅ Verify `~/.aws/credentials` has all required fields
- ✅ Check for typos in credential keys
- ✅ Ensure session token is not expired

#### ❌ "Access Denied" API Errors
- ✅ Verify AWS credentials have AWS Marketplace and Partner Central permissions
- ✅ Check credentials are not expired (common with temporary credentials)
- ✅ Ensure you're using marketplace-specific credentials, not general AWS credentials
- ✅ Confirm AWS region matches your marketplace setup

#### ❌ Auto-Login Not Working
- ✅ Check `.env.local` exists in project root
- ✅ Verify environment variables start with `REACT_APP_`
- ✅ Restart development server after running sync
- ✅ Check browser console (F12) for detailed error messages

### Debug Mode

Enable detailed logging by adding to `.env.local`:
```bash
REACT_APP_DEBUG=true
```

## 📋 Manual Verification

### Check Sync Results
After running `npm run sync-creds`, verify the `.env.local` file:

```bash
# View the generated file (credentials will be masked in output)
head -5 .env.local

# Should show:
# REACT_APP_AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
# REACT_APP_AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
# REACT_APP_AWS_SESSION_TOKEN=IQoJb3JpZ2luX2VjEHoaCXVzLWVhc3QtMSJHMEUCIQDEXAMPLETOKEN...
# REACT_APP_AWS_REGION=us-east-1
```

### Test Credentials
Test if credentials work with AWS CLI:
```bash
# Test basic AWS access
aws sts get-caller-identity

# Test Partner Central access (if available)
aws partnercentral-selling list-opportunities --catalog Sandbox --region us-east-1
```

## 🎓 Workshop Studio Integration

### Important Notes for Workshop Participants

1. **Workshop Studio credentials** are for general AWS access
2. **This application requires** AWS Marketplace and Partner Central API credentials
3. **These are different** credential sets with different permissions

### Workshop Setup Process

1. **Workshop instructor provides** marketplace-specific credentials
2. **Add to `~/.aws/credentials`**:
   ```ini
   [default]
   aws_access_key_id = AKIAIOSFODNN7EXAMPLE
   aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   aws_session_token = IQoJb3JpZ2luX2VjEHoaCXVzLWVhc3QtMSJHMEUCIQDEXAMPLETOKEN...
   region = us-east-1
   ```
3. **Sync credentials**:
   ```bash
   npm run sync-creds
   ```
4. **Start application**:
   ```bash
   npm start
   ```

### For Workshop Instructors

Consider providing:
- Pre-configured `~/.aws/credentials` files
- Marketplace-specific credential sets
- Clear distinction between Workshop Studio and marketplace credentials
- Instructions for credential rotation during multi-day workshops

## 🆘 Getting Help

If you're still having issues:

1. **Check browser console** (F12) for detailed error messages
2. **Verify credential sync** with `npm run sync-creds`
3. **Test AWS CLI access** with `aws sts get-caller-identity`
4. **Review AWS permissions** for Partner Central and Marketplace APIs
5. **Contact workshop instructor** or AWS Support for marketplace API access

## 🏗️ Multi-App Architecture Support

### Credential Sharing Across Apps
The credential system seamlessly supports both applications:

#### **Opportunity Management App** (39 Components)
- All 39 components use the same credential system
- Shared session storage across all opportunity workflows
- Unified authentication for all AWS API calls

#### **Offer Automation App** (15 Components)  
- Same credential system as opportunity management
- Shared AWS client configurations
- Consistent authentication experience

#### **Shared Infrastructure**
- **Single `.env.local` file**: Serves both applications
- **Unified Session Management**: Credentials shared across all 55 components
- **Consistent Security Model**: Same security practices for both apps

### Development Benefits
```bash
# Single credential sync for both apps
npm run sync-creds

# Start both apps with shared credentials
npm run dev

# Both apps automatically authenticated:
# - Opportunity Management: http://localhost:3000
# - Offer Automation: http://localhost:3000 (same app, different routes)
```

### Architecture Advantages
- **Single Source of Truth**: One credential configuration for all components
- **Simplified Management**: No need to manage separate credential sets
- **Consistent Experience**: Same login behavior across both applications
- **Shared Security**: Unified security model protects all workflows

---

**The automated sync process makes credential management much easier and more reliable across both applications!** 🚀