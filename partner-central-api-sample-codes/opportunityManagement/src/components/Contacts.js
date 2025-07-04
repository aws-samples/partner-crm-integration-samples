import React from 'react';
import {
  Container,
  Header,
  Table,
  Box,
  Button,
  Link,
} from "@cloudscape-design/components";

function Contacts({ opportunity, awsOpportunity }) {
  // Combine and format contacts from both sources
  const formatContacts = () => {
    const contacts = [];
    
    // Add contacts from GetOpportunity (Partner contacts)
    if (opportunity?.OpportunityTeam && Array.isArray(opportunity.OpportunityTeam)) {
      opportunity.OpportunityTeam.forEach(contact => {
        contacts.push({
          role: `Partner ${contact.BusinessTitle || 'Team Member'}`,
          name: `${contact.FirstName || ''} ${contact.LastName || ''}`.trim(),
          email: contact.Email || '-',
          phone: contact.Phone || '-',
          source: 'Partner'
        });
      });
    }
    
    // Add contacts from GetAwsOpportunitySummary (AWS contacts)
    if (awsOpportunity?.OpportunityTeam && Array.isArray(awsOpportunity.OpportunityTeam)) {
      awsOpportunity.OpportunityTeam.forEach(contact => {
        contacts.push({
          role: `AWS ${contact.BusinessTitle || 'Team Member'}`,
          name: `${contact.FirstName || ''} ${contact.LastName || ''}`.trim(),
          email: contact.Email || '-',
          phone: contact.Phone || '-',
          source: 'AWS'
        });
      });
    }
    
    return contacts;
  };
  
  const contacts = formatContacts();
  
  // Table column definitions
  const columnDefinitions = [
    {
      id: "role",
      header: "Role",
      cell: item => item.role
    },
    {
      id: "name",
      header: "Name",
      cell: item => item.name || '-'
    },
    {
      id: "email",
      header: "Email",
      cell: item => item.email ? (
        <Link href={`mailto:${item.email}`}>{item.email}</Link>
      ) : '-'
    },
    {
      id: "phone",
      header: "Phone",
      cell: item => item.phone || '-'
    }
  ];

  return (
    <Container
      header={
        <Header variant="h2">
          Contacts
        </Header>
      }
    >
      <Table
        columnDefinitions={columnDefinitions}
        items={contacts}
        sortingDisabled={false}
        variant="container"
        stickyHeader={true}
        stripedRows={true}
        empty={
          <Box textAlign="center" padding="l">
            <b>No contacts</b>
            <Box padding={{ top: 's' }}>
              No contacts are associated with this opportunity
            </Box>
          </Box>
        }
      />
    </Container>
  );
}

export default Contacts;
