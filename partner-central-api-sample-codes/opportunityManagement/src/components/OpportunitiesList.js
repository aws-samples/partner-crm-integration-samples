import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Table,
  Box,
  Button,
  SpaceBetween,
  Header,
  Pagination,
  TextFilter,
  Container,
  Alert
} from '@cloudscape-design/components';
import { listOpportunities } from '../services/api';
import { hasCredentials } from '../utils/sessionStorage';

const OpportunitiesList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isReviewMode = searchParams.get('review') === 'true';
  const [opportunitiesData, setOpportunitiesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);


  const handleRowClick = (opportunityId) => {
    if (isReviewMode) {
      navigate(`/simulate-review/${opportunityId}`);
    } else {
      navigate(`/opportunity/${opportunityId}`);
    }
  };
  
  useEffect(() => {
    // Check if credentials exist
    if (!hasCredentials()) {
      navigate('/');
      return;
    }
    
    // Fetch opportunities
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        const data = await listOpportunities();
        setOpportunitiesData(data);
        setError('');
      } catch (err) {
        console.error('Error in fetchOpportunities:', err);
        setError('Failed to load opportunities: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOpportunities();
  }, [navigate]);
  
  // Extract opportunities from the response
  const opportunities = opportunitiesData?.OpportunitySummaries || [];
  
  // Filter opportunities based on filter text
  const filteredOpportunities = opportunities.filter(opportunity => {
    if (!filterText) return true;
    
    const searchText = filterText.toLowerCase();
    return (
      (opportunity.Id && opportunity.Id.toLowerCase().includes(searchText)) ||
      (opportunity.LifeCycle?.Stage && opportunity.LifeCycle.Stage.toLowerCase().includes(searchText)) ||
      (opportunity.LifeCycle?.ReviewStatus && opportunity.LifeCycle.ReviewStatus.toLowerCase().includes(searchText))
    );
  });
  
  // Table columns definition
  const columnDefinitions = [
    {
      id: 'opportunityId',
      header: 'Opportunity ID',
      cell: item => (
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            const { saveOpportunityId } = require('../utils/sessionStorage');
            saveOpportunityId(item.Id);
            navigate(`/opportunity/${item.Id}`);
          }}
        >
          {item.Id || '-'}
        </a>
      )
    },
    {
      id: 'companyName',
      header: 'Customer Company Name',
      cell: item => (
        item.Customer?.Account?.CompanyName || '-'
      )
    },
    {
      id: 'reviewStatus',
      header: 'Status',
      cell: item => item.LifeCycle?.ReviewStatus || '-'
    },
    {
      id: 'stage',
      header: 'Stage',
      cell: item => item.LifeCycle?.Stage || '-'
    }
  ];
  
  return (
    <Container>
      <Table
        loading={loading}
        loadingText="Loading opportunities"
        columnDefinitions={columnDefinitions}
        items={filteredOpportunities}

        header={
          <Header
            counter={`(${filteredOpportunities.length})`}
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                {isReviewMode && (
                  <Box>Select an opportunity to simulate AWS review</Box>
                )}
                <Button onClick={() => {
                  setLoading(true);
                  listOpportunities()
                    .then(data => {
                      setOpportunitiesData(data);
                      setLoading(false);
                    })
                    .catch(err => {
                      setError('Failed to refresh: ' + err.message);
                      setLoading(false);
                    });
                }}>Refresh</Button>
              </SpaceBetween>
            }
          >
            {isReviewMode ? 'Select Opportunity for Review' : 'Opportunities'}
          </Header>
        }
        filter={
          <TextFilter
            filteringText={filterText}
            filteringPlaceholder="Find opportunities"
            filteringAriaLabel="Filter opportunities"
            onChange={({ detail }) => setFilterText(detail.filteringText)}
          />
        }
        pagination={
          <Pagination
            currentPageIndex={currentPage}
            onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
            pagesCount={Math.max(1, Math.ceil(filteredOpportunities.length / 10))}
          />
        }
        onRowClick={({ detail }) => handleRowClick(detail.item.Id)}
      />
      
      {error && (
        <Box margin={{ top: 'l' }}>
          <Alert type="error">{error}</Alert>
        </Box>
      )}
      
      {!loading && filteredOpportunities.length === 0 && !error && (
        <Box margin={{ top: 'l' }}>
          <Alert type="info">No opportunities found.</Alert>
        </Box>
      )}
    </Container>
  );
};

export default OpportunitiesList;
