# OpportunityToOffer Utils

This directory contains utility modules for the opportunityToOffer workflow, including configuration management and template processing.

## Files

### config.py
Central configuration file that holds dynamic values used across different scripts.

**Configuration Variables:**
- `BUYER_ID`: AWS account ID of the buyer (default: "111111111111")
- `PRODUCT_ID`: Product ID (updated after product creation)
- `EXPIRY_DATE`: Offer expiry date (today + 7 days, format: YYYY-MM-DD)
- `CONTRACT_DURATION_MONTHS`: Contract duration in ISO 8601 format (default: "P12M")
- `CHARGE_DATE_1`: First charge date (same as EXPIRY_DATE)
- `CHARGE_DATE_2`: Second charge date (today + 14 days, format: YYYY-MM-DD)

**Functions:**
- `get_config()`: Returns configuration dictionary
- `update_product_id(new_id)`: Updates the PRODUCT_ID
- `print_config()`: Displays current configuration

**Usage:**
```python
from utils.config import get_config, print_config
config = get_config()
print_config()
```

### template_processor.py
Processes JSON template files by replacing placeholder variables with actual configuration values.

**Template Variable Format:**
Use `{{VARIABLE_NAME}}` in JSON files to mark placeholders.

**Functions:**
- `replace_template_variables(content, config_vars)`: Replace variables in text content
- `process_changeset_template(template_file_path)`: Process a changeset template file
- `save_processed_changeset(template_path, output_path)`: Save processed template to file
- `validate_template_variables(content)`: Validate template has all required variables

**Usage:**
```python
from utils.template_processor import process_changeset_template
processed = process_changeset_template('changeset_template.json')
```

### test_config.py
Test script to validate configuration and template processing functionality.

**Features:**
- Validates date formats
- Tests template variable replacement
- Checks for missing template variables
- Provides comprehensive test results

**Usage:**
```bash
PYTHONPATH=. python3 utils/test_config.py
```

## Template Usage

### Creating Templates
1. Create JSON files with placeholder variables using `{{VARIABLE_NAME}}` syntax
2. Supported variables: `BUYER_ID`, `PRODUCT_ID`, `EXPIRY_DATE`, `CONTRACT_DURATION_MONTHS`, `CHARGE_DATE_1`, `CHARGE_DATE_2`

### Example Template
```json
{
  "PositiveTargeting": {
    "BuyerAccounts": ["{{BUYER_ID}}"]
  },
  "AvailabilityEndDate": "{{EXPIRY_DATE}}",
  "Duration": "{{CONTRACT_DURATION_MONTHS}}"
}
```

### Processing Templates
Templates are automatically processed when using the updated scripts:
- `1_publishSaasProcuct/start_changeset.py` uses `changeset_template.json`
- `2_createPrivateOffer/changeset.json` already contains template variables

## Configuration Management

### Dynamic Date Calculation
Dates are calculated dynamically based on the current date:
- `EXPIRY_DATE`: Today + 7 days
- `CHARGE_DATE_1`: Same as EXPIRY_DATE
- `CHARGE_DATE_2`: Today + 14 days

### Updating Configuration
To modify configuration values:

```python
from utils.config import update_product_id, CONFIG_VARS

# Update product ID after creation
update_product_id("prod-new123456")

# Or modify directly
CONFIG_VARS["BUYER_ID"] = "123456789012"
```

## Integration with Scripts

### Modified Scripts
The following scripts have been updated to use the configuration system:

1. **1_publishSaasProcuct/start_changeset.py**
   - Uses `changeset_template.json` if available
   - Falls back to `changeset.json` if template not found
   - Displays configuration before execution
   - Processes templates automatically

### Template Files
1. **1_publishSaasProcuct/changeset_template.json**
   - Template version of the SaaS product changeset
   - Uses `{{BUYER_ID}}` and `{{CONTRACT_DURATION_MONTHS}}`

2. **2_createPrivateOffer/changeset.json**
   - Already contains template variables
   - Uses all configuration variables

## Error Handling

### Common Issues
1. **Missing Template Variables**: Use `validate_template_variables()` to check
2. **Invalid Date Formats**: Dates must be in YYYY-MM-DD format
3. **Import Errors**: Ensure PYTHONPATH includes the opportunityToOffer directory

### Validation
Run the test script to validate everything is working:
```bash
PYTHONPATH=. python3 utils/test_config.py
```

## Example Workflow

1. **Check Configuration**:
   ```bash
   PYTHONPATH=. python3 utils/config.py
   ```

2. **Test Template Processing**:
   ```bash
   PYTHONPATH=. python3 utils/test_config.py
   ```

3. **Create SaaS Product** (uses template):
   ```bash
   PYTHONPATH=. python3 1_publishSaasProcuct/start_changeset.py
   ```

4. **Update Product ID** (after product creation):
   ```python
   from utils.config import update_product_id
   update_product_id("prod-abc123def456")
   ```

5. **Create Private Offer** (uses updated config):
   ```bash
   PYTHONPATH=. python3 2_createPrivateOffer/start_changeset.py
   ```

## Notes

- All dates are in UTC and YYYY-MM-DD format
- Contract duration uses ISO 8601 duration format (P12M = 12 months)
- Template variables are case-sensitive
- Configuration is recalculated each time the module is imported
- Product ID should be updated after successful product creation