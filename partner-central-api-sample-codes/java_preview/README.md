# Running the example project

## Minimum requirements
To run the SDK you will need Java 8 or newer. For more information about the requirements and optimum settings for the SDK, please see the Installing a [Java Development Environment](http://docs.aws.amazon.com/sdk-for-java/v2/developer-guide/setup-install.html##java-dg-java-env) section of the developer guide.
For information about how to install and use Maven, see http://maven.apache.org/.

## Configure [AWS credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html) in your environment. Or you can add to your .aws/credentials file.
```bash
export AWS_ACCESS_KEY_ID=<value from AWS access portal>
export AWS_SECRET_ACCESS_KEY=<value from AWS access portal>
export AWS_SESSION_TOKEN=<value from AWS access portal>
```

- The code example in the package shows how to use the Partner Central Selling SDK
- Make Sure to change inputs before submitting a test opportunity or else duplicate error will be thrown

## Run
```shell
mvn clean compile exec:java
```

### Example Create Opportunity Response output
```
Received successful response: 200, Request ID: 1deee4b0-aa97-40fc-99c5-1650acd43635, Extended Request ID: not available
Successfully created opportunity: CreateOpportunityResponse(Identifier=O2867813, LastModifiedDate=2024-02-08T03:26:39Z)
```
 Happy Coding..!