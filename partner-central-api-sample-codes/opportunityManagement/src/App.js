import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppLayout, ContentLayout } from '@cloudscape-design/components';
import '@cloudscape-design/global-styles/index.css';

// Opportunity Management Components
import Header from './apps/opportunityManagement/components/Header';
import Navigation from './apps/opportunityManagement/components/Navigation';
import CredentialsForm from './apps/opportunityManagement/components/CredentialsForm';
import AutoLogin from './apps/opportunityManagement/components/AutoLogin';
import LoginSuccess from './apps/opportunityManagement/components/LoginSuccess';
import LogoutSuccess from './apps/opportunityManagement/components/LogoutSuccess';
import OpportunitiesList from './apps/opportunityManagement/components/OpportunitiesList';
import OpportunityDetails from './apps/opportunityManagement/components/OpportunityDetails';
import CreateOpportunity from './apps/opportunityManagement/components/CreateOpportunity';
import CreateAwsOpportunity from './apps/opportunityManagement/components/CreateAwsOpportunity';
import GetOpportunity from './apps/opportunityManagement/components/GetOpportunity';
import EditOpportunity from './apps/opportunityManagement/components/EditOpportunity';
import AssociateOpportunity from './apps/opportunityManagement/components/AssociateOpportunity';
import AssignOpportunity from './apps/opportunityManagement/components/AssignOpportunity';
import AssociateOpportunityMenu from './apps/opportunityManagement/components/AssociateOpportunityMenu';
import StartEngagementFromOpportunityTask from './apps/opportunityManagement/components/StartEngagementFromOpportunityTask';
import StartEngagementFromOpportunityTaskApi from './apps/opportunityManagement/components/StartEngagementFromOpportunityTaskApi';
import ListEngagementInvitations from './apps/opportunityManagement/components/ListEngagementInvitations';
import EngagementInvitationDetails from './apps/opportunityManagement/components/EngagementInvitationDetails';
import GetEngagementInvitation from './apps/opportunityManagement/components/GetEngagementInvitation';
import AcceptEngagementInvitation from './apps/opportunityManagement/components/AcceptEngagementInvitation';
import RejectEngagementInvitation from './apps/opportunityManagement/components/RejectEngagementInvitation';
import SimulateReview from './apps/opportunityManagement/components/SimulateReview';
import OffersList from './apps/opportunityManagement/components/OffersList';
import CreatePrivateOffer from './apps/opportunityManagement/components/CreatePrivateOffer';
import CreatePrivateOfferFuture from './apps/opportunityManagement/components/CreatePrivateOfferFuture';
import CreateCPPO from './apps/opportunityManagement/components/CreateCPPO';
import OfferDetails from './apps/opportunityManagement/components/OfferDetails';
import DescribeChangeSet from './apps/opportunityManagement/components/DescribeChangeSet';
import ProductsList from './apps/opportunityManagement/components/ProductsList';
import ProductDetails from './apps/opportunityManagement/components/ProductDetails';
import PublishSaaSProduct from './apps/opportunityManagement/components/PublishSaaSProduct';
import ListAgreements from './apps/opportunityManagement/components/ListAgreements';
import AgentChat from './apps/opportunityManagement/components/AgentChat';
import WorkshopSetupPage from './apps/opportunityManagement/components/WorkshopSetupPage';
// Offer Automation Components
import OfferAutomationLayout from './apps/offerAutomation/components/Layout';
import OfferAutomationHome from './apps/offerAutomation/components/Home';
import OfferAutomationPublishSaaS from './apps/offerAutomation/components/PublishSaaSProduct';
import OfferAutomationDescribeChangeSet from './apps/offerAutomation/components/DescribeChangeSet';
import OfferAutomationCreatePrivateOffer from './apps/offerAutomation/components/CreatePrivateOffer';
import OfferAutomationCreatePrivateOfferFuture from './apps/offerAutomation/components/CreatePrivateOfferFuture';
import OfferAutomationCreateCPPO from './apps/offerAutomation/components/CreateCPPO';
import OfferAutomationCreateOpportunity from './apps/offerAutomation/components/CreateOpportunity';
import OfferAutomationGetOpportunity from './apps/offerAutomation/components/GetOpportunity';
import OfferAutomationAssociateOpportunity from './apps/offerAutomation/components/AssociateOpportunity';
import OfferAutomationListAgreements from './apps/offerAutomation/components/ListAgreements';
import OfferAutomationUpdateOpportunity from './apps/offerAutomation/components/UpdateOpportunity';
import OfferAutomationListSolutions from './apps/offerAutomation/components/ListSolutions';
import OfferAutomationSimulateApproval from './apps/offerAutomation/components/SimulateApproval';
import OfferAutomationStartEngagementFromOpportunityTask from './apps/offerAutomation/components/StartEngagementFromOpportunityTask';
import OfferAutomationDescribeOffer from './apps/offerAutomation/components/DescribeOffer';
import { clearCredentials } from './utils/sessionStorage';
import { config } from './config/config';

