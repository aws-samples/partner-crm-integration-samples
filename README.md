# AWS Partner CRM Integration Samples

Welcome to the AWS Partner CRM Integration Samples repository. This repository contains a collection of sample files and code snippets designed to assist AWS partners in building custom integration solutions with AWS services. The samples are specifically tailored for integrating with Customer Relationship Management (CRM) systems.

## Repository Structure

The repository is organized into three main folders:

### opportunity-samples

This folder includes samples related to opportunities, such as standard value sets, field mappings, and sample JSON payloads for creating opportunities and processing outbound results:

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

### lead-samples

This folder contains samples related to leads, which include standard value sets, field mappings, and sample JSON payloads for managing lead data:

- `Leads-Fields.xlsx`: An Excel spreadsheet detailing the lead fields for mapping purposes.
- `Lead - StandardValues.csv`: Standard values for lead fields in CSV format.
- `Lead - StandardValues.xlsx`: Standard values for lead fields in Excel format.
- `Lead-Outbound-Sample.json`: A JSON sample representing a lead sent from the CRM.
- `Lead-Results_With-Errors-Sample.json`: A JSON sample showing the results of a lead sync with errors.
- `Lead-Results-Success-Sample.json`: A JSON sample showing the results of a successful lead sync.
- `Lead-Update-Inbound-Sample.json`: A JSON sample for updating a lead in the CRM.
- `Leads-Fields.csv`: Field details for leads in CSV format.

### code-snippets

This folder contains various code snippets for interacting with AWS services such as Amazon S3 and Salesforce (SFDC) Apex samples for AWS integration:

- `SFDC apex s3 sample.txt`: A Salesforce Apex code sample for integrating with Amazon S3.
- `ace_read_s3.py`: A Python script for reading files from Amazon S3.
- `Apex_get_files_from_s3_ace_partner_test.cls`: An Apex code snippet for retrieving files from an S3 bucket for ACE partners.
- `Apex_Sample_REST_API_Code.cls`: A Salesforce Apex sample for making REST API calls.
- `s3_ace_partner_test.cls`: An Apex code snippet for testing Amazon S3 integration with ACE partners.
- `S3_Authentication.cls`: An Apex snippet for authenticating with Amazon S3.
- `Sample_AceOutboundBatch.cls`: An Apex code snippet for handling outbound batch processing with ACE.

## Getting Started

To begin using these samples, clone the repository to your local machine or download the files directly from GitHub using the following command:

```bash
git clone https://github.com/aws-samples/aws-partner-crm-integration-samples.git
```
