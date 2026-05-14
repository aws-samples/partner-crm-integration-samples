import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppLayout, ContentLayout } from '@cloudscape-design/components';
import Header from '../../opportunityManagement/components/Header';
import Navigation from './Navigation';
import { clearCredentials } from '../../../utils/sessionStorage';

const Layout = () => {
  const handleSignOut = () => {
    clearCredentials();
    window.location.hash = '#/logout-success';
  };

  return (
    <div className="App">
      <Header onSignOut={handleSignOut} />
      <AppLayout
        navigation={<Navigation />}
        content={
          <ContentLayout>
            <Outlet />
          </ContentLayout>
        }
      />
    </div>
  );
};

export default Layout;