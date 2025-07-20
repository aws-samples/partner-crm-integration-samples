import React from 'react';
import {
  Container,
  Header,
  ColumnLayout,
  Box,
  Link,
} from "@cloudscape-design/components";

function ProjectDetails({ opportunity }) {
  return (
    <>
      {/* Project Details Section */}
      <Container
        header={
          <Header variant="h2">
            Project details
          </Header>
        }
      >
        <ColumnLayout columns={2} variant="text-grid">
          {/* Left Column */}
          <div>
            <Box variant="awsui-key-label">Partner primary need</Box>
            <Box>{opportunity?.PrimaryNeedsFromAws?.join(', ') || '-'}</Box>

            <Box variant="awsui-key-label">Partner project title</Box>
            <Box>{opportunity?.Project?.Title || '-'}</Box>

            <Box variant="awsui-key-label">
              Customer business problem{" "}
              <Link variant="info" href="#">Info</Link>
            </Box>
            <Box>{opportunity?.Project?.CustomerBusinessProblem || '-'}</Box>

            <Box variant="awsui-key-label">Use case</Box>
            <Box>{opportunity?.Project?.CustomerUseCase || '-'}</Box>

            <Box variant="awsui-key-label">
              Delivery model{" "}
              <Link variant="info" href="#">Info</Link>
            </Box>
            <Box>{opportunity?.Project?.DeliveryModels?.join(', ') || '-'}</Box>

            <Box variant="awsui-key-label">Target close date</Box>
            <Box>{opportunity?.LifeCycle?.TargetCloseDate || '-'}</Box>
          </div>

          {/* Right Column */}
          <div>
            <Box variant="awsui-key-label">Co-sell needs</Box>
            <Box>{opportunity?.PrimaryNeedsFromAws?.join(', ') || '-'}</Box>

            <Box variant="awsui-key-label">Opportunity type</Box>
            <Box>{opportunity?.OpportunityType || '-'}</Box>

            <Box variant="awsui-key-label">Sales activities</Box>
            <Box>{opportunity?.Project?.SalesActivities?.join(', ') || '-'}</Box>

            <Box variant="awsui-key-label">Solutions offered</Box>
            <Box>{opportunity?.RelatedEntityIdentifiers?.Solutions?.join(', ') || '-'}</Box>

            <Box variant="awsui-key-label">AWS products</Box>
            <Box>{opportunity?.RelatedEntityIdentifiers?.AwsProducts?.join(', ') || '-'}</Box>

            <Box variant="awsui-key-label">
              Estimated AWS monthly recurring revenue{" "}
              <Link variant="info" href="#">Info</Link>
            </Box>
            <Box>
              {opportunity?.Project?.ExpectedCustomerSpend?.[0]?.Amount 
                ? `${opportunity.Project.ExpectedCustomerSpend[0].Amount} ${opportunity.Project.ExpectedCustomerSpend[0].CurrencyCode || 'USD'}`
                : '-'}
            </Box>

            <Box variant="awsui-key-label">APN programs</Box>
            <Box>{opportunity?.Project?.ApnPrograms?.join(', ') || '-'}</Box>
          </div>
        </ColumnLayout>
      </Container>

      {/* Opportunity Marketing Details Section */}
      <Container
        header={
          <Header variant="h2">
            Opportunity marketing details
          </Header>
        }
      >
        <ColumnLayout columns={2} variant="text-grid">
          {/* Left Column */}
          <div>
            <Box variant="awsui-key-label">
              Opportunity source{" "}
              <Link variant="info" href="#">Info</Link>
            </Box>
            <Box>{opportunity?.Marketing?.Source 
              ? `Yes: ${opportunity.Marketing.Source}` 
              : 'No marketing source specified'}</Box>

            <Box variant="awsui-key-label">Marketing activity use case</Box>
            <Box>{opportunity?.Marketing?.UseCases?.join(', ') || '-'}</Box>

            <Box variant="awsui-key-label">Marketing development funds</Box>
            <Box>{opportunity?.Marketing?.AwsFundingUsed 
              ? 'Yes: Marketing development funds were used for this opportunity.' 
              : 'No marketing development funds were used.'}</Box>
          </div>

          {/* Right Column */}
          <div>
            <Box variant="awsui-key-label">Marketing campaign</Box>
            <Box>{opportunity?.Marketing?.CampaignName || '-'}</Box>

            <Box variant="awsui-key-label">Marketing activity channel</Box>
            <Box>{opportunity?.Marketing?.Channels?.join(', ') || '-'}</Box>
          </div>
        </ColumnLayout>
      </Container>
    </>
  );
}

export default ProjectDetails;
