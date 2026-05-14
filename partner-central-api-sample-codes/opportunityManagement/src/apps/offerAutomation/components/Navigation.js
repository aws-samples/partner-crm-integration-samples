import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SideNavigation } from '@cloudscape-design/components';

const Navigation = () => {
  const navigate = useNavigate();
  
  const navItems = [
    {
      type: "section",
      text: "Applications",
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
      type: "section",
      text: "Products",
      items: [
        {
          type: "link",
          text: "Publish SaaS Product",
          href: "/offerautomation/publish-saas-product"
        },
        {
          type: "link",
          text: "Describe Change Set",
          href: "/offerautomation/describe-changeset"
        }
      ]
    },
    {
      type: "section",
      text: "Offers",
      items: [
        {
          type: "link",
          text: "Create Private Offer",
          href: "/offerautomation/create-private-offer"
        },
        {
          type: "link",
          text: "Create Private Offer with Future Service Date",
          href: "/offerautomation/create-private-offer-future"
        },
        {
          type: "link",
          text: "Create CPPO",
          href: "/offerautomation/create-cppo"
        },
        {
          type: "link",
          text: "Describe Offer",
          href: "/offerautomation/describe-offer"
        }
      ]
    },
    {
      type: "section",
      text: "Opportunities",
      items: [
        {
          type: "link",
          text: "Create Partner Originated Opportunity",
          href: "/offerautomation/create-opportunity"
        },
        {
          type: "link",
          text: "Get Opportunity",
          href: "/offerautomation/get-opportunity"
        },
        {
          type: "link",
          text: "Associate Opportunity",
          href: "/offerautomation/associate-opportunity"
        },
        {
          type: "link",
          text: "Update Opportunity",
          href: "/offerautomation/update-opportunity"
        },
        {
          type: "link",
          text: "List Solutions",
          href: "/offerautomation/list-solutions"
        },
        {
          type: "link",
          text: "Simulate Review from AWS",
          href: "/offerautomation/simulate-approval"
        },
        {
          type: "link",
          text: "Start Engagement From Opportunity Task",
          href: "/offerautomation/start-engagement-from-opportunity-task"
        }
      ]
    },
    {
      type: "section",
      text: "Agreements",
      items: [
        {
          type: "link",
          text: "List Agreements",
          href: "/offerautomation/list-agreements"
        }
      ]
    }
  ];
  
  return (
    <SideNavigation
      activeHref={window.location.pathname}
      header={{ text: 'Offer Automation', href: '/offerautomation' }}
      onFollow={e => {
        e.preventDefault();
        navigate(e.detail.href);
      }}
      items={navItems}
    />
  );
};

export default Navigation;