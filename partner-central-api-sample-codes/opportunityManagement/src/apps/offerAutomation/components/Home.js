import React from 'react';
import { Container, Header, SpaceBetween, Box } from '@cloudscape-design/components';

const Home = () => {
  return (
    <SpaceBetween size="l">
      <Header variant="h1">
        Offer Automation
      </Header>
      
      <Container>
        <SpaceBetween size="m">
          <Box variant="h2">Welcome to Offer Automation</Box>
          <Box variant="p">
            This application provides automated tools for managing AWS Marketplace offers and products.
            Use the navigation menu on the left to access the available features:
          </Box>
          <Box variant="ul">
            <li><strong>Products</strong>
              <ul>
                <li>Publish SaaS Product - Automate SaaS product publishing with API integration</li>
                <li>Describe Change Set - View and manage change set details</li>
              </ul>
            </li>
            <li><strong>Offers</strong>
              <ul>
                <li>Create Private Offer - Create private marketplace offers</li>
                <li>Create Private Offer with Future Service Date - Create offers with future start dates</li>
                <li>Create CPPO - Create Channel Partner Private Offers</li>
              </ul>
            </li>
            <li><strong>Opportunities</strong>
              <ul>
                <li>Create Partner Originated Opportunity - Create new business opportunities</li>
                <li>Get Opportunity - Retrieve opportunity details</li>
                <li>Assign Opportunity - Assign opportunities to team members</li>
              </ul>
            </li>
          </Box>
        </SpaceBetween>
      </Container>
    </SpaceBetween>
  );
};

export default Home;