# Publish SaaS Product Scripts

This folder contains scripts for creating and monitoring SaaS products in AWS Marketplace using the AWS Marketplace Catalog API.

## Scripts

### 1. start_changeset.py
Creates a limited SaaS product with a public offer using the changeset defined in `changeset.json`.

**Usage:**
```bash
# From the opportunityToOffer directory
source ../python_preview/pcapi/bin/activate
PYTHONPATH=. python3 1_publishSaasProcuct/start_changeset.py
```

**Output:**
- ChangeSet ID (e.g., `2irc20n325n8znc4fi4q0o3bb`)
- ChangeSet ARN

### 2. describe_changeset.py
Describes a changeset using the AWS Marketplace Catalog API's `DescribeChangeSet` action. Provides detailed information about the changeset status and all changes.

**Usage:**
```bash
# With specific changeset ID
PYTHONPATH=. python3 1_publishSaasProcuct/describe_changeset.py <changeset_id>

# Using default changeset ID from previous run
PYTHONPATH=. python3 1_publishSaasProcuct/describe_changeset.py
```

**Features:**
- Detailed changeset information (ID, ARN, status, timestamps)
- List of all changes in the changeset
- Error details if any changes failed
- Optional full JSON response display
- Interactive prompts for additional details

### 3. describe_changeset_simple.py
A simplified version of the describe changeset script without interactive prompts. Perfect for automation or quick status checks.

**Usage:**
```bash
PYTHONPATH=. python3 1_publishSaasProcuct/describe_changeset_simple.py <changeset_id>
```

**Output:**
- Changeset ID and status
- Success/failure indicators with emojis
- Product ID and Offer ID (when successful)
- Failure details (when failed)

## Configuration

### changeset.json
Defines the SaaS product and offer configuration:

- **Product Details:**
  - Title: "Sample Product 3264"
  - Category: Data Catalogs
  - 6 dimensions (3 entitled, 3 metered)
  - SaaS fulfillment URL

- **Offer Details:**
  - Contract pricing model
  - Multiple pricing tiers (1-month and 12-month)
  - Standard EULA
  - Support and renewal terms

- **Targeting:**
  - Limited to specific buyer account: `111111111111`

## Prerequisites

1. **AWS Credentials:** Ensure your AWS credentials are configured with appropriate permissions for AWS Marketplace Catalog API.

2. **Python Environment:** Use the virtual environment with required dependencies:
   ```bash
   source ../python_preview/pcapi/bin/activate
   ```

3. **Required Permissions:**
   - `aws-marketplace:StartChangeSet`
   - `aws-marketplace:DescribeChangeSet`
   - `aws-marketplace:ListChangeSets`

## Example Workflow

1. **Create the changeset:**
   ```bash
   PYTHONPATH=. python3 1_publishSaasProcuct/start_changeset.py
   ```
   
2. **Monitor progress:**
   ```bash
   PYTHONPATH=. python3 1_publishSaasProcuct/describe_changeset_simple.py <changeset_id>
   ```
   
3. **Get detailed information:**
   ```bash
   PYTHONPATH=. python3 1_publishSaasProcuct/describe_changeset.py <changeset_id>
   ```

## Changeset Status Values

- **PREPARING:** Changeset is being prepared
- **APPLYING:** Changes are being applied
- **SUCCEEDED:** All changes completed successfully
- **FAILED:** One or more changes failed
- **CANCELLED:** Changeset was cancelled

## Troubleshooting

### Common Issues

1. **ModuleNotFoundError: No module named 'utils'**
   - Ensure you're running from the `opportunityToOffer` directory
   - Set `PYTHONPATH=.` before running the script

2. **ModuleNotFoundError: No module named 'boto3'**
   - Activate the virtual environment: `source ../python_preview/pcapi/bin/activate`

3. **AccessDeniedException**
   - Check your AWS credentials and permissions
   - Ensure you have the required AWS Marketplace permissions

4. **ResourceNotFoundException**
   - Verify the changeset ID is correct
   - Check if the changeset exists in your AWS account

## Notes

- Changesets typically take 3-5 minutes to complete
- Product and Offer IDs are generated automatically by AWS
- The created product will be limited to the specified buyer accounts
- All changes in a changeset are atomic - they all succeed or all fail together