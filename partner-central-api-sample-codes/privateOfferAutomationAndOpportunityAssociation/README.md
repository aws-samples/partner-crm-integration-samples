# AWS Marketplace Opportunity to Offer Workflow

Complete workflow for creating SaaS products, private offers, and managing opportunities in AWS Marketplace and Partner Central.

## Quick Start

### 1. Environment Setup

```bash
# Automatic setup
./setup_env.sh

# Or manual setup
python3 -m venv .venv
source .venv/bin/activate
pip install boto3
```

### 2. Configure

Create required configuration files:

**config.json:**
```json
{
  "catalog": "Sandbox",
  "contract_duration_months": "P12M",
  "contract_duration_days": "P365D",
  "custom_eula_url": "https://s3.amazonaws.com/aws-mp-standard-contracts/Standard-Contact-for-AWS-Marketplace-2022-07-14.pdf",
  "offer_name": "Demo Private Offer",
  "offer_description": "Demo Private Offer Description"
}
```

**buyer_ids.txt:**
```
222222222222
111111111111
```

**shared_env.json:**
```json
{
  "PRODUCT_ID": "prod-xxxxxxxxxxxxx"
}
```

### 3. Run Workflow

```bash
# Activate environment
source .venv/bin/activate

# Step 1: Create SaaS Product
PYTHONPATH=. python 1_publishSaasProcuct/start_changeset.py

# Step 2: Create Private Offer
PYTHONPATH=. python 2_createPrivateOffer/start_changeset.py

# Step 3: Create Opportunity
PYTHONPATH=. python 3_createOpportunity/1_create_opportunity.py

# Step 4: Submit Opportunity
PYTHONPATH=. python 3_createOpportunity/4_start_engagement_from_opportunity_task.py
```

## Workflow Steps

### 1. Publish SaaS Product (`1_publishSaasProcuct/`)

Creates a SaaS product with Contract with Consumption pricing model.

**Scripts:**
- `start_changeset.py` - Create SaaS product and public offer
- `describe_changeset.py` - Monitor changeset progress
- `describe_product.py` - Get product details

**Template:**
- `changeset.json` - Product configuration with template variables

**Usage:**
```bash
PYTHONPATH=. python 1_publishSaasProcuct/start_changeset.py
```

### 2. Create Private Offer (`2_createPrivateOffer/`)

Creates a private offer for specific buyer accounts.

**Scripts:**
- `start_changeset.py` - Create private offer
- `describe_changeset.py` - Monitor changeset progress
- `describe_offer.py` - Get offer details

**Template:**
- `changeset.json` - Offer configuration with template variables

**Usage:**
```bash
PYTHONPATH=. python 2_createPrivateOffer/start_changeset.py
```

### 3. Create Opportunity (`3_createOpportunity/`)

Creates and manages opportunities in Partner Central.

**Scripts:**
- `1_create_opportunity.py` - Create opportunity
- `2_list_solutions.py` - List available solutions
- `3_associate_opportunity.py` - Associate offer with opportunity
- `4_start_engagement_from_opportunity_task.py` - Submit opportunity

**Usage:**
```bash
# Create opportunity
PYTHONPATH=. python 3_createOpportunity/1_create_opportunity.py

# Submit for engagement
PYTHONPATH=. python 3_createOpportunity/4_start_engagement_from_opportunity_task.py
```

### 4. Associate Offer to Opportunity (`4_associatePrivateOfferToOpportunity/`)

Links private offers to opportunities.

**Usage:**
```bash
PYTHONPATH=. python 4_associatePrivateOfferToOpportunity/associate_opportunity.py
```

### 5. Buyer Accepts Offer (`5_buyerAcceptPrivateOffer/`)

Search for agreements after buyer accepts the offer.

**Usage:**
```bash
PYTHONPATH=. python 5_buyerAcceptPrivateOffer/search_agreements_by_offer_id.py
```

### 6. Update Opportunity (`6_updateOpportunity/`)

Update opportunity status to committed after buyer acceptance.

**Usage:**
```bash
PYTHONPATH=. python 6_updateOpportunity/update_opportunity_to_committed.py
```

## Configuration

### Configuration Files

| File | Purpose | Required |
|------|---------|----------|
| `config.json` | Main configuration (catalog, durations, URLs) | Yes |
| `buyer_ids.txt` | Buyer account IDs (one per line) | Yes |
| `shared_env.json` | Product ID and other shared variables | Yes |

### Configuration Variables

**From config.json:**
- `catalog` - Catalog name ("Sandbox" or "Production")
- `contract_duration_months` - Contract duration (e.g., "P12M")
- `contract_duration_days` - Day-level duration (e.g., "P365D")
- `custom_eula_url` - Custom EULA URL
- `offer_name` - Offer name
- `offer_description` - Offer description

**From buyer_ids.txt:**
- List of buyer AWS account IDs

**From shared_env.json:**
- `PRODUCT_ID` - AWS Marketplace product ID
- `OPPORTUNITY_ID` - Partner Central opportunity ID

**Dynamically Calculated:**
- `EXPIRY_DATE` - Today + 7 days
- `CHARGE_DATE_1` - Same as EXPIRY_DATE
- `CHARGE_DATE_2` - Today + 14 days

### Using Configuration in Python

```python
from utils import config

# Access values
catalog = config.CATALOG
product_id = config.PRODUCT_ID
buyer_ids = config.BUYER_IDS

# Update values
config.update_product_id("prod-newid")
config.set_offer_info("New Name", "New Description")
config.set_buyer_ids(["123456789012", "987654321098"])
```

