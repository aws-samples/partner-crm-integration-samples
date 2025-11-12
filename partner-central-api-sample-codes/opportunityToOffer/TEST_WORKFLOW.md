# End-to-End Workflow Testing

## Overview

`test_workflow.py` is an automated testing script that executes the complete AWS Marketplace Opportunity to Offer workflow from start to finish.

## What It Does

The script automates these steps:

1. **Create SaaS Product** - Creates a product with Contract with Consumption pricing
2. **Create Private Offer** - Creates a private offer for the product
3. **Create Opportunity** - Creates and submits an opportunity in Partner Central
4. **Associate Offer** - Links the private offer to the opportunity
5. **Search Agreement** - Verifies buyer acceptance (simulated)
6. **Update to Committed** - Marks opportunity as committed

## Prerequisites

1. **Environment Setup**:
   ```bash
   ./setup_env.sh
   source .venv/bin/activate
   ```

2. **Configuration Files**:
   - `config.json` - Main configuration
   - `buyer_ids.txt` - Buyer account IDs
   - `shared_env.json` - Will be created/updated by the script

3. **AWS Credentials**: Configured with appropriate permissions

## Usage

### Basic Usage

```bash
# Activate environment
source .venv/bin/activate

# Run the workflow test
python test_workflow.py
```

### With Custom Python

```bash
.venv/bin/python test_workflow.py
```

## Features

### Automatic Status Polling

The script automatically polls changeset status:
- Checks every 10 seconds
- Maximum 60 attempts (10 minutes)
- Continues on SUCCESS
- Stops on FAILURE

### Comprehensive Logging

All actions are logged to `workflow.TIMESTAMP.log`:
- Timestamps for all operations
- Request/response details
- Error messages and stack traces
- Final status summary

### State Management

Progress is saved to `shared_env.json`:
- `PRODUCT_ID` - Created product ID
- `PRODUCT_CHANGESET_ID` - Product changeset ID
- `OFFER_ID` - Created offer ID
- `OFFER_ARN` - Offer ARN
- `OFFER_CHANGESET_ID` - Offer changeset ID
- `OPPORTUNITY_ID` - Created opportunity ID

### Error Handling

- Stops on first failure
- Logs complete error details
- Saves failed changeset responses
- Returns appropriate exit codes

## Output

### Console Output

```
================================================================================
AWS MARKETPLACE OPPORTUNITY TO OFFER WORKFLOW TEST
================================================================================
Log file: /path/to/workflow.20251109_220000.log
Start time: 2025-11-09 22:00:00

================================================================================
STEP 1: Create SaaS Product
================================================================================
Running: python 1_publishSaasProcuct/start_changeset.py
...
✓ Changeset succeeded!
Product ID: prod-xxxxxxxxxxxxx

================================================================================
STEP 2: Create Private Offer
================================================================================
...
```

### Log File

Detailed log saved to `workflow.TIMESTAMP.log`:
- All script outputs
- Status checks
- Error details
- JSON responses

### Shared Environment

Updated `shared_env.json`:
```json
{
  "PRODUCT_ID": "prod-xxxxxxxxxxxxx",
  "PRODUCT_CHANGESET_ID": "changeset-id-1",
  "OFFER_ID": "offer-xxxxxxxxxxxxx",
  "OFFER_ARN": "arn:aws:aws-marketplace:...",
  "OFFER_CHANGESET_ID": "changeset-id-2",
  "OPPORTUNITY_ID": "O1234567"
}
```

## Workflow Steps Detail

### Step 1: Create SaaS Product

1. Runs `1_publishSaasProcuct/start_changeset.py`
2. Extracts changeset ID
3. Polls `describe_changeset.py` until SUCCEEDED/FAILED
4. Extracts and saves product ID to `shared_env.json`

### Step 2: Create Private Offer

1. Reads product ID from `shared_env.json`
2. Runs `2_createPrivateOffer/start_changeset.py`
3. Extracts changeset ID
4. Polls `describe_changeset.py` until SUCCEEDED/FAILED
5. Runs `describe_offer.py` to get offer details
6. Saves offer ID and ARN to `shared_env.json`

