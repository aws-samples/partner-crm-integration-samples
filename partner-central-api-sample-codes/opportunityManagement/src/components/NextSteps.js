import React from 'react';
import {
  Table,
  Header,
  Button,
  Link,
  Box,
  ButtonDropdown,
} from "@cloudscape-design/components";

function NextSteps({ opportunity }) {
  const columnDefinitions = [
    {
      id: "nextStep",
      header: "Next step",
      cell: item => item.Value || item.nextStep,
      sortingField: "nextStep"
    },
    {
      id: "createdBy",
      header: "Created by",
      cell: item => item.createdBy || "AWS",
      sortingField: "createdBy"
    },
    {
      id: "createdDate",
      header: "Created date",
      cell: item => item.Time || item.createdDate,
      sortingField: "createdDate"
    }
  ];

  // Create items array with first entry from NextSteps and the rest from NextStepsHistory
  let items = [];
  
  // Add the current next step as the first item if available
  if (opportunity?.LifeCycle?.NextSteps && opportunity.LifeCycle.NextSteps !== '-') {
    items.push({
      nextStep: opportunity.LifeCycle.NextSteps,
      createdBy: "AWS",
      createdDate: new Date().toISOString()
    });
  }
  
  // Add items from NextStepsHistory if available
  if (opportunity?.LifeCycle?.NextStepsHistory && 
      Array.isArray(opportunity.LifeCycle.NextStepsHistory) && 
      opportunity.LifeCycle.NextStepsHistory.length > 0) {
    items = [...items, ...opportunity.LifeCycle.NextStepsHistory];
  }

  return (
    <Table
      header={
        <Header
          counter={`(${items.length})`}
        >
          Next steps{" "}
          <Link variant="info" href="#">
            Info
          </Link>
        </Header>
      }
      columnDefinitions={columnDefinitions}
      items={items}
      sortingDisabled={false}
      variant="container"
      stickyHeader={true}
      stripedRows={true}
      empty={
        <Box textAlign="center" padding="l">
          <b>No next steps</b>
          <Box padding={{ top: 's' }}>
            Add next steps to track progress
          </Box>
        </Box>
      }
    />
  );
}

export default NextSteps;
