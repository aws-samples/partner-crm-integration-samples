import React from 'react';
import {
  Container,
  Header,
  ColumnLayout,
  StatusIndicator,
  Box,
  Link,
} from "@cloudscape-design/components";

function Overview({ opportunity }) {
  return (
    <Container
      header={
        <Header variant="h2">
          Overview
        </Header>
      }
    >
      <ColumnLayout columns={3} variant="text-grid">
        {/* Left Column */}
        <div>
          <Box variant="awsui-key-label">Opportunity ID</Box>
          <Box variant="samp">{opportunity?.Id || opportunity?.RelatedOpportunityId || '-'}</Box>

          <Box variant="awsui-key-label">Customer company name</Box>
          <Box>{opportunity?.Customer?.Account?.CompanyName || '-'}</Box>

          <Box variant="awsui-key-label">Opportunity ownership</Box>
          <Box>{opportunity?.Origin || 'Partner referral'}</Box>
        </div>

        {/* Middle Column */}
        <div>
          <Box variant="awsui-key-label">Involvement Type</Box>
          <Box>
            <StatusIndicator type="info">
              {opportunity?.InvolvementType || 'Not specified'}
            </StatusIndicator>
          </Box>

          <Box variant="awsui-key-label">
            AWS marketplace engagement score{" "}
            <Link variant="info" href="#">
              Info
            </Link>
          </Box>
          <Box>{opportunity?.EngagementScore || '-'}</Box>

          <Box variant="awsui-key-label">AWS recommended actions</Box>
          <Box>{opportunity?.NextBestActions || '-'}</Box>
        </div>

        {/* Right Column */}
        <div>
          <Box variant="awsui-key-label">Stage</Box>
          <Box>{opportunity?.LifeCycle?.Stage || 'Prospect'}</Box>

          <Box variant="awsui-key-label">Status</Box>
          <Box>
            <StatusIndicator 
              type={
                opportunity?.LifeCycle?.ReviewStatus === 'APPROVED' ? 'success' :
                opportunity?.LifeCycle?.ReviewStatus === 'REJECTED' ? 'error' :
                'pending'
              }
            >
              {opportunity?.LifeCycle?.ReviewStatus || 'Pending'}
            </StatusIndicator>
          </Box>

          <Box variant="awsui-key-label">Target Close Date</Box>
          <Box>{opportunity?.LifeCycle?.TargetCloseDate || '-'}</Box>
        </div>
      </ColumnLayout>
    </Container>
  );
}

export default Overview;
