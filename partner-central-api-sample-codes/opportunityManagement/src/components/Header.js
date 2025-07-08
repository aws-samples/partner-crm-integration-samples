import React from 'react';
import { TopNavigation } from '@cloudscape-design/components';

const Header = ({ onSignOut }) => {
  return (
    <TopNavigation
      identity={{
        title: 'Opportunity Management',
      }}
      utilities={[
        {
          type: 'button',
          text: 'Sign out',
          onClick: onSignOut
        }
      ]}
    />
  );
};

export default Header;