### Command Line Product ID

Pass product ID as command line argument:

```bash
python script.py prod-xxxxxxxxxxxxx
```

## Template Variables

All changeset templates support these variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{PRODUCT_ID}}` | Product ID | `prod-45becev5xgcru` |
| `{{BUYER_IDS}}` | Array of buyer account IDs | `["222222222222"]` |
| `{{CATALOG}}` | Catalog name | `Sandbox` |
| `{{CONTRACT_DURATION_MONTHS}}` | Contract duration | `P12M` |
| `{{CONTRACT_DURATION_DAYS}}` | Day-level duration | `P365D` |
| `{{EXPIRY_DATE}}` | Offer expiry date | `2025-11-16` |
| `{{CHARGE_DATE_1}}` | First payment date | `2025-11-16` |
| `{{CHARGE_DATE_2}}` | Second payment date | `2025-11-23` |
| `{{CUSTOM_EULA_URL}}` | EULA URL | `https://...` |
| `{{OFFER_NAME}}` | Offer name | `Demo Private Offer` |
| `{{OFFER_DESCRIPTION}}` | Offer description | `Demo Description` |

## Utilities (`utils/`)

Helper modules for configuration and template processing:

- `config.py` - Configuration management
- `template_processor.py` - Template variable replacement
- `update_product_id.py` - Update product ID utility
- `test_config.py` - Configuration validation

## Running Scripts

### Method 1: With activated environment
```bash
source .venv/bin/activate
python 1_publishSaasProcuct/start_changeset.py
```

### Method 2: Direct execution
```bash
.venv/bin/python 1_publishSaasProcuct/start_changeset.py
```

### Method 3: With PYTHONPATH
```bash
PYTHONPATH=. python 1_publishSaasProcuct/start_changeset.py
```

## Error Handling

### Missing Configuration
```
FileNotFoundError: Configuration file not found at .../config.json
```
**Solution:** Create `config.json` with required fields

### Missing Product ID
```
ValueError: PRODUCT_ID not found. Please provide it via:
  1. Command line argument (e.g., prod-xxxxx), or
  2. Set PRODUCT_ID in shared_env.json
```
**Solution:** Set PRODUCT_ID in `shared_env.json` or pass as command line argument

### Missing Buyer IDs
```
FileNotFoundError: buyer_ids.txt not found
```
**Solution:** Create `buyer_ids.txt` with at least one buyer account ID

## Best Practices

1. **Never commit sensitive data** - Add `buyer_ids.txt` and `shared_env.json` to `.gitignore`
2. **Use Sandbox first** - Test in Sandbox catalog before Production
3. **Validate configuration** - Run `python utils/config.py` to verify setup
4. **Monitor changesets** - Use `describe_changeset.py` to track progress
5. **Keep buyer IDs updated** - Regularly review and update buyer account IDs

## Troubleshooting

### Configuration not loading
- Verify all required files exist
- Check JSON syntax in config files
- Ensure file permissions are readable

### Product ID not found
- Check `shared_env.json` contains `PRODUCT_ID`
- Verify product ID format starts with `prod-`
- Or pass as command line argument

### Template processing errors
- Verify all template variables are defined
- Check for typos in variable names
- Use `test_config.py` to validate

### AWS API errors
- Verify AWS credentials are configured
- Check IAM permissions for AWS Marketplace
- Ensure product/offer IDs are valid

## Testing Configuration

```bash
# Test configuration loading
PYTHONPATH=. python utils/config.py

# Test with command line product ID
PYTHONPATH=. python utils/config.py prod-test123

# Validate template processing
PYTHONPATH=. python utils/test_config.py
```

## Complete Example Workflow

```bash
# 1. Setup environment
./setup_env.sh
source .venv/bin/activate

# 2. Configure
cat > config.json << EOF
{
  "catalog": "Sandbox",
  "contract_duration_months": "P12M",
  "offer_name": "My Private Offer"
}
EOF

echo "222222222222" > buyer_ids.txt

# 3. Create product
PYTHONPATH=. python 1_publishSaasProcuct/start_changeset.py

# 4. Monitor product creation
PYTHONPATH=. python 1_publishSaasProcuct/describe_changeset.py <changeset_id>

# 5. Create private offer
PYTHONPATH=. python 2_createPrivateOffer/start_changeset.py

# 6. Create opportunity
PYTHONPATH=. python 3_createOpportunity/1_create_opportunity.py

# 7. Submit opportunity
PYTHONPATH=. python 3_createOpportunity/4_start_engagement_from_opportunity_task.py
```

## Automated Testing

### End-to-End Workflow Test

Run the complete workflow automatically with `test_workflow.py`:

```bash
# Activate environment
source .venv/bin/activate

# Run automated workflow test
python test_workflow.py
```

**Features:**
- Executes all 6 workflow steps automatically
- Polls changeset status until completion
- Saves progress to `shared_env.json`
- Logs all actions to `workflow.TIMESTAMP.log`
- Stops on first failure with detailed error logs

**See [TEST_WORKFLOW.md](TEST_WORKFLOW.md) for complete documentation.**

## Support

For issues or questions:
1. Check error messages for specific guidance
2. Verify configuration files are properly formatted
3. Review AWS Marketplace documentation
4. Check AWS credentials and permissions
5. Review workflow logs in `workflow.*.log` files
