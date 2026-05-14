import React, { useState } from 'react';
import {
  Tabs,
  SpaceBetween,
} from "@cloudscape-design/components";
import CustomerDetails from './CustomerDetails';
import ProjectDetails from './ProjectDetails';
import AdditionalDetails from './AdditionalDetails';
import Contacts from './Contacts';

function TabsSection({ opportunity, awsOpportunity }) {
  const [activeTabId, setActiveTabId] = useState('customer');

  const tabs = [
    {
      id: "customer",
      label: "Customer details",
      content: <CustomerDetails opportunity={opportunity} />
    },
    {
      id: "project",
      label: "Project details",
      content: <ProjectDetails opportunity={opportunity} />
    },
    {
      id: "additional",
      label: "Additional details",
      content: <AdditionalDetails opportunity={opportunity} awsOpportunity={awsOpportunity} />
    },
    {
      id: "contacts",
      label: "Contacts",
      content: <Contacts opportunity={opportunity} awsOpportunity={awsOpportunity} />
    }
  ];

  return (
    <SpaceBetween size="l">
      <Tabs
        activeTabId={activeTabId}
        onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
        tabs={tabs}
      />
    </SpaceBetween>
  );
}

export default TabsSection;
