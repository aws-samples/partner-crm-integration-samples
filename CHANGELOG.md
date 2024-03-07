# Changelog

All notable changes to the AWS Partner CRM Integration Samples project will be documented in this file.

## [14.3] - 2024-03-07
- Five State values were missing on the CSV format of the field definitions but were available in the Excel. Corrected the CSV to add Palau, American Samoa, Northern Mariance Islands, Marshall Islands
- Removed the Opportunity-Filed.xlsx and Opportunity-StandardValues.xlsx which were same as Opportunity-Filed.csv and Opportunity-StandardValues.csv. This is to reduce the discrepancies if any. Same with Lead-Fields.xlsx and Lead-StandardValues.xlsx. Going forward we will maintain the CSV files only.
- Updated the Readme and Changelogs


## [14.3] - 2024-02-15
- Updated changelog with historical changes
- 2/15 Added two files - CSV and XLSX formats of the file showing the mapping between AWS Partner Central API fields to S3 based integration fields.
- 1/28 Fixed the issue in Finalized Deployment "Needs" to "Need"
- 1/19 Inserted a column that shows whether the values are mandatory, conditionally mandatory or optional on outbound payload. Insert another column that indicates the conditions when a field is conditionally mandatory on outbound payload.
- 1/19 Standard Values: Updated the change in the Migration acceleration program value
Fields: Refined the wording for the description of solutionOffer
- 1/9 Added file For the list of countries in this file, AWS does not store Postal Code.

## [14.3] - 2023-12-06
- Added Opportunity-FieldsAndStandardValues-DiffWithPrevVersion-V14.3 to help partners get the diff with previous versions.

## [14.2] - 2023-12-04
- Added Resource folder with AWS Products.json

## [14] - 2023-11-13
As part of the [Enhanced co-sell experience for AWS Partners](https://aws.amazon.com/new/about-aws/whats-new/2023/11/enhanced-co-sell-experience-aws-partners/), released the development kit for AWS Partner CRM Integration on Github.

### Added

- `Opportunity - StandardValues.csv`: Standard values for opportunity fields in CSV format.
- `Opportunity - StandardValues.xlsx`: Standard values for opportunity fields in Excel format.
- `Opportunity-Create-Inbound-Sample.json`: A JSON sample for creating an opportunity in the CRM.
- `Opportunity-Fields.csv`: Field details for opportunities in CSV format.
- `Opportunity-Fields.xlsx`: Field details for opportunities in Excel format.
- `Opportunity-Outbound-Sample.json`: A JSON sample representing an opportunity sent from the CRM.
- `Opportunity-Results_With-Errors-Sample.json`: A JSON sample showing the results of an opportunity sync with errors.
- `Opportunity-Results-Success-Sample.json`: A JSON sample showing the results of a successful opportunity sync.
- `Sample AWSProductsAndSolutions.xlsx`: An Excel spreadsheet listing sample AWS products and solutions.
- `SamplePartnerSolutions.csv`: A CSV file listing sample partner solutions.
- `SampleAWSProducts.csv`: A CSV file listing sample AWS products.
- `Leads-Fields.xlsx`: An Excel spreadsheet detailing the lead fields for mapping purposes.
- `Lead - StandardValues.csv`: Standard values for lead fields in CSV format.
- `Lead - StandardValues.xlsx`: Standard values for lead fields in Excel format.
- `Lead-Outbound-Sample.json`: A JSON sample representing a lead sent from the CRM.
- `Lead-Results_With-Errors-Sample.json`: A JSON sample showing the results of a lead sync with errors.
- `Lead-Results-Success-Sample.json`: A JSON sample showing the results of a successful lead sync.
- `Lead-Update-Inbound-Sample.json`: A JSON sample for updating a lead in the CRM.
- `Leads-Fields.csv`: Field details for leads in CSV format.
- `SFDC apex s3 sample.txt`: A Salesforce Apex code sample for integrating with Amazon S3.
- `ace_read_s3.py`: A Python script for reading files from Amazon S3.
- `Apex_get_files_from_s3_ace_partner_test.cls`: An Apex code snippet for retrieving files from an S3 bucket for ACE partners.
- `Apex_Sample_REST_API_Code.cls`: A Salesforce Apex sample for making REST API calls.
- `s3_ace_partner_test.cls`: An Apex code snippet for testing Amazon S3 integration with ACE partners.
- `S3_Authentication.cls`: An Apex snippet for authenticating with Amazon S3.
- `Sample_AceOutboundBatch.cls`: An Apex code snippet for handling outbound batch processing with ACE.

### Changed

### Deprecated

### Removed

### Fixed

### Security

[v14]: https://github.com/aws-samples/aws-partner-crm-integration-samples/releases/tag/v14
[v14.2]: https://github.com/aws-samples/aws-partner-crm-integration-samples/releases/tag/v14.2
[v14.3]: https://github.com/aws-samples/aws-partner-crm-integration-samples/releases/tag/v14.3
