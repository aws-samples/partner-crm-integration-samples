# Bulk Create and Submit Opportunities

## Overview

`bulk_create_submit_opportunities.py` is an enhanced version of `bulk_create_opportunities.py` that not only creates opportunities but also automatically submits them for engagement with AWS.

## Features

- **Creates opportunities** from JSON files in the `opportunities/` directory
- **Automatically submits** each successfully created opportunity for engagement
- **Comprehensive logging** with separate log files for different outcomes:
  - `success.log` - Both creation and submission succeeded
  - `create_failed.log` - Opportunity creation failed
  - `submit_failed.log` - Opportunity created but submission failed

## Usage

```bash
# Activate the virtual environment
source pcapi/bin/activate

# Run the script
python src/bulk_create_opportunities/bulk_create_submit_opportunities.py
```

## How It Works

1. **Scans** the `opportunities/` directory for JSON files
2. For each file:
   - **Creates** an opportunity using the Partner Central API
   - If creation succeeds:
     - **Submits** the opportunity for engagement (Co-Sell with Full visibility)
     - Logs to `success.log` if both operations succeed
     - Logs to `submit_failed.log` if submission fails
   - If creation fails:
     - Logs to `create_failed.log`
     - Skips submission step
3. **Displays** a summary with counts of successful and failed operations

## Log Files

All log files are created in the `bulk_create_opportunities/` directory with timestamps and detailed error information.

### success.log
Contains:
- Source file path
- Opportunity ID
- Full create response
- Full submit response

### create_failed.log
Contains:
- Source file path
- Error details from the create API call

### submit_failed.log
Contains:
- Source file path
- Opportunity ID (from successful creation)
- Error details from the submit API call

## Example Output

```
========================================================================================
Bulk Create and Submit Opportunities
========================================================================================
Found 2 opportunity file(s) to process

Processing: src/bulk_create_opportunities/opportunities/opportunity_1.json
✓ Created Opportunity: O1234567
  ✓ Submitted Opportunity: O1234567

Processing: src/bulk_create_opportunities/opportunities/opportunity_2.json
✓ Created Opportunity: O7654321
  ✗ Failed to submit opportunity O7654321: ...

========================================================================================
SUMMARY
========================================================================================
Total Processed:     2
✓ Fully Successful:  1
✗ Create Failed:     0
✗ Submit Failed:     1
========================================================================================
```

## Differences from bulk_create_opportunities.py

| Feature | bulk_create_opportunities.py | bulk_create_submit_opportunities.py |
|---------|------------------------------|-------------------------------------|
| Creates opportunities | ✓ | ✓ |
| Submits opportunities | ✗ | ✓ |
| Separate error logging | ✗ | ✓ |
| Success logging | ✗ | ✓ |
| Summary statistics | ✗ | ✓ |

## Configuration

The script uses the following settings:
- **Catalog**: Uses `CATALOG_TO_USE` from `utils/constants.py` (typically "Sandbox")
- **Involvement Type**: Co-Sell
- **Visibility**: Full
- **Region**: us-east-1

## Error Handling

The script handles errors gracefully:
- API errors are caught and logged with full details
- Processing continues even if individual opportunities fail
- Each opportunity is processed independently
- A 1-second delay between requests prevents rate limiting

## Requirements

- AWS credentials configured
- Partner Central API access
- Python 3.x with boto3
- Virtual environment with required dependencies
