import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SideNavigation } from '@cloudscape-design/components';
import { getOpportunityId, getEngagementInvitationId } from '../../../utils/sessionStorage';

const Navigation = () => {
  const navigate = useNavigate();
  const opportunityId = getOpportunityId();
  const engagementInvitationId = getEngagementInvitationId();
  
  const navItems = [
    {
      type: "section",
      text: "Applications",
      defaultExpanded: false,
      items: [
        {
          type: "link",
          text: "Opportunity Management",
          href: "/"
        },
        {
          type: "link",
          text: "Offer Automation",
          href: "/offerautomation"
        }
      ]
    },
    {
      type: "link",
      text: "Log in",
      href: "/"
    },
    {
      type: "section",
      text: "Products",
      defaultExpanded: false,
      items: [
        {
          type: "link",
          text: "Products Overview",
          href: "/products"
        },
        {
          type: "link",
          text: "Publish SaaS Product",
          href: "/publish-saas-product"
        }
      ]
    },
    {
      type: "section",
      text: "Offers",
      defaultExpanded: false,
      items: [
        {
          type: "link",
          text: "Offers Overview",
          href: "/offers"
        },
        {
          type: "link",
          text: "Create Private Offer",
          href: "/create-private-offer"
        },
        {
          type: "link",
          text: "Create Private Offer with Future Service Date",
          href: "/create-private-offer-future"
        },
        {
          type: "link",
          text: "Create CPPO",
          href: "/create-cppo"
        },
        {
          type: "link",
          text: "Describe Change Set",
          href: "/describe-changeset"
        }
      ]
    },
    {
      type: "section",
      text: "Agreements",
      defaultExpanded: false,
      items: [
        {
          type: "link",
          text: "List Agreements",
          href: "/agreements"
        }
      ]
    },
    {
      type: "section",
      text: "Opportunities",
      defaultExpanded: true,
      items: [
        {
          type: "link",
          text: "List Opportunities",
          href: "/opportunities"
        },
        {
          type: "link",
          text: "Get Opportunity",
          href: "/get-opportunity"
        },
        {
          type: "link",
          text: "Create Partner Originated Opportunity",
          href: "/create-opportunity"
        },
        {
          type: "link",
          text: "[Simulate] Review by AWS",
          href: "/simulate-review"
        },
        {
          type: "link",
          text: "[Simulate] Create AWS Originated Opportunity",
          href: "/create-aws-opportunity"
        },
        {
          type: "link",
          text: "Assign Opportunity",
          href: "/assign-opportunity"
        },
        {
          type: "link",
          text: "Associate Opportunity",
          href: "/associate-opportunity-menu"
        },
        {
          type: "link",
          text: "Start Engagement From Opportunity Task",
          href: "/start-engagement-from-opportunity-task"
        },
        {
          type: "link",
          text: "Start Engagement From Opportunity Task (API)",
          href: "/start-engagement-from-opportunity-task-api"
        },
        {
          type: "link",
          text: "Agent Chat",
          href: "/agent-chat"
        }
      ]
    },
    {
      type: "section",
      text: "Engagements",
      defaultExpanded: false,
      items: [
        {
          type: "link",
          text: "List Engagement Invitations",
          href: "/engagement-invitations"
        },
        {
          type: "link",
          text: "Get Engagement Invitations",
          href: "/get-engagement-invitation"
        },
        {
          type: "link",
          text: "Accept Engagement Invitations",
          href: "/accept-engagement-invitation"
        },
        {
          type: "link",
          text: "Reject Engagement Invitations",
          href: "/reject-engagement-invitation"
        }
      ]
    }
  ];
  
  return (
    <SideNavigation
      activeHref={window.location.pathname}
      header={{ text: 'Navigation', href: '/' }}
      onFollow={e => {
        e.preventDefault();
        if (e.detail.href === '/simulate-review') {
          if (opportunityId) {
            navigate(`/simulate-review/${opportunityId}`);
          } else {
            navigate('/opportunities?review=true');
          }
        } else if (e.detail.href === '/get-engagement-invitation') {
          if (engagementInvitationId) {
            navigate(`/get-engagement-invitation`);
          } else {
            navigate('/engagement-invitations');
          }
        } else {
          navigate(e.detail.href);
        }
      }}
      items={navItems}
    />
  );
};

export default Navigation;