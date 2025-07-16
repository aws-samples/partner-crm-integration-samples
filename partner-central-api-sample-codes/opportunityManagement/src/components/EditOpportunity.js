import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Header,
  Form,
  FormField,
  Input,
  Textarea,
  Select,
  SpaceBetween,
  Button,
  Box,
  Alert,
  Spinner,
  ColumnLayout
} from "@cloudscape-design/components";
import { hasCredentials } from '../utils/sessionStorage';
import { decodeHtmlEntities } from '../utils/commonUtils';

function EditOpportunity() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [opportunity, setOpportunity] = useState(null);
  const [formData, setFormData] = useState({});
  const [jsonPayload, setJsonPayload] = useState('');
  const [originalJsonPayload, setOriginalJsonPayload] = useState('');

  useEffect(() => {
    // Check if credentials exist
    if (!hasCredentials()) {
      navigate('/');
      return;
    }

    const fetchOpportunity = async () => {
      try {
        setLoading(true);
        
        // Import AWS SDK
        const { PartnerCentralSellingClient, GetOpportunityCommand } = await import("@aws-sdk/client-partnercentral-selling");
        const { getCredentials } = await import('../utils/sessionStorage');
        
        const credentials = getCredentials();
        
        const client = new PartnerCentralSellingClient({
          region: credentials.region || 'us-east-1',
          credentials: {
            accessKeyId: credentials.accessKey,
            secretAccessKey: credentials.secretKey,
            sessionToken: credentials.sessionToken
          }
        });
        
        // Fetch opportunity details
        const command = new GetOpportunityCommand({
          Catalog: credentials.catalog || "Sandbox",
          Identifier: id
        });
        
        const response = await client.send(command);
        setOpportunity(response);
        
        // Prepare form data (only decode HTML entities for text fields that might contain them)
        const formFields = {
          CompanyName: decodeHtmlEntities(response.Customer?.Account?.CompanyName || ''),
          Duns: response.Customer?.Account?.Duns || '',
          Industry: response.Customer?.Account?.Industry || '',
          WebsiteUrl: response.Customer?.Account?.WebsiteUrl || '',
          CountryCode: response.Customer?.Account?.Address?.CountryCode || '',
          PostalCode: response.Customer?.Account?.Address?.PostalCode || '',
          StateOrRegion: response.Customer?.Account?.Address?.StateOrRegion || '',
          City: response.Customer?.Account?.Address?.City || '',
          StreetAddress: response.Customer?.Account?.Address?.StreetAddress || '',
          AwsAccountId: response.Customer?.Account?.AwsAccountId || '',
          CustomerFirstName: response.Customer?.Contacts?.[0]?.FirstName || '',
          CustomerLastName: response.Customer?.Contacts?.[0]?.LastName || '',
          CustomerTitle: response.Customer?.Contacts?.[0]?.BusinessTitle || '',
          CustomerEmail: response.Customer?.Contacts?.[0]?.Email || '',
          CustomerPhone: response.Customer?.Contacts?.[0]?.Phone || '',
          NextSteps: decodeHtmlEntities(response.LifeCycle?.NextSteps || ''),
          ReviewStatus: response.LifeCycle?.ReviewStatus || '',
          Stage: response.LifeCycle?.Stage || '',
          TargetCloseDate: response.LifeCycle?.TargetCloseDate || '',
          AwsFundingUsed: response.Marketing?.AwsFundingUsed || '',
          CampaignName: response.Marketing?.CampaignName || '',
          MarketingChannels: response.Marketing?.Channels || [],
          MarketingSource: response.Marketing?.Source || '',
          MarketingUseCases: response.Marketing?.UseCases || [],
          NationalSecurity: response.NationalSecurity || '',
          OpportunityType: response.OpportunityType || '',
          PrimaryNeedsFromAws: response.PrimaryNeedsFromAws || [],
          CompetitorName: response.Project?.CompetitorName || 'On-Prem',
          CustomerBusinessProblem: decodeHtmlEntities(response.Project?.CustomerBusinessProblem || ''),
          CustomerUseCase: decodeHtmlEntities(response.Project?.CustomerUseCase || ''),
          DeliveryModels: response.Project?.DeliveryModels || [],
          ExpectedAmount: response.Project?.ExpectedCustomerSpend?.[0]?.Amount || '',
          ExpectedCurrency: response.Project?.ExpectedCustomerSpend?.[0]?.CurrencyCode || '',
          ExpectedFrequency: response.Project?.ExpectedCustomerSpend?.[0]?.Frequency || '',
          ExpectedTargetCompany: response.Project?.ExpectedCustomerSpend?.[0]?.TargetCompany || '',
          OtherSolutionDescription: response.Project?.OtherSolutionDescription || '',
          SalesActivities: response.Project?.SalesActivities || [],
          Title: response.Project?.Title || ''
        };
        
        setFormData(formFields);
        
        // Prepare update payload
        const updatePayload = { ...response };
        
        // Decode HTML entities in string fields only
        if (updatePayload.Project?.CustomerUseCase) {
          updatePayload.Project.CustomerUseCase = decodeHtmlEntities(updatePayload.Project.CustomerUseCase);
        }
        if (updatePayload.Project?.CustomerBusinessProblem) {
          updatePayload.Project.CustomerBusinessProblem = decodeHtmlEntities(updatePayload.Project.CustomerBusinessProblem);
        }
        if (updatePayload.Customer?.Account?.CompanyName) {
          updatePayload.Customer.Account.CompanyName = decodeHtmlEntities(updatePayload.Customer.Account.CompanyName);
        }
        updatePayload.Identifier = updatePayload.Id;
        delete updatePayload.Id;
        delete updatePayload.CreatedDate;
        delete updatePayload.OpportunityTeam;
        delete updatePayload.RelatedEntityIdentifiers;
        delete updatePayload.$metadata;
        
        // Remove __type fields from ExpectedCustomerSpend
        if (updatePayload.Project?.ExpectedCustomerSpend) {
          updatePayload.Project.ExpectedCustomerSpend.forEach(spend => {
            delete spend.__type;
          });
        }
        
        const jsonString = JSON.stringify(updatePayload, null, 2).replace(/&amp;/g, '&');
        setJsonPayload(jsonString);
        setOriginalJsonPayload(jsonString);
        
      } catch (error) {
        console.error('Error fetching opportunity:', error);
        setError(`Error: ${error.message || 'Failed to fetch opportunity'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunity();
  }, [id, navigate]);

  // Handle form field changes
  const handleChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Update JSON payload when form changes
    updateJsonPayload(newFormData);
  };

  // Update JSON payload based on form data
  const updateJsonPayload = (currentFormData) => {
    try {
      // Parse the JSON payload but preserve the original structure
      const payload = JSON.parse(jsonPayload.replace(/&/g, '&amp;'));
      
      // Update payload with form data
      if (payload.Customer?.Account) {
        payload.Customer.Account.CompanyName = currentFormData.CompanyName;
        payload.Customer.Account.Duns = currentFormData.Duns;
        payload.Customer.Account.Industry = currentFormData.Industry;
        payload.Customer.Account.WebsiteUrl = currentFormData.WebsiteUrl;
        payload.Customer.Account.AwsAccountId = currentFormData.AwsAccountId;
        
        if (payload.Customer.Account.Address) {
          payload.Customer.Account.Address.CountryCode = currentFormData.CountryCode;
          payload.Customer.Account.Address.PostalCode = currentFormData.PostalCode;
          payload.Customer.Account.Address.StateOrRegion = currentFormData.StateOrRegion;
          payload.Customer.Account.Address.City = currentFormData.City;
          payload.Customer.Account.Address.StreetAddress = currentFormData.StreetAddress;
        }
      }
      
      if (payload.Customer?.Contacts?.[0]) {
        payload.Customer.Contacts[0].FirstName = currentFormData.CustomerFirstName;
        payload.Customer.Contacts[0].LastName = currentFormData.CustomerLastName;
        payload.Customer.Contacts[0].BusinessTitle = currentFormData.CustomerTitle;
        payload.Customer.Contacts[0].Email = currentFormData.CustomerEmail;
        payload.Customer.Contacts[0].Phone = currentFormData.CustomerPhone;
      }
      
      if (payload.LifeCycle) {
        payload.LifeCycle.NextSteps = currentFormData.NextSteps;
        payload.LifeCycle.ReviewStatus = currentFormData.ReviewStatus;
        payload.LifeCycle.Stage = currentFormData.Stage;
        payload.LifeCycle.TargetCloseDate = currentFormData.TargetCloseDate;
      }
      
      if (payload.Marketing) {
        payload.Marketing.AwsFundingUsed = currentFormData.AwsFundingUsed;
        payload.Marketing.CampaignName = currentFormData.CampaignName;
        payload.Marketing.Source = currentFormData.MarketingSource;
      }
      
      payload.NationalSecurity = currentFormData.NationalSecurity;
      payload.OpportunityType = currentFormData.OpportunityType;
      
      if (payload.Project) {
        payload.Project.CompetitorName = currentFormData.CompetitorName;
        payload.Project.CustomerUseCase = currentFormData.CustomerUseCase;
        payload.Project.OtherSolutionDescription = currentFormData.OtherSolutionDescription;
        
        if (payload.Project.ExpectedCustomerSpend?.[0]) {
          payload.Project.ExpectedCustomerSpend[0].Amount = currentFormData.ExpectedAmount;
          payload.Project.ExpectedCustomerSpend[0].CurrencyCode = currentFormData.ExpectedCurrency;
          payload.Project.ExpectedCustomerSpend[0].Frequency = currentFormData.ExpectedFrequency;
          payload.Project.ExpectedCustomerSpend[0].TargetCompany = currentFormData.ExpectedTargetCompany;
          delete payload.Project.ExpectedCustomerSpend[0].__type;
        }
      }
      
      // Remove __type fields from ExpectedCustomerSpend before stringifying
      if (payload.Project?.ExpectedCustomerSpend) {
        payload.Project.ExpectedCustomerSpend.forEach(spend => {
          delete spend.__type;
        });
      }
      
      // Convert back to JSON string with proper date handling
      setJsonPayload(JSON.stringify(payload, (key, value) => {
        // If it's a date string, keep it as is
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
          return value;
        }
        return value;
      }, 2).replace(/&amp;/g, '&'));
    } catch (error) {
      console.error('Error updating JSON payload:', error);
    }
  };

  // Handle form submission - using SimulateReview approach
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      // Prepare update payload like SimulateReview does
      const updatePayload = { ...opportunity };
      
      // Apply form data changes to the payload
      if (updatePayload.Customer?.Account) {
        updatePayload.Customer.Account.CompanyName = formData.CompanyName;
        updatePayload.Customer.Account.Duns = formData.Duns;
        updatePayload.Customer.Account.AwsAccountId = formData.AwsAccountId;
        if (updatePayload.Customer.Account.Address) {
          updatePayload.Customer.Account.Address.StateOrRegion = formData.StateOrRegion;
          updatePayload.Customer.Account.Address.City = formData.City;
          updatePayload.Customer.Account.Address.StreetAddress = formData.StreetAddress;
        }
      }
      
      if (updatePayload.Customer?.Contacts?.[0]) {
        updatePayload.Customer.Contacts[0].FirstName = formData.CustomerFirstName;
        updatePayload.Customer.Contacts[0].LastName = formData.CustomerLastName;
        updatePayload.Customer.Contacts[0].BusinessTitle = formData.CustomerTitle;
        updatePayload.Customer.Contacts[0].Email = formData.CustomerEmail;
        updatePayload.Customer.Contacts[0].Phone = formData.CustomerPhone;
      }
      
      if (updatePayload.LifeCycle) {
        updatePayload.LifeCycle.NextSteps = formData.NextSteps;
        updatePayload.LifeCycle.ReviewStatus = formData.ReviewStatus;
        updatePayload.LifeCycle.Stage = formData.Stage;
        updatePayload.LifeCycle.TargetCloseDate = formData.TargetCloseDate;
      }
      
      if (updatePayload.Marketing) {
        updatePayload.Marketing.AwsFundingUsed = formData.AwsFundingUsed;
        updatePayload.Marketing.CampaignName = formData.CampaignName;
        updatePayload.Marketing.Source = formData.MarketingSource;
      }
      
      updatePayload.NationalSecurity = formData.NationalSecurity;
      updatePayload.OpportunityType = formData.OpportunityType;
      
      if (updatePayload.Project) {
        updatePayload.Project.CustomerUseCase = formData.CustomerUseCase;
        updatePayload.Project.CompetitorName = formData.CompetitorName;
        updatePayload.Project.OtherSolutionDescription = formData.OtherSolutionDescription;
        if (updatePayload.Project.ExpectedCustomerSpend?.[0]) {
          updatePayload.Project.ExpectedCustomerSpend[0].Amount = formData.ExpectedAmount;
        }
      }
      
      // Decode HTML entities in string fields only
      if (updatePayload.Project?.CustomerUseCase) {
        updatePayload.Project.CustomerUseCase = decodeHtmlEntities(updatePayload.Project.CustomerUseCase);
      }
      if (updatePayload.Project?.CustomerBusinessProblem) {
        updatePayload.Project.CustomerBusinessProblem = decodeHtmlEntities(updatePayload.Project.CustomerBusinessProblem);
      }
      
      // Replace Id with Identifier
      updatePayload.Identifier = updatePayload.Id;
      delete updatePayload.Id;
      
      // Remove fields that should not be included
      delete updatePayload.CreatedDate;
      delete updatePayload.OpportunityTeam;
      delete updatePayload.RelatedEntityIdentifiers;
      delete updatePayload.$metadata;
      
      // Import AWS SDK
      const { PartnerCentralSellingClient, UpdateOpportunityCommand } = await import("@aws-sdk/client-partnercentral-selling");
      const { getCredentials } = await import('../utils/sessionStorage');
      
      const credentials = getCredentials();
      
      const client = new PartnerCentralSellingClient({
        region: credentials.region || 'us-east-1',
        credentials: {
          accessKeyId: credentials.accessKey,
          secretAccessKey: credentials.secretKey,
          sessionToken: credentials.sessionToken
        }
      });
      
      // Update opportunity with new data
      const updateCommand = new UpdateOpportunityCommand(updatePayload);
      await client.send(updateCommand);
      
      console.log('Opportunity updated successfully');
      
      // Navigate back to opportunity details
      navigate(`/opportunity/${id}`);
      
    } catch (error) {
      console.error('Error updating opportunity:', error);
      setError(`Error: ${error.message || 'Failed to update opportunity'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Box textAlign="center" padding={{ top: 'l' }}>
          <Spinner size="large" />
          <div>Loading opportunity details...</div>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert type="error">{error}</Alert>
        <Box padding={{ top: 'l' }}>
          <Button onClick={() => navigate(`/opportunity/${id}`)}>Back to Opportunity</Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <SpaceBetween size="l">
        <Header variant="h1">Edit Opportunity</Header>
        
        {error && <Alert type="error">{error}</Alert>}
        
        {/* Basic Information */}
        <Container>
          <Header variant="h2">Basic Information</Header>
          <ColumnLayout columns={2}>
            <FormField label="Opportunity ID">
              <Input value={opportunity?.Id || id} disabled />
            </FormField>
            <FormField label="Last Modified Date">
              <Input value={opportunity?.LastModifiedDate || '-'} disabled />
            </FormField>
          </ColumnLayout>
        </Container>

        {/* Customer Details */}
        <Container>
          <Header variant="h2">Customer Details</Header>
          <Form>
            <ColumnLayout columns={2}>
              <FormField label="Company Name">
                <Input
                  value={formData.CompanyName || ''}
                  onChange={({ detail }) => handleChange('CompanyName', detail.value)}
                />
              </FormField>
              <FormField label="DUNS" errorText={formData.Duns && !/^\d{9}$/.test(formData.Duns) ? 'DUNS must be exactly 9 digits' : ''}>
                <Input
                  value={formData.Duns || ''}
                  onChange={({ detail }) => handleChange('Duns', detail.value)}
                  invalid={formData.Duns && !/^\d{9}$/.test(formData.Duns)}
                />
              </FormField>
              <FormField label="Industry">
                <Input
                  value={formData.Industry || ''}
                  disabled
                />
              </FormField>
              <FormField label="Website URL">
                <Input
                  value={formData.WebsiteUrl || ''}
                  disabled
                />
              </FormField>
              <FormField label="AWS Account ID" errorText={formData.AwsAccountId && !/^(\d{12}|\w{1,12})$/.test(formData.AwsAccountId) ? 'AWS Account ID must be 12 digits or 1-12 word characters' : ''}>
                <Input
                  value={formData.AwsAccountId || ''}
                  onChange={({ detail }) => handleChange('AwsAccountId', detail.value)}
                  invalid={formData.AwsAccountId && !/^(\d{12}|\w{1,12})$/.test(formData.AwsAccountId)}
                />
              </FormField>
              <FormField label="Country Code">
                <Input
                  value={formData.CountryCode || ''}
                  disabled
                />
              </FormField>
              <FormField label="Postal Code">
                <Input
                  value={formData.PostalCode || ''}
                  disabled
                />
              </FormField>
              <FormField label="State or Region">
                <Input
                  value={formData.StateOrRegion || ''}
                  onChange={({ detail }) => handleChange('StateOrRegion', detail.value)}
                />
              </FormField>
              <FormField label="City">
                <Input
                  value={formData.City || ''}
                  onChange={({ detail }) => handleChange('City', detail.value)}
                />
              </FormField>
              <FormField label="Street Address">
                <Input
                  value={formData.StreetAddress || ''}
                  onChange={({ detail }) => handleChange('StreetAddress', detail.value)}
                />
              </FormField>
            </ColumnLayout>
          </Form>
        </Container>

        {/* Customer Contact Details */}
        <Container>
          <Header variant="h2">Customer Contact Details</Header>
          <Form>
            <ColumnLayout columns={2}>
              <FormField label="First Name">
                <Input
                  value={formData.CustomerFirstName || ''}
                  onChange={({ detail }) => handleChange('CustomerFirstName', detail.value)}
                />
              </FormField>
              <FormField label="Last Name">
                <Input
                  value={formData.CustomerLastName || ''}
                  onChange={({ detail }) => handleChange('CustomerLastName', detail.value)}
                />
              </FormField>
              <FormField label="Business Title">
                <Input
                  value={formData.CustomerTitle || ''}
                  onChange={({ detail }) => handleChange('CustomerTitle', detail.value)}
                />
              </FormField>
              <FormField label="Email" errorText={formData.CustomerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.CustomerEmail) ? 'Please enter a valid email address' : ''}>
                <Input
                  value={formData.CustomerEmail || ''}
                  onChange={({ detail }) => handleChange('CustomerEmail', detail.value)}
                  invalid={formData.CustomerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.CustomerEmail)}
                />
              </FormField>
              <FormField label="Phone">
                <Input
                  value={formData.CustomerPhone || ''}
                  onChange={({ detail }) => handleChange('CustomerPhone', detail.value)}
                />
              </FormField>
            </ColumnLayout>
          </Form>
        </Container>

        {/* Project Details */}
        <Container>
          <Header variant="h2">Project Details</Header>
          <Form>
            <FormField label="Project Title">
              <Input
                value={formData.Title || ''}
                disabled
              />
            </FormField>
            <FormField label="Customer Business Problem">
              <Textarea
                value={formData.CustomerBusinessProblem || ''}
                disabled
                rows={4}
              />
            </FormField>
            <FormField label="Partner Opportunity Identifier">
              <Input
                value={opportunity?.PartnerOpportunityIdentifier || ''}
                disabled
              />
            </FormField>
            <ColumnLayout columns={2}>
              <FormField label="Customer Use Case">
                <Select
                  selectedOption={formData.CustomerUseCase ? { value: formData.CustomerUseCase, label: formData.CustomerUseCase } : null}
                  onChange={({ detail }) => handleChange('CustomerUseCase', detail.selectedOption?.value || '')}
                  options={[
                    { value: 'AI Machine Learning and Analytics', label: 'AI Machine Learning and Analytics' },
                    { value: 'Archiving', label: 'Archiving' },
                    { value: 'Big Data: Data Warehouse / Data Integration / ETL / Data Lake / BI', label: 'Big Data: Data Warehouse / Data Integration / ETL / Data Lake / BI' },
                    { value: 'Blockchain', label: 'Blockchain' },
                    { value: 'Business Applications: Mainframe Modernization', label: 'Business Applications: Mainframe Modernization' },
                    { value: 'Business Applications & Contact Center', label: 'Business Applications & Contact Center' },
                    { value: 'Business Applications & SAP Production', label: 'Business Applications & SAP Production' },
                    { value: 'Centralized Operations Management', label: 'Centralized Operations Management' },
                    { value: 'Cloud Management Tools', label: 'Cloud Management Tools' },
                    { value: 'Cloud Management Tools & DevOps with Continuous Integration & Continuous Delivery (CICD)', label: 'Cloud Management Tools & DevOps with Continuous Integration & Continuous Delivery (CICD)' },
                    { value: 'Configuration, Compliance & Auditing', label: 'Configuration, Compliance & Auditing' },
                    { value: 'Connected Services', label: 'Connected Services' },
                    { value: 'Containers & Serverless', label: 'Containers & Serverless' },
                    { value: 'Content Delivery & Edge Services', label: 'Content Delivery & Edge Services' },
                    { value: 'Database', label: 'Database' },
                    { value: 'Edge Computing / End User Computing', label: 'Edge Computing / End User Computing' },
                    { value: 'Energy', label: 'Energy' },
                    { value: 'Enterprise Governance & Controls', label: 'Enterprise Governance & Controls' },
                    { value: 'Enterprise Resource Planning', label: 'Enterprise Resource Planning' },
                    { value: 'Financial Services', label: 'Financial Services' },
                    { value: 'Healthcare and Life Sciences', label: 'Healthcare and Life Sciences' },
                    { value: 'High Performance Computing', label: 'High Performance Computing' },
                    { value: 'Hybrid Application Platform', label: 'Hybrid Application Platform' },
                    { value: 'Industrial Software', label: 'Industrial Software' },
                    { value: 'IOT', label: 'IOT' },
                    { value: 'Manufacturing, Supply Chain and Operations', label: 'Manufacturing, Supply Chain and Operations' },
                    { value: 'Media & High performance computing (HPC)', label: 'Media & High performance computing (HPC)' },
                    { value: 'Migration / Database Migration', label: 'Migration / Database Migration' },
                    { value: 'Monitoring, logging and performance', label: 'Monitoring, logging and performance' },
                    { value: 'Monitoring & Observability', label: 'Monitoring & Observability' },
                    { value: 'Networking', label: 'Networking' },
                    { value: 'Outpost', label: 'Outpost' },
                    { value: 'SAP', label: 'SAP' },
                    { value: 'Security & Compliance', label: 'Security & Compliance' },
                    { value: 'Storage & Backup', label: 'Storage & Backup' },
                    { value: 'Training', label: 'Training' },
                    { value: 'VMC', label: 'VMC' },
                    { value: 'VMWare', label: 'VMWare' },
                    { value: 'Web development & DevOps', label: 'Web development & DevOps' }
                  ]}
                  placeholder="Select customer use case"
                />
              </FormField>
              <FormField label="Target Close Date">
                <Input
                  value={formData.TargetCloseDate || ''}
                  onChange={({ detail }) => handleChange('TargetCloseDate', detail.value)}
                />
              </FormField>
              <FormField label="Competitor Name">
                <Select
                  selectedOption={formData.CompetitorName ? { value: formData.CompetitorName, label: formData.CompetitorName } : null}
                  onChange={({ detail }) => handleChange('CompetitorName', detail.selectedOption?.value || '')}
                  options={[
                    { value: 'Oracle Cloud', label: 'Oracle Cloud' },
                    { value: 'On-Prem', label: 'On-Prem' },
                    { value: 'Co-location', label: 'Co-location' },
                    { value: 'Akamai', label: 'Akamai' },
                    { value: 'AliCloud', label: 'AliCloud' },
                    { value: 'Google Cloud Platform', label: 'Google Cloud Platform' },
                    { value: 'IBM Softlayer', label: 'IBM Softlayer' },
                    { value: 'Microsoft Azure', label: 'Microsoft Azure' },
                    { value: 'Other- Cost Optimization', label: 'Other- Cost Optimization' },
                    { value: 'No Competition', label: 'No Competition' },
                    { value: '*Other', label: '*Other' }
                  ]}
                  placeholder="Select competitor"
                />
              </FormField>
              <FormField label="Other Solution Description">
                <Input
                  value={formData.OtherSolutionDescription || ''}
                  onChange={({ detail }) => handleChange('OtherSolutionDescription', detail.value)}
                />
              </FormField>
              <FormField label="Expected Amount" errorText={formData.ExpectedAmount && !/^(?:(?:[1-9](\.\d+)?|\d{2,15}(\.\d+)?|1000000000000000(\.\d+)?)|0\.(?!0+$)\d+)$/.test(formData.ExpectedAmount) ? 'Invalid amount format' : ''}>
                <Input
                  value={formData.ExpectedAmount || ''}
                  onChange={({ detail }) => handleChange('ExpectedAmount', detail.value)}
                  invalid={formData.ExpectedAmount && !/^(?:(?:[1-9](\.\d+)?|\d{2,15}(\.\d+)?|1000000000000000(\.\d+)?)|0\.(?!0+$)\d+)$/.test(formData.ExpectedAmount)}
                />
              </FormField>
              <FormField label="Expected Currency">
                <Input
                  value={formData.ExpectedCurrency || ''}
                  disabled
                />
              </FormField>
            </ColumnLayout>
          </Form>
        </Container>

        {/* Lifecycle Details */}
        <Container>
          <Header variant="h2">Lifecycle Details</Header>
          <Form>
            <ColumnLayout columns={2}>
              <FormField label="Next Steps">
                <Textarea
                  value={formData.NextSteps || ''}
                  onChange={({ detail }) => handleChange('NextSteps', detail.value)}
                  rows={3}
                />
              </FormField>
              <FormField label="Review Status">
                <Select
                  selectedOption={formData.ReviewStatus ? { value: formData.ReviewStatus, label: formData.ReviewStatus } : null}
                  onChange={({ detail }) => handleChange('ReviewStatus', detail.selectedOption?.value || '')}
                  options={[
                    { value: 'Draft', label: 'Draft' },
                    { value: 'Submitted', label: 'Submitted' },
                    { value: 'Approved', label: 'Approved' },
                    { value: 'Rejected', label: 'Rejected' },
                    { value: 'Action Required', label: 'Action Required' }
                  ]}
                  placeholder="Select review status"
                />
              </FormField>
              <FormField label="Stage">
                <Select
                  selectedOption={formData.Stage ? { value: formData.Stage, label: formData.Stage } : null}
                  onChange={({ detail }) => handleChange('Stage', detail.selectedOption?.value || '')}
                  options={[
                    { value: 'Prospect', label: 'Prospect' },
                    { value: 'Qualified', label: 'Qualified' },
                    { value: 'Technical Validation', label: 'Technical Validation' },
                    { value: 'Business Validation', label: 'Business Validation' },
                    { value: 'Committed', label: 'Committed' },
                    { value: 'Launched', label: 'Launched' },
                    { value: 'Closed Lost', label: 'Closed Lost' }
                  ]}
                  placeholder="Select stage"
                />
              </FormField>
              <FormField label="Opportunity Type">
                <Select
                  selectedOption={formData.OpportunityType ? { value: formData.OpportunityType, label: formData.OpportunityType } : null}
                  onChange={({ detail }) => handleChange('OpportunityType', detail.selectedOption?.value || '')}
                  options={[
                    { value: 'Net New Business', label: 'Net New Business' },
                    { value: 'Expansion', label: 'Expansion' },
                    { value: 'Flat Renewal', label: 'Flat Renewal' }
                  ]}
                  placeholder="Select opportunity type"
                />
              </FormField>
            </ColumnLayout>
          </Form>
        </Container>

        {/* Marketing Details */}
        <Container>
          <Header variant="h2">Marketing Details</Header>
          <Form>
            <ColumnLayout columns={2}>
              <FormField label="AWS Funding Used">
                <Select
                  selectedOption={formData.AwsFundingUsed ? { value: formData.AwsFundingUsed, label: formData.AwsFundingUsed } : null}
                  onChange={({ detail }) => handleChange('AwsFundingUsed', detail.selectedOption?.value || '')}
                  options={[
                    { value: 'Yes', label: 'Yes' },
                    { value: 'No', label: 'No' }
                  ]}
                  placeholder="Select AWS funding used"
                />
              </FormField>
              <FormField label="Campaign Name">
                <Input
                  value={formData.CampaignName || ''}
                  onChange={({ detail }) => handleChange('CampaignName', detail.value)}
                />
              </FormField>
              <FormField label="Marketing Source">
                <Select
                  selectedOption={formData.MarketingSource ? { value: formData.MarketingSource, label: formData.MarketingSource } : null}
                  onChange={({ detail }) => handleChange('MarketingSource', detail.selectedOption?.value || '')}
                  options={[
                    { value: 'Marketing Activity', label: 'Marketing Activity' },
                    { value: 'None', label: 'None' }
                  ]}
                  placeholder="Select marketing source"
                />
              </FormField>
              <FormField label="National Security">
                <Select
                  selectedOption={formData.NationalSecurity ? { value: formData.NationalSecurity, label: formData.NationalSecurity } : null}
                  onChange={({ detail }) => handleChange('NationalSecurity', detail.selectedOption?.value || '')}
                  options={[
                    { value: 'Yes', label: 'Yes' },
                    { value: 'No', label: 'No' }
                  ]}
                  placeholder="Select national security"
                />
              </FormField>
            </ColumnLayout>
          </Form>
        </Container>

        {/* JSON Payload */}
        <Container>
          <Header variant="h2">UpdateOpportunity JSON Payload</Header>
          <FormField label="Request Payload">
            <Textarea
              value={jsonPayload}
              readOnly
              rows={20}
              placeholder="JSON payload for UpdateOpportunity API"
            />
          </FormField>
        </Container>
        
        <SpaceBetween direction="horizontal" size="xs" alignItems="center">
          <Button variant="link" onClick={() => navigate(`/opportunity/${id}`)}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={submitting}>Update Opportunity</Button>
        </SpaceBetween>
      </SpaceBetween>
    </Container>
  );
}

export default EditOpportunity;