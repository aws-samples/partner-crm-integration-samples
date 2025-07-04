import React from 'react';
import {
  Container,
  Header,
  ColumnLayout,
  Box,
  Button,
} from "@cloudscape-design/components";

function AdditionalDetails({ opportunity, awsOpportunity }) {
  return (
    <Container
      header={
        <Header variant="h2">
          Additional details
        </Header>
      }
    >
      <ColumnLayout columns={2} variant="text-grid">
        {/* Left Column */}
        <div>
          <Box variant="awsui-key-label">Partner CRM identifier</Box>
          <Box>{opportunity?.PartnerOpportunityIdentifier || '-'}</Box>

          <Box variant="awsui-key-label">AWS account ID</Box>
          <Box>{opportunity?.Customer?.Account?.AwsAccountId || '-'}</Box>

          <Box variant="awsui-key-label">Closed reason</Box>
          <Box>{opportunity?.LifeCycle?.ClosedLostReason || '-'}</Box>

          <Box variant="awsui-key-label">AWS close date</Box>
          <Box>{opportunity?.LifeCycle?.TargetCloseDate || '-'}</Box>
        </div>

        {/* Right Column */}
        <div>
          <Box variant="awsui-key-label">Competitive tracking</Box>
          <Box>{opportunity?.Project?.CompetitorName || '-'}</Box>

          <Box variant="awsui-key-label">Additional comments</Box>
          <Box>{opportunity?.Project?.AdditionalComments || '-'}</Box>

          <Box variant="awsui-key-label">AWS stage</Box>
          <Box>{opportunity?.LifeCycle?.Stage || '-'}</Box>

          <Box variant="awsui-key-label">AWS closed lost reason</Box>
          <Box>{awsOpportunity?.LifeCycle?.ClosedLostReason || '-'}</Box>
        </div>
      </ColumnLayout>
    </Container>
  );
}

export default AdditionalDetails;
