import React from 'react';
import {
  Container,
  Header,
  ColumnLayout,
  Box,
  Link,
  Button,
} from "@cloudscape-design/components";

function CustomerDetails({ opportunity }) {
  return (
    <>
      {/* Customer Details Section */}
      <Container
        header={
          <Header variant="h2">
            Customer details
          </Header>
        }
      >
        <ColumnLayout columns={2} variant="text-grid">
          {/* Left Column */}
          <div>
            <Box variant="awsui-key-label">
              Customer data universal number system (DUNS)
            </Box>
            <Box>{opportunity?.Customer?.Account?.Duns || '-'}</Box>

            <Box variant="awsui-key-label">Industry vertical</Box>
            <Box>{opportunity?.Customer?.Account?.Industry || '-'}</Box>

            <Box variant="awsui-key-label">Address</Box>
            <Box>
              {opportunity?.Customer?.Account?.Address?.StreetAddress || '-'}
              <br />
              {opportunity?.Customer?.Account?.Address?.City || ''}, {opportunity?.Customer?.Account?.Address?.StateOrRegion || ''} {opportunity?.Customer?.Account?.Address?.PostalCode || ''}
              <br />
              {opportunity?.Customer?.Account?.Address?.CountryCode || ''}
            </Box>
          </div>

          {/* Right Column */}
          <div>
            <Box variant="awsui-key-label">Customer company name</Box>
            <Box>{opportunity?.Customer?.Account?.CompanyName || '-'}</Box>

            <Box variant="awsui-key-label">Customer website</Box>
            <Box>
              {opportunity?.Customer?.Account?.WebsiteUrl ? (
                <Link href={opportunity.Customer.Account.WebsiteUrl} external>
                  {opportunity.Customer.Account.WebsiteUrl.replace(/^https?:\/\//, '')}
                </Link>
              ) : '-'}
            </Box>
          </div>
        </ColumnLayout>
      </Container>

      {/* Customer Contact Details Section */}
      <Container
        header={
          <Header variant="h2">
            Customer and user contact details
          </Header>
        }
      >
        <ColumnLayout columns={2} variant="text-grid">
          {/* Left Column */}
          <div>
            <Box variant="awsui-key-label">Customer first name</Box>
            <Box>{opportunity?.Customer?.Contacts?.[0]?.FirstName || '-'}</Box>

            <Box variant="awsui-key-label">Customer title</Box>
            <Box>{opportunity?.Customer?.Contacts?.[0]?.BusinessTitle || '-'}</Box>

            <Box variant="awsui-key-label">Customer email</Box>
            <Box>
              {opportunity?.Customer?.Contacts?.[0]?.Email ? (
                <Link href={`mailto:${opportunity.Customer.Contacts[0].Email}`}>
                  {opportunity.Customer.Contacts[0].Email}
                </Link>
              ) : '-'}
            </Box>
          </div>

          {/* Right Column */}
          <div>
            <Box variant="awsui-key-label">Customer last name</Box>
            <Box>{opportunity?.Customer?.Contacts?.[0]?.LastName || '-'}</Box>

            <Box variant="awsui-key-label">Customer phone</Box>
            <Box>{opportunity?.Customer?.Contacts?.[0]?.Phone || '-'}</Box>
          </div>
        </ColumnLayout>
      </Container>
    </>
  );
}

export default CustomerDetails;