### Step 3: Create and Submit Opportunity

1. Runs `1_create_opportunity.py` - Creates opportunity
2. Validates opportunity ID (starts with 'O')
3. Runs `2_list_solutions.py` - Lists available solutions
4. Runs `3_associate_opportunity.py` - Associates solution
5. Runs `4_start_engagement_from_opportunity_task.py` - Submits
6. Runs `aws_simulate_approval_update_opportunity.py` - Simulates approval

### Step 4: Associate Offer to Opportunity

1. Runs `associate_opportunity.py` - Links offer to opportunity
2. Runs `get_opportunity.py` (if exists) - Verifies association

### Step 5: Search for Agreement

1. Runs `search_agreements_by_offer_id.py` with offer ID
2. Checks for ACTIVE status
3. Continues even if not ACTIVE (buyer acceptance required)

### Step 6: Update to Committed

1. Runs `update_opportunity_to_committed.py`
2. Updates opportunity status to committed

## Configuration

### Polling Settings

Edit in `test_workflow.py`:
```python
POLL_INTERVAL = 10  # seconds between polls
MAX_POLL_ATTEMPTS = 60  # maximum attempts (10 minutes)
```

### Log File Location

Logs are saved to:
```
workflow.YYYYMMDD_HHMMSS.log
```

## Exit Codes

- `0` - Success
- `1` - Failure
- `130` - Interrupted by user (Ctrl+C)

## Troubleshooting

### Script Fails at Step 1

**Issue**: Product creation fails

**Solutions**:
- Check AWS credentials
- Verify `config.json` is valid
- Check `buyer_ids.txt` exists
- Review log file for API errors

### Script Fails at Step 2

**Issue**: Private offer creation fails

**Solutions**:
- Verify product ID in `shared_env.json`
- Check product is in SUCCEEDED state
- Review changeset template

### Script Fails at Step 3

**Issue**: Opportunity creation fails

**Solutions**:
- Check Partner Central permissions
- Verify catalog is "Sandbox"
- Review opportunity JSON template

### Changeset Timeout

**Issue**: Changeset doesn't complete in 10 minutes

**Solutions**:
- Increase `MAX_POLL_ATTEMPTS`
- Check AWS Marketplace service status
- Review changeset for errors

### Agreement Not ACTIVE

**Issue**: Step 5 shows agreement not ACTIVE

**Note**: This is expected - buyer must accept offer
- Script continues anyway for testing
- In production, buyer acceptance is required

## Best Practices

1. **Test in Sandbox First**: Always use Sandbox catalog for testing
2. **Review Logs**: Check log files after each run
3. **Clean Up**: Remove test products/offers after testing
4. **Monitor Progress**: Watch console output during execution
5. **Save Logs**: Keep logs for troubleshooting

## Example Run

```bash
# Setup
cd opportunityToOffer
source .venv/bin/activate

# Verify configuration
cat config.json
cat buyer_ids.txt

# Run workflow test
python test_workflow.py

# Check results
cat workflow.*.log
cat shared_env.json
```

## Advanced Usage

### Resume from Specific Step

Manually edit `shared_env.json` to skip completed steps:
```json
{
  "PRODUCT_ID": "prod-existing",
  "OFFER_ID": "offer-existing"
}
```

### Custom Logging

Modify `WorkflowLogger` class to change log format or destination.

### Add Custom Steps

Extend `WorkflowExecutor` class with additional step methods.

## Limitations

1. **Sequential Execution**: Steps run one at a time
2. **No Rollback**: Failed steps don't clean up resources
3. **Buyer Acceptance**: Step 5 requires manual buyer action in production
4. **Sandbox Only**: Designed for Sandbox catalog testing

## Support

For issues:
1. Check log file for detailed errors
2. Verify all configuration files
3. Review AWS Marketplace documentation
4. Check AWS service health dashboard