function App() {
  const handleSignOut = () => {
    clearCredentials();
    window.location.hash = '#/logout-success';
  };

  return (
    <Router>
      <Routes>
        {/* Standalone pages (no nav/header) */}
        <Route path="/test-workshop-setup" element={<WorkshopSetupPage />} />

        {/* Offer Automation Routes */}
        <Route path="/offerautomation" element={<OfferAutomationLayout />}>
          <Route index element={<OfferAutomationHome />} />
          <Route path="publish-saas-product" element={<OfferAutomationPublishSaaS />} />
          <Route path="describe-changeset" element={<OfferAutomationDescribeChangeSet />} />
          <Route path="create-private-offer" element={<OfferAutomationCreatePrivateOffer />} />
          <Route path="create-private-offer-future" element={<OfferAutomationCreatePrivateOfferFuture />} />
          <Route path="create-cppo" element={<OfferAutomationCreateCPPO />} />
          <Route path="create-opportunity" element={<OfferAutomationCreateOpportunity />} />
          <Route path="get-opportunity" element={<OfferAutomationGetOpportunity />} />
          <Route path="associate-opportunity" element={<OfferAutomationAssociateOpportunity />} />
          <Route path="list-agreements" element={<OfferAutomationListAgreements />} />
          <Route path="update-opportunity" element={<OfferAutomationUpdateOpportunity />} />
          <Route path="update-opportunity/:id" element={<OfferAutomationUpdateOpportunity />} />
          <Route path="list-solutions" element={<OfferAutomationListSolutions />} />
          <Route path="simulate-approval" element={<OfferAutomationSimulateApproval />} />
          <Route path="simulate-approval/:id" element={<OfferAutomationSimulateApproval />} />
          <Route path="start-engagement-from-opportunity-task" element={<OfferAutomationStartEngagementFromOpportunityTask />} />
          <Route path="describe-offer" element={<OfferAutomationDescribeOffer />} />
        </Route>

        {/* Main Application Routes */}
        <Route path="*" element={
          <div className="App">
            <Header onSignOut={handleSignOut} />
            <AppLayout
              navigation={<Navigation />}
              content={
                <ContentLayout>
                  <Routes>
                    <Route path="/" element={config.SkipLogin ? <AutoLogin /> : <CredentialsForm />} />
                    <Route path="/login-success" element={<LoginSuccess />} />
                    <Route path="/logout-success" element={<LogoutSuccess />} />
                    <Route path="/login" element={<CredentialsForm />} />
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
                    <Route path="/start-engagement-from-opportunity-task-api" element={<StartEngagementFromOpportunityTaskApi />} />
                    <Route path="/engagement-invitations" element={<ListEngagementInvitations />} />
                    <Route path="/engagement-invitation/:id" element={<EngagementInvitationDetails />} />
                    <Route path="/get-engagement-invitation" element={<GetEngagementInvitation />} />
                    <Route path="/accept-engagement-invitation" element={<AcceptEngagementInvitation />} />
                    <Route path="/reject-engagement-invitation" element={<RejectEngagementInvitation />} />
                    <Route path="/simulate-review" element={<SimulateReview />} />
                    <Route path="/simulate-review/:id" element={<SimulateReview />} />
                    <Route path="/products" element={<ProductsList />} />
                    <Route path="/product/:entityId" element={<ProductDetails />} />
                    <Route path="/publish-saas-product" element={<PublishSaaSProduct />} />
                    <Route path="/offers" element={<OffersList />} />
                    <Route path="/create-private-offer" element={<CreatePrivateOffer />} />
                    <Route path="/create-private-offer-future" element={<CreatePrivateOfferFuture />} />
                    <Route path="/create-cppo" element={<CreateCPPO />} />
                    <Route path="/offer/:entityId" element={<OfferDetails />} />
                    <Route path="/describe-changeset" element={<DescribeChangeSet />} />
                    <Route path="/agreements" element={<ListAgreements />} />
                    <Route path="/agent-chat" element={<AgentChat />} />
                  </Routes>
                </ContentLayout>
              }
            />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
