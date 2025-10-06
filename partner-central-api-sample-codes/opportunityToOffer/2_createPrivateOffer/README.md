# Create Private Offer

This folder contains scripts for creating private offers in AWS Marketplace using the AWS Marketplace Catalog API.

## Scripts

### 1. start_changeset.py
Creates a private offer with contract pricing and flexible payment schedule using the changeset defined in `changeset.json`.

**Usage:**
```bash
# From the opportunityToOffer directory
source ../python_preview/pcapi/bin/activate
PYTHONPATH=. python3 2_createPrivateOffer/start_changeset.py
```

**Features:**
- **Dynamic Configuration**: Uses values from `utils/config.py`
- **Template Processing**: Automatically replaces template variables in `changeset.json`
- **Configuration Display**: Shows current configuration before execution
- **Enhanced Output**: Provides helpful information about the created changeset

### 2. test_template.py
Test script to verify template processing without making actual API calls.

**Usage:**
```bash
PYTHONPATH=. python3 2_createPrivateOffer/test_template.py
```

## Configuration

### changeset.json
Defines the private offer configuration with template variables:

- **Template Variables Used:**
  - `{{PRODUCT_ID}}` - Product ID from configuration
  - `{{BUYER_ID}}` - Target buyer account ID
  - `{{EXPIRY_DATE}}` - Offer expiry date (today + 7 days)
  - `{{CONTRACT_DURATION_MONTHS}}` - Contract duration (P12M)
  - `{{CHARGE_DATE_1}}` - First payment date (same as expiry date)
  - `{{CHARGE_DATE_2}}` - Second payment date (today + 14 days)

- **Offer Details:**
  - Name: "Demo Private Offer"
  - Contract pricing model with fixed upfront and usage-based terms
  - Standard EULA
  - Flexible payment schedule
  - 12-month validity term

## Prerequisites

1. **Product ID**: Ensure the `PRODUCT_ID` in `utils/config.py` points to a valid SaaS product
2. **AWS Credentials**: Configure with appropriate AWS Marketplace permissions
3. **Python Environment**: Use the virtual environment with required dependencies

## Example Workflow

1. **Update Product ID** (if needed):
   ```python
   from utils.config import update_product_id
   update_product_id("prod-your-product-id")
   ```

2. **Test Template Processing**:
   ```bash
   PYTHONPATH=. python3 2_createPrivateOffer/test_template.py
   ```

3. **Create Private Offer**:
   ```bash
   PYTHONPATH=. python3 2_createPrivateOffer/start_changeset.py
   ```

4. **Monitor Progress**:
   ```bash
   PYTHONPATH=. python3 1_publishSaasProcuct/describe_changeset.py <changeset_id>
   ```

## Template Variables

The `changeset.json` file uses the following template variables that are automatically replaced:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `{{PRODUCT_ID}}` | SaaS product identifier | `prod-45becev5xgcru` |
| `{{BUYER_ID}}` | Target buyer account ID | `111111111111` |
| `{{EXPIRY_DATE}}` | Offer expiry date | `2025-10-12` |
| `{{CONTRACT_DURATION_MONTHS}}` | Contract duration | `P12M` |
| `{{CHARGE_DATE_1}}` | First payment date | `2025-10-12` |
| `{{CHARGE_DATE_2}}` | Second payment date | `2025-10-19` |

## Error Handling

### Common Issues

1. **Product Not Found**: Ensure the `PRODUCT_ID` exists and you have access
2. **Access Denied**: Check AWS permissions for the specified product
3. **Template Processing Errors**: Verify all template variables are defined in config

### Troubleshooting

- Use `test_template.py` to verify template processing before API calls
- Check configuration with `python3 utils/config.py`
- Validate changeset structure with JSON validators

## Notes

- Private offers are targeted to specific buyer accounts
- Payment schedule allows flexible billing arrangements
- All template variables are dynamically calculated based on current date
- The offer includes both fixed upfront and usage-based pricing terms