import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppLayout, ContentLayout } from '@cloudscape-design/components';
import '@cloudscape-design/global-styles/index.css';

import Header from './components/Header';
import Navigation from './components/Navigation';
import CredentialsForm from './components/CredentialsForm';
import OpportunitiesList from './components/OpportunitiesList';
import OpportunityDetails from './components/OpportunityDetails';
import CreateOpportunity from './components/CreateOpportunity';
import CreateAwsOpportunity from './components/CreateAwsOpportunity';
import GetOpportunity from './components/GetOpportunity';
import EditOpportunity from './components/EditOpportunity';
import AssociateOpportunity from './components/AssociateOpportunity';
import AssignOpportunity from './components/AssignOpportunity';
import AssociateOpportunityMenu from './components/AssociateOpportunityMenu';
import StartEngagementFromOpportunityTask from './components/StartEngagementFromOpportunityTask';
import ListEngagementInvitations from './components/ListEngagementInvitations';
import EngagementInvitationDetails from './components/EngagementInvitationDetails';
import GetEngagementInvitation from './components/GetEngagementInvitation';
import AcceptEngagementInvitation from './components/AcceptEngagementInvitation';
import RejectEngagementInvitation from './components/RejectEngagementInvitation';
import SimulateReview from './components/SimulateReview';
import { clearCredentials } from './utils/sessionStorage';

function App() {
  const handleSignOut = () => {
    clearCredentials();
    window.location.hash = '#/';
  };

  return (
    <Router>
      <div className="App">
        <Header onSignOut={handleSignOut} />
        <AppLayout
          navigation={<Navigation />}
          content={
            <ContentLayout>
              <Routes>
                <Route path="/" element={<CredentialsForm />} />
                <Route path="/opportunities" element={<OpportunitiesList />} />
                <Route path="/opportunity/:id" element={<OpportunityDetails />} />
                <Route path="/create-opportunity" element={<CreateOpportunity />} />
                <Route path="/create-aws-opportunity" element={<CreateAwsOpportunity />} />
                <Route path="/get-opportunity" element={<GetOpportunity />} />
                <Route path="/edit-opportunity/:id" element={<EditOpportunity />} />
                <Route path="/associate-opportunity/:id" element={<AssociateOpportunity />} />
                <Route path="/assign-opportunity" element={<AssignOpportunity />} />
                <Route path="/associate-opportunity-menu" element={<AssociateOpportunityMenu />} />
                <Route path="/start-engagement-from-opportunity-task" element={<StartEngagementFromOpportunityTask />} />
                <Route path="/engagement-invitations" element={<ListEngagementInvitations />} />
                <Route path="/engagement-invitation/:id" element={<EngagementInvitationDetails />} />
                <Route path="/get-engagement-invitation" element={<GetEngagementInvitation />} />
                <Route path="/accept-engagement-invitation" element={<AcceptEngagementInvitation />} />
                <Route path="/reject-engagement-invitation" element={<RejectEngagementInvitation />} />
                <Route path="/simulate-review" element={<SimulateReview />} />
                <Route path="/simulate-review/:id" element={<SimulateReview />} />
              </Routes>
            </ContentLayout>
          }
        />
      </div>
    </Router>
  );
}

export default App;
