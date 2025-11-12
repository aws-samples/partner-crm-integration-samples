# bulk_create_submit_opportunities.py - Implementation Summary

## What Was Created

A new Python script that extends the functionality of `bulk_create_opportunities.py` to not only create opportunities but also automatically submit them for AWS engagement.

## Key Features

### 1. Two-Step Process
- **Step 1**: Create opportunity from JSON file
- **Step 2**: Submit opportunity for engagement (if creation succeeds)

### 2. Comprehensive Logging
Three separate log files track different outcomes:

- **`success.log`**: Both creation and submission succeeded
  - Contains: file path, opportunity ID, full create response, full submit response
  
- **`create_failed.log`**: Opportunity creation failed
  - Contains: file path, error details
  - Submission is skipped when creation fails
  
- **`submit_failed.log`**: Creation succeeded but submission failed
  - Contains: file path, opportunity ID, error details

### 3. Visual Feedback
- ✓ symbols for successful operations
- ✗ symbols for failed operations
- Summary statistics at the end

### 4. Error Handling
- Graceful error handling with try-catch blocks
- Each opportunity processed independently
- Processing continues even if individual opportunities fail
- 1-second delay between requests to avoid rate limiting

## Code Structure

```python
# Main functions:
- log_to_file()                          # Writes timestamped logs
- create_opportunity()                   # Creates opportunity, returns (response, error)
- start_engagement_from_opportunity_task() # Submits opportunity, returns (response, error)
- process_opportunity_file()             # Orchestrates create + submit + logging
- usage_demo()                           # Main entry point
```

## Configuration

- **Service**: partnercentral-selling
- **Region**: us-east-1
- **Catalog**: From `CATALOG_TO_USE` constant (typically "Sandbox")
- **Engagement Settings**:
  - InvolvementType: "Co-Sell"
  - Visibility: "Full"
  - ClientToken: Auto-generated UUID for each submission

## Usage Example

```bash
cd partner-central-api-sample-codes/python_preview
source pcapi/bin/activate
python src/bulk_create_opportunities/bulk_create_submit_opportunities.py
```

## Output Example

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

## Log File Format

### Timestamp Format
```
[2025-11-09T16:34:11.990230] <log content>
```

### Entry Separator
```
--------------------------------------------------------------------------------
```

## Dependencies

- boto3 (AWS SDK)
- Standard library: json, uuid, datetime, logging, os, sys, time
- Custom modules: utils.helpers, utils.stringify_details, utils.constants

## Error Scenarios Handled

1. **Creation Failure**: Logged to `create_failed.log`, submission skipped
2. **Submission Failure**: Logged to `submit_failed.log`, opportunity ID preserved
3. **Both Success**: Logged to `success.log` with full details
4. **No Files Found**: Graceful exit with message
5. **API Errors**: Caught via ClientError exception

## Testing Notes

The script was tested with the existing opportunity JSON files which had validation errors (invalid CompetitorName enum value). The script correctly:
- Detected the validation errors
- Logged them to `create_failed.log`
- Displayed appropriate error messages
- Generated a summary showing 2 create failures

## Files Created

1. `bulk_create_submit_opportunities.py` - Main script (175 lines)
2. `README_BULK_SUBMIT.md` - User documentation
3. `SCRIPT_SUMMARY.md` - This technical summary

## Comparison with Original Script

| Aspect | bulk_create_opportunities.py | bulk_create_submit_opportunities.py |
|--------|------------------------------|-------------------------------------|
| Lines of code | ~60 | ~175 |
| Creates opportunities | Yes | Yes |
| Submits opportunities | No | Yes |
| Error logging | No | Yes (3 separate files) |
| Success logging | No | Yes |
| Summary statistics | No | Yes |
| Visual indicators | No | Yes (✓/✗) |
| Timestamp logging | No | Yes |
| Error categorization | No | Yes (create vs submit) |
