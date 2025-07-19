import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { hasCredentials, getCredentials } from '../utils/sessionStorage';
import {
  Container,
  Header,
  Form,
  FormField,
  Input,
  Select,
  SpaceBetween,
  Button,
  Textarea,
  RadioGroup,
  DatePicker,
  Box,
  Alert
} from "@cloudscape-design/components";

function CreateAwsOpportunity() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  
  useEffect(() => {
    // Check if credentials exist
    if (!hasCredentials()) {
      navigate('/');
      return;
    }
  }, [navigate]);
  
  // Generate a random UUID for clientToken
  const [clientToken] = useState(uuidv4());

  // Function to generate a random title
  const generateRandomTitle = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
    return `New Business Deal ${randomNum}`;
  };
  
  // Form state
  // Options arrays
  const salesActivitiesOptions = [
    { value: "Conducted POC / Demo", label: "Conducted POC / Demo" },
    { value: "Customer has shown interest in solution", label: "Customer has shown interest in solution" },
    { value: "Identified decision makers", label: "Identified decision makers" },
    { value: "Identified budget", label: "Identified budget" }
  ];
  
  const useCaseOptions = [
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
  ];
  
  const deliveryModelOptions = [
    { value: "SaaS or PaaS", label: "SaaS or PaaS" },
    { value: "Resell", label: "Resell" },
    { value: "BYOL or AMI", label: "BYOL or AMI" },
    { value: "Other", label: "Other" },
    { value: "Professional Services", label: "Professional Services" },
    { value: "Managed Services", label: "Managed Services" }
  ];
  
  const competitorOptions = [
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
  ];

  const stateOptions = [
    { value: '', label: 'Select state or region' },
    { value: 'Alabama', label: 'Alabama' }, { value: 'Alaska', label: 'Alaska' }, { value: 'American Samoa', label: 'American Samoa' }, { value: 'APO/AE', label: 'APO/AE' }, { value: 'Arizona', label: 'Arizona' }, { value: 'Arkansas', label: 'Arkansas' }, { value: 'California', label: 'California' }, { value: 'Colorado', label: 'Colorado' }, { value: 'Connecticut', label: 'Connecticut' }, { value: 'Delaware', label: 'Delaware' }, { value: 'Dist. of Columbia', label: 'Dist. of Columbia' }, { value: 'Federated States of Micronesia', label: 'Federated States of Micronesia' }, { value: 'Florida', label: 'Florida' }, { value: 'FPO, AP', label: 'FPO, AP' }, { value: 'Georgia', label: 'Georgia' }, { value: 'Guam', label: 'Guam' }, { value: 'Hawaii', label: 'Hawaii' }, { value: 'Idaho', label: 'Idaho' }, { value: 'Illinois', label: 'Illinois' }, { value: 'Indiana', label: 'Indiana' }, { value: 'Iowa', label: 'Iowa' }, { value: 'Kansas', label: 'Kansas' }, { value: 'Kentucky', label: 'Kentucky' }, { value: 'Louisiana', label: 'Louisiana' }, { value: 'Maine', label: 'Maine' }, { value: 'Marshall Islands', label: 'Marshall Islands' }, { value: 'Maryland', label: 'Maryland' }, { value: 'Massachusetts', label: 'Massachusetts' }, { value: 'Michigan', label: 'Michigan' }, { value: 'Minnesota', label: 'Minnesota' }, { value: 'Mississippi', label: 'Mississippi' }, { value: 'Missouri', label: 'Missouri' }, { value: 'Montana', label: 'Montana' }, { value: 'Nebraska', label: 'Nebraska' }, { value: 'Nevada', label: 'Nevada' }, { value: 'New Hampshire', label: 'New Hampshire' }, { value: 'New Jersey', label: 'New Jersey' }, { value: 'New Mexico', label: 'New Mexico' }, { value: 'New York', label: 'New York' }, { value: 'North Carolina', label: 'North Carolina' }, { value: 'North Dakota', label: 'North Dakota' }, { value: 'Ohio', label: 'Ohio' }, { value: 'Oklahoma', label: 'Oklahoma' }, { value: 'Oregon', label: 'Oregon' }, { value: 'Palau', label: 'Palau' }, { value: 'Pennsylvania', label: 'Pennsylvania' }, { value: 'Puerto Rico', label: 'Puerto Rico' }, { value: 'Rhode Island', label: 'Rhode Island' }, { value: 'South Carolina', label: 'South Carolina' }, { value: 'South Dakota', label: 'South Dakota' }, { value: 'Tennessee', label: 'Tennessee' }, { value: 'Texas', label: 'Texas' }, { value: 'Utah', label: 'Utah' }, { value: 'Vermont', label: 'Vermont' }, { value: 'Virginia', label: 'Virginia' }, { value: 'Virgin Islands', label: 'Virgin Islands' }, { value: 'Washington', label: 'Washington' }, { value: 'West Virginia', label: 'West Virginia' }, { value: 'Wisconsin', label: 'Wisconsin' }, { value: 'Wyoming', label: 'Wyoming' }
  ];

  const apnProgramOptions = [
    { value: "APN Immersion Days", label: "APN Immersion Days" },
    { value: "APN Solution Space", label: "APN Solution Space" },
    { value: "ATO (Authority to Operate)", label: "ATO (Authority to Operate)" },
    { value: "AWS Marketplace Campaign", label: "AWS Marketplace Campaign" },
    { value: "IS Immersion Day SFID Program", label: "IS Immersion Day SFID Program" },
    { value: "ISV Workload Migration", label: "ISV Workload Migration" },
    { value: "Migration Acceleration Program", label: "Migration Acceleration Program" },
    { value: "P3", label: "P3" },
    { value: "Partner Launch Initiative", label: "Partner Launch Initiative" },
    { value: "Partner Opportunity Acceleration Funded", label: "Partner Opportunity Acceleration Funded" },
    { value: "The Next Smart", label: "The Next Smart" },
    { value: "VMware Cloud on AWS", label: "VMware Cloud on AWS" },
    { value: "Well-Architected", label: "Well-Architected" },
    { value: "Windows", label: "Windows" },
    { value: "Workspaces/AppStream Accelerator Program", label: "Workspaces/AppStream Accelerator Program" },
    { value: "WWPS NDPP", label: "WWPS NDPP" }
  ];

  const marketingChannelsOptions = [
    { value: "TV", label: "TV" },
    { value: "Display", label: "Display" },
    { value: "Virtual Event", label: "Virtual Event" },
    { value: "Live Event", label: "Live Event" },
    { value: "Search", label: "Search" },
    { value: "Social", label: "Social" },
    { value: "Print", label: "Print" },
    { value: "Content Syndication", label: "Content Syndication" },
    { value: "AWS Marketing Central", label: "AWS Marketing Central" },
    { value: "Video", label: "Video" },
    { value: "Telemarketing", label: "Telemarketing" },
    { value: "Email", label: "Email" },
    { value: "Out Of Home (OOH)", label: "Out Of Home (OOH)" }
  ];

  const marketingSourceOptions = [
    { value: "Marketing Activity", label: "Marketing Activity" },
    { value: "None", label: "None" }
  ];

  const marketingUseCasesOptions = [
    { value: "AI/ML", label: "AI/ML" },
    { value: "Analytics", label: "Analytics" },
    { value: "Application Integration", label: "Application Integration" },
    { value: "Blockchain", label: "Blockchain" },
    { value: "Business Applications", label: "Business Applications" },
    { value: "Cloud Financial Management", label: "Cloud Financial Management" },
    { value: "Compute", label: "Compute" },
    { value: "Containers", label: "Containers" },
    { value: "Customer Engagement", label: "Customer Engagement" },
    { value: "Databases", label: "Databases" },
    { value: "Developer Tools", label: "Developer Tools" },
    { value: "End User Computing", label: "End User Computing" },
    { value: "Front End Web & Mobile", label: "Front End Web & Mobile" },
    { value: "Game Tech", label: "Game Tech" },
    { value: "IoT", label: "IoT" },
    { value: "Management & Governance", label: "Management & Governance" },
    { value: "Media Services", label: "Media Services" },
    { value: "Migration & Transfer", label: "Migration & Transfer" },
    { value: "Networking & Content Delivery", label: "Networking & Content Delivery" },
    { value: "Quantum Technologies", label: "Quantum Technologies" },
    { value: "Robotics", label: "Robotics" },
    { value: "Satellite", label: "Satellite" },
    { value: "Security", label: "Security" },
    { value: "Serverless", label: "Serverless" },
    { value: "Storage", label: "Storage" },
    { value: "VR & AR", label: "VR & AR" }
  ];

  const softwareDeliveryModelOptions = [
    { value: "Pay-as-you-go", label: "Pay-as-you-go" },
    { value: "Contract", label: "Contract" },
    { value: "Subscription", label: "Subscription" }
  ];

  const currencyOptions = [
    { value: "USD", label: "USD" }, { value: "EUR", label: "EUR" }, { value: "GBP", label: "GBP" }, { value: "JPY", label: "JPY" }, { value: "CAD", label: "CAD" }, { value: "AUD", label: "AUD" }, { value: "CHF", label: "CHF" }, { value: "CNY", label: "CNY" }, { value: "SEK", label: "SEK" }, { value: "NZD", label: "NZD" }, { value: "MXN", label: "MXN" }, { value: "SGD", label: "SGD" }, { value: "HKD", label: "HKD" }, { value: "NOK", label: "NOK" }, { value: "KRW", label: "KRW" }, { value: "TRY", label: "TRY" }, { value: "RUB", label: "RUB" }, { value: "INR", label: "INR" }, { value: "BRL", label: "BRL" }, { value: "ZAR", label: "ZAR" }, { value: "SVC", label: "SVC" }, { value: "FJD", label: "FJD" }, { value: "DJF", label: "DJF" }, { value: "CHE", label: "CHE" }, { value: "AED", label: "AED" }, { value: "TWD", label: "TWD" }, { value: "RWF", label: "RWF" }, { value: "MZN", label: "MZN" }, { value: "MWK", label: "MWK" }, { value: "JMD", label: "JMD" }, { value: "ISK", label: "ISK" }, { value: "HRK", label: "HRK" }, { value: "ERN", label: "ERN" }, { value: "ALL", label: "ALL" }, { value: "SCR", label: "SCR" }, { value: "QAR", label: "QAR" }, { value: "ARS", label: "ARS" }, { value: "RSD", label: "RSD" }, { value: "ZMW", label: "ZMW" }, { value: "XUA", label: "XUA" }, { value: "TTD", label: "TTD" }, { value: "SAR", label: "SAR" }, { value: "KMF", label: "KMF" }, { value: "GTQ", label: "GTQ" }, { value: "DKK", label: "DKK" }, { value: "COP", label: "COP" }, { value: "BBD", label: "BBD" }, { value: "UYI", label: "UYI" }, { value: "SZL", label: "SZL" }, { value: "SRD", label: "SRD" }, { value: "LSL", label: "LSL" }, { value: "KZT", label: "KZT" }, { value: "DOP", label: "DOP" }, { value: "CDF", label: "CDF" }, { value: "YER", label: "YER" }, { value: "XDR", label: "XDR" }, { value: "UGX", label: "UGX" }, { value: "MYR", label: "MYR" }, { value: "MKD", label: "MKD" }, { value: "HNL", label: "HNL" }, { value: "MGA", label: "MGA" }, { value: "CLP", label: "CLP" }, { value: "MVR", label: "MVR" }, { value: "IRR", label: "IRR" }, { value: "COU", label: "COU" }, { value: "BOV", label: "BOV" }, { value: "BGN", label: "BGN" }, { value: "AFN", label: "AFN" }, { value: "TND", label: "TND" }, { value: "SYP", label: "SYP" }, { value: "MUR", label: "MUR" }, { value: "MXV", label: "MXV" }, { value: "MMK", label: "MMK" }, { value: "FKP", label: "FKP" }, { value: "VND", label: "VND" }, { value: "BZD", label: "BZD" }, { value: "TZS", label: "TZS" }, { value: "STN", label: "STN" }, { value: "XPF", label: "XPF" }, { value: "UZS", label: "UZS" }, { value: "THB", label: "THB" }, { value: "MOP", label: "MOP" }, { value: "GIP", label: "GIP" }, { value: "GEL", label: "GEL" }, { value: "EGP", label: "EGP" }, { value: "DZD", label: "DZD" }, { value: "BAM", label: "BAM" }, { value: "ZWL", label: "ZWL" }, { value: "XOF", label: "XOF" }, { value: "USN", label: "USN" }, { value: "SSP", label: "SSP" }, { value: "NPR", label: "NPR" }, { value: "MRU", label: "MRU" }, { value: "MAD", label: "MAD" }, { value: "ILS", label: "ILS" }, { value: "UYU", label: "UYU" }, { value: "RON", label: "RON" }, { value: "PAB", label: "PAB" }, { value: "NAD", label: "NAD" }, { value: "CUC", label: "CUC" }, { value: "AWG", label: "AWG" }, { value: "PLN", label: "PLN" }, { value: "KPW", label: "KPW" }, { value: "GYD", label: "GYD" }, { value: "GHS", label: "GHS" }, { value: "CVE", label: "CVE" }, { value: "CHW", label: "CHW" }, { value: "BDT", label: "BDT" }, { value: "SLL", label: "SLL" }, { value: "MNT", label: "MNT" }, { value: "LKR", label: "LKR" }, { value: "ETB", label: "ETB" }, { value: "BSD", label: "BSD" }, { value: "AOA", label: "AOA" }, { value: "PGK", label: "PGK" }, { value: "OMR", label: "OMR" }, { value: "NIO", label: "NIO" }, { value: "CZK", label: "CZK" }, { value: "CRC", label: "CRC" }, { value: "TOP", label: "TOP" }, { value: "SBD", label: "SBD" }, { value: "NGN", label: "NGN" }, { value: "MDL", label: "MDL" }, { value: "KHR", label: "KHR" }, { value: "BOB", label: "BOB" }, { value: "AZN", label: "AZN" }, { value: "SDG", label: "SDG" }, { value: "LAK", label: "LAK" }, { value: "KYD", label: "KYD" }, { value: "VUV", label: "VUV" }, { value: "VEF", label: "VEF" }, { value: "SOS", label: "SOS" }, { value: "PKR", label: "PKR" }, { value: "LYD", label: "LYD" }, { value: "KGS", label: "KGS" }, { value: "IDR", label: "IDR" }, { value: "BYN", label: "BYN" }, { value: "WST", label: "WST" }, { value: "PHP", label: "PHP" }, { value: "KWD", label: "KWD" }, { value: "BND", label: "BND" }, { value: "AMD", label: "AMD" }, { value: "XCD", label: "XCD" }, { value: "PEN", label: "PEN" }, { value: "KES", label: "KES" }, { value: "HUF", label: "HUF" }, { value: "BMD", label: "BMD" }, { value: "XSU", label: "XSU" }, { value: "LBP", label: "LBP" }, { value: "ANG", label: "ANG" }, { value: "TMT", label: "TMT" }, { value: "SHP", label: "SHP" }, { value: "HTG", label: "HTG" }, { value: "BWP", label: "BWP" }, { value: "UAH", label: "UAH" }, { value: "IQD", label: "IQD" }, { value: "BTN", label: "BTN" }, { value: "XAF", label: "XAF" }, { value: "TJS", label: "TJS" }, { value: "CLF", label: "CLF" }, { value: "PYG", label: "PYG" }, { value: "LRD", label: "LRD" }, { value: "GMD", label: "GMD" }, { value: "CUP", label: "CUP" }, { value: "BHD", label: "BHD" }, { value: "JOD", label: "JOD" }, { value: "GNF", label: "GNF" }, { value: "BIF", label: "BIF" }
  ];

  const countryOptions = [
    { value: 'TT', label: 'TT' }, { value: 'SS', label: 'SS' }, { value: 'MM', label: 'MM' }, { value: 'GG', label: 'GG' }, { value: 'EE', label: 'EE' }, { value: 'CC', label: 'CC' }, { value: 'BB', label: 'BB' }, { value: 'RS', label: 'RS' }, { value: 'ST', label: 'ST' }, { value: 'NO', label: 'NO' }, { value: 'MN', label: 'MN' }, { value: 'GH', label: 'GH' }, { value: 'DE', label: 'DE' }, { value: 'CD', label: 'CD' }, { value: 'TV', label: 'TV' }, { value: 'PR', label: 'PR' }, { value: 'NP', label: 'NP' }, { value: 'MO', label: 'MO' }, { value: 'GI', label: 'GI' }, { value: 'EG', label: 'EG' }, { value: 'KM', label: 'KM' }, { value: 'BD', label: 'BD' }, { value: 'EH', label: 'EH' }, { value: 'TW', label: 'TW' }, { value: 'KN', label: 'KN' }, { value: 'RU', label: 'RU' }, { value: 'PS', label: 'PS' }, { value: 'MP', label: 'MP' }, { value: 'JM', label: 'JM' }, { value: 'IL', label: 'IL' }, { value: 'HK', label: 'HK' }, { value: 'FI', label: 'FI' }, { value: 'SV', label: 'SV' }, { value: 'CF', label: 'CF' }, { value: 'BE', label: 'BE' }, { value: 'AD', label: 'AD' }, { value: 'UY', label: 'UY' }, { value: 'AE', label: 'AE' }, { value: 'PT', label: 'PT' }, { value: 'NR', label: 'NR' }, { value: 'MQ', label: 'MQ' }, { value: 'IM', label: 'IM' }, { value: 'FJ', label: 'FJ' }, { value: 'CG', label: 'CG' }, { value: 'BF', label: 'BF' }, { value: 'UZ', label: 'UZ' }, { value: 'CH', label: 'CH' }, { value: 'SX', label: 'SX' }, { value: 'RW', label: 'RW' }, { value: 'MR', label: 'MR' }, { value: 'JO', label: 'JO' }, { value: 'IN', label: 'IN' }, { value: 'HM', label: 'HM' }, { value: 'GL', label: 'GL' }, { value: 'FK', label: 'FK' }, { value: 'BG', label: 'BG' }, { value: 'AF', label: 'AF' }, { value: 'TZ', label: 'TZ' }, { value: 'SY', label: 'SY' }, { value: 'MS', label: 'MS' }, { value: 'LR', label: 'LR' }, { value: 'JP', label: 'JP' }, { value: 'HN', label: 'HN' }, { value: 'GM', label: 'GM' }, { value: 'DJ', label: 'DJ' }, { value: 'CI', label: 'CI' }, { value: 'IO', label: 'IO' }, { value: 'BH', label: 'BH' }, { value: 'AG', label: 'AG' }, { value: 'SZ', label: 'SZ' }, { value: 'ZA', label: 'ZA' }, { value: 'PW', label: 'PW' }, { value: 'NU', label: 'NU' }, { value: 'FM', label: 'FM' }, { value: 'MT', label: 'MT' }, { value: 'LS', label: 'LS' }, { value: 'KR', label: 'KR' }, { value: 'GN', label: 'GN' }, { value: 'DK', label: 'DK' }, { value: 'BI', label: 'BI' }, { value: 'MU', label: 'MU' }, { value: 'LT', label: 'LT' }, { value: 'IQ', label: 'IQ' }, { value: 'CK', label: 'CK' }, { value: 'BJ', label: 'BJ' }, { value: 'AI', label: 'AI' }, { value: 'PY', label: 'PY' }, { value: 'MV', label: 'MV' }, { value: 'LU', label: 'LU' }, { value: 'IR', label: 'IR' }, { value: 'GP', label: 'GP' }, { value: 'FO', label: 'FO' }, { value: 'DM', label: 'DM' }, { value: 'CL', label: 'CL' }, { value: 'BL', label: 'BL' }, { value: 'MW', label: 'MW' }, { value: 'LV', label: 'LV' }, { value: 'IS', label: 'IS' }, { value: 'GQ', label: 'GQ' }, { value: 'HR', label: 'HR' }, { value: 'CM', label: 'CM' }, { value: 'MX', label: 'MX' }, { value: 'IT', label: 'IT' }, { value: 'VA', label: 'VA' }, { value: 'GR', label: 'GR' }, { value: 'DO', label: 'DO' }, { value: 'CN', label: 'CN' }, { value: 'BM', label: 'BM' }, { value: 'AL', label: 'AL' }, { value: 'YE', label: 'YE' }, { value: 'UA', label: 'UA' }, { value: 'GS', label: 'GS' }, { value: 'NZ', label: 'NZ' }, { value: 'MY', label: 'MY' }, { value: 'KW', label: 'KW' }, { value: 'HT', label: 'HT' }, { value: 'FR', label: 'FR' }, { value: 'CO', label: 'CO' }, { value: 'BN', label: 'BN' }, { value: 'AM', label: 'AM' }, { value: 'VC', label: 'VC' }, { value: 'AN', label: 'AN' }, { value: 'MZ', label: 'MZ' }, { value: 'LY', label: 'LY' }, { value: 'HU', label: 'HU' }, { value: 'GT', label: 'GT' }, { value: 'ER', label: 'ER' }, { value: 'BO', label: 'BO' }, { value: 'ES', label: 'ES' }, { value: 'SA', label: 'SA' }, { value: 'GU', label: 'GU' }, { value: 'KY', label: 'KY' }, { value: 'AO', label: 'AO' }, { value: 'WF', label: 'WF' }, { value: 'VE', label: 'VE' }, { value: 'TC', label: 'TC' }, { value: 'SB', label: 'SB' }, { value: 'KZ', label: 'KZ' }, { value: 'ET', label: 'ET' }, { value: 'CR', label: 'CR' }, { value: 'BQ', label: 'BQ' }, { value: 'SC', label: 'SC' }, { value: 'QA', label: 'QA' }, { value: 'GW', label: 'GW' }, { value: 'TD', label: 'TD' }, { value: 'BR', label: 'BR' }, { value: 'AQ', label: 'AQ' }, { value: 'VG', label: 'VG' }, { value: 'SD', label: 'SD' }, { value: 'PA', label: 'PA' }, { value: 'BS', label: 'BS' }, { value: 'AR', label: 'AR' }, { value: 'UG', label: 'UG' }, { value: 'SE', label: 'SE' }, { value: 'GY', label: 'GY' }, { value: 'TF', label: 'TF' }, { value: 'CU', label: 'CU' }, { value: 'BT', label: 'BT' }, { value: 'AS', label: 'AS' }, { value: 'ZM', label: 'ZM' }, { value: 'VI', label: 'VI' }, { value: 'TG', label: 'TG' }, { value: 'RE', label: 'RE' }, { value: 'NA', label: 'NA' }, { value: 'CV', label: 'CV' }, { value: 'AT', label: 'AT' }, { value: 'TH', label: 'TH' }, { value: 'SG', label: 'SG' }, { value: 'MA', label: 'MA' }, { value: 'CW', label: 'CW' }, { value: 'BV', label: 'BV' }, { value: 'AU', label: 'AU' }, { value: 'SH', label: 'SH' }, { value: 'PE', label: 'PE' }, { value: 'NC', label: 'NC' }, { value: 'LA', label: 'LA' }, { value: 'CX', label: 'CX' }, { value: 'BW', label: 'BW' }, { value: 'TJ', label: 'TJ' }, { value: 'SI', label: 'SI' }, { value: 'MC', label: 'MC' }, { value: 'LB', label: 'LB' }, { value: 'PF', label: 'PF' }, { value: 'CY', label: 'CY' }, { value: 'AW', label: 'AW' }, { value: 'DZ', label: 'DZ' }, { value: 'TK', label: 'TK' }, { value: 'SJ', label: 'SJ' }, { value: 'LC', label: 'LC' }, { value: 'PG', label: 'PG' }, { value: 'NE', label: 'NE' }, { value: 'MD', label: 'MD' }, { value: 'CZ', label: 'CZ' }, { value: 'BY', label: 'BY' }, { value: 'AX', label: 'AX' }, { value: 'VN', label: 'VN' }, { value: 'UM', label: 'UM' }, { value: 'TL', label: 'TL' }, { value: 'SK', label: 'SK' }, { value: 'PH', label: 'PH' }, { value: 'NF', label: 'NF' }, { value: 'ME', label: 'ME' }, { value: 'BZ', label: 'BZ' }, { value: 'TM', label: 'TM' }, { value: 'SL', label: 'SL' }, { value: 'MF', label: 'MF' }, { value: 'NG', label: 'NG' }, { value: 'AZ', label: 'AZ' }, { value: 'TN', label: 'TN' }, { value: 'SM', label: 'SM' }, { value: 'MG', label: 'MG' }, { value: 'KE', label: 'KE' }, { value: 'GA', label: 'GA' }, { value: 'GB', label: 'GB' }, { value: 'TO', label: 'TO' }, { value: 'SN', label: 'SN' }, { value: 'PK', label: 'PK' }, { value: 'NI', label: 'NI' }, { value: 'YT', label: 'YT' }, { value: 'MH', label: 'MH' }, { value: 'JE', label: 'JE' }, { value: 'ID', label: 'ID' }, { value: 'SO', label: 'SO' }, { value: 'WS', label: 'WS' }, { value: 'PL', label: 'PL' }, { value: 'KG', label: 'KG' }, { value: 'IE', label: 'IE' }, { value: 'ZW', label: 'ZW' }, { value: 'PM', label: 'PM' }, { value: 'RO', label: 'RO' }, { value: 'LI', label: 'LI' }, { value: 'GD', label: 'GD' }, { value: 'KH', label: 'KH' }, { value: 'TR', label: 'TR' }, { value: 'PN', label: 'PN' }, { value: 'OM', label: 'OM' }, { value: 'NL', label: 'NL' }, { value: 'MK', label: 'MK' }, { value: 'KI', label: 'KI' }, { value: 'GE', label: 'GE' }, { value: 'EC', label: 'EC' }, { value: 'CA', label: 'CA' }, { value: 'US', label: 'US' }, { value: 'VU', label: 'VU' }, { value: 'SR', label: 'SR' }, { value: 'LK', label: 'LK' }, { value: 'ML', label: 'ML' }, { value: 'GF', label: 'GF' }, { value: 'BA', label: 'BA' }
  ];

  const [formData, setFormData] = useState({
    // System fields
    ClientToken: clientToken,
    Catalog: getCredentials().catalog || "Sandbox",
    Origin: "AWS Referral", // Changed from "Partner Referral"
    
    // Customer Account
    CompanyName: "ValidAWSCreate",
    Duns: "111100111",
    Industry: "Financial Services",
    OtherIndustry: "",
    WebsiteUrl: "veracode.com",
    CountryCode: "US",
    PostalCode: "10001",
    StateOrRegion: "New York",
    City: "",
    StreetAddress: "",
    AwsAccountId: "111111111112",
    
    // Customer Contact
    CustomerFirstName: "TestContact011",
    CustomerLastName: "MLastName001",
    CustomerTitle: "Executive",
    CustomerEmail: "test@test.com",
    CustomerPhone: "+14444444444",
    
    // Lifecycle
    NextSteps: "Next steps on the opportunity. TEST is used to communicate to AWS the next action required, please update.",
    ReviewStatus: "Pending Submission",
    Stage: "Prospect",
    TargetCloseDate: "2029-10-05",
    
    // Marketing
    AwsFundingUsed: "Yes",
    CampaignName: "TestCampaignName01",
    MarketingChannels: ["Content Syndication"],
    MarketingSource: "Marketing Activity",
    MarketingUseCases: ["Analytics"],
    MarketingSourced: "sourced",
    
    // National Security
    NationalSecurity: "No",
    
    // Partner Contact
    PartnerFirstName: "TestContact001",
    PartnerLastName: "CLastName001",
    PartnerTitle: "PartnerAccountManager",
    PartnerEmail: "test@test.com",
    PartnerPhone: "+14444444444",
    
    // Opportunity
    OpportunityType: "Net New Business",
    PrimaryNeedsFromAws: ["Co-Sell - Architectural Validation"],
    PrimaryNeed: "cosell",
    
    // Project
    CompetitorName: "On-Prem",
    CustomerBusinessProblem: "A very important problem goes here ValidAWSCreate",
    CustomerUseCase: "Security & Compliance",
    DeliveryModels: ["SaaS or PaaS"],
    ExpectedAmount: "12900",
    ExpectedCurrency: "USD",
    ExpectedFrequency: "Monthly",
    ExpectedTargetCompany: "AWS",
    OtherSolutionDescription: "TestSolution",
    SalesActivities: ["Conducted POC / Demo"],
    Title: generateRandomTitle(),
    ApnPrograms: [],
    PartnerOpportunityIdentifier: null,
    
    // Software Revenue
    SoftwareDeliveryModel: "Pay-as-you-go",
    SoftwareEffectiveDate: new Date().toISOString().split('T')[0], // Today's date
    SoftwareExpirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], // One year from today
    SoftwareAmount: "6000",
    SoftwareCurrencyCode: "USD"
  });

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Get credentials for catalog
    const { getCredentials } = await import('../utils/sessionStorage');
    const credentials = getCredentials();
    
    // Construct the payload
    const payload = {
      ClientToken: formData.ClientToken,
      Catalog: credentials.catalog || "Sandbox",
      Origin: formData.Origin,
      Customer: {
        Account: {
          Address: {
            City: formData.City || null,
            CountryCode: formData.CountryCode,
            PostalCode: formData.PostalCode,
            StateOrRegion: formData.StateOrRegion,
            StreetAddress: formData.StreetAddress || null
          },
          AwsAccountId: formData.AwsAccountId,
          CompanyName: formData.CompanyName,
          Duns: formData.Duns,
          Industry: formData.Industry,
          OtherIndustry: null,
          WebsiteUrl: formData.WebsiteUrl
        },
        Contacts: [
          {
            BusinessTitle: formData.CustomerTitle,
            Email: formData.CustomerEmail,
            FirstName: formData.CustomerFirstName,
            LastName: formData.CustomerLastName,
            Phone: formData.CustomerPhone
          }
        ]
      },
      LifeCycle: {
        ClosedLostReason: null,
        NextSteps: formData.NextSteps,
        NextStepsHistory: null,
        ReviewComments: null,
        ReviewStatus: formData.ReviewStatus,
        ReviewStatusReason: null,
        Stage: formData.Stage,
        TargetCloseDate: formData.TargetCloseDate
      },
      Marketing: {
        AwsFundingUsed: formData.AwsFundingUsed,
        CampaignName: formData.CampaignName,
        Channels: formData.MarketingChannels,
        Source: formData.MarketingSource,
        UseCases: formData.MarketingUseCases
      },
      NationalSecurity: formData.NationalSecurity,
      OpportunityTeam: [
        {
          BusinessTitle: formData.PartnerTitle,
          Email: formData.PartnerEmail,
          FirstName: formData.PartnerFirstName,
          LastName: formData.PartnerLastName,
          Phone: formData.PartnerPhone
        }
      ],
      OpportunityType: formData.OpportunityType,
      PartnerOpportunityIdentifier: null,
      PrimaryNeedsFromAws: formData.PrimaryNeedsFromAws,
      Project: {
        AdditionalComments: null,
        ApnPrograms: null,
        CompetitorName: formData.CompetitorName,
        CustomerBusinessProblem: formData.CustomerBusinessProblem,
        CustomerUseCase: formData.CustomerUseCase,
        DeliveryModels: formData.DeliveryModels,
        ExpectedCustomerSpend: [
          {
            Amount: formData.ExpectedAmount,
            CurrencyCode: formData.ExpectedCurrency,
            Frequency: formData.ExpectedFrequency,
            TargetCompany: formData.ExpectedTargetCompany
          }
        ],
        OtherCompetitorNames: null,
        OtherSolutionDescription: formData.OtherSolutionDescription,
        RelatedOpportunityIdentifier: null,
        SalesActivities: formData.SalesActivities,
        Title: formData.Title
      },
      SoftwareRevenue: {
        DeliveryModel: formData.SoftwareDeliveryModel,
        EffectiveDate: formData.SoftwareEffectiveDate,
        ExpirationDate: formData.SoftwareExpirationDate,
        Value: {
          Amount: formData.SoftwareAmount,
          CurrencyCode: formData.SoftwareCurrencyCode
        }
      }
    };
    
    try {
      console.log('Submitting AWS opportunity:', payload);
      
      // Import the AWS SDK and create a client
      const { PartnerCentralSellingClient, CreateOpportunityCommand } = await import("@aws-sdk/client-partnercentral-selling");
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
      
      // Create the command with the payload
      const command = new CreateOpportunityCommand(payload);
      
      // Send the command to create the opportunity
      const apiResponse = await client.send(command);
      
      console.log('Create AWS opportunity response:', apiResponse);
      
      // Set the response for display (do not save the ID)
      setResponse(apiResponse);
    } catch (error) {
      console.error('Error creating AWS opportunity:', error);
      setError(`Error: ${error.message || 'Failed to create opportunity'}`);
    } finally {
      setLoading(false);
    }
  };

  if (response) {
    return (
      <Container>
        <SpaceBetween size="l">
          <Alert type="warning">
            <Box fontWeight="bold">
              Opportunity is only created on AWS side, not in Partner's Partner Central Account yet. You need to use ListEngagementInvitations to see the engagement invitations from AWS and use StartEngagementByAcceptingInvitationTask to accept the invitation. Write down the opportunity Id {response.Id}. After you accept the engagement invitation, you should get the same opportunity Id in the response.
            </Box>
          </Alert>
          
          <Container>
            <Header variant="h2">CreateOpportunity Response</Header>
            <pre style={{ 
              backgroundColor: '#f9f9f9', 
              padding: '15px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              overflowX: 'auto',
              maxHeight: '400px',
              fontSize: '12px'
            }}>
              {JSON.stringify(response, null, 2)}
            </pre>
          </Container>
          
          <SpaceBetween direction="horizontal" size="xs" alignItems="center">
            <Button onClick={() => navigate('/opportunities')}>Back to Opportunities</Button>
            <Button variant="primary" onClick={() => window.location.reload()}>Create Another</Button>
          </SpaceBetween>
        </SpaceBetween>
      </Container>
    );
  }
  
  return (
    <Container>
      <SpaceBetween size="l">
        <Header variant="h1">[Simulate] Create AWS Originated Opportunity</Header>
        
        {error && <Alert type="error">{error}</Alert>}
        
        {/* System Fields */}
        <Container>
          <Header variant="h2">System Fields</Header>
          <Form>
            <FormField label="Client Token (Auto-generated)">
              <Input value={formData.ClientToken} disabled />
            </FormField>
            
            <FormField label="Catalog">
              <Input value={formData.Catalog} disabled />
            </FormField>
            
            <FormField label="Origin">
              <Input value={formData.Origin} disabled />
            </FormField>
          </Form>
        </Container>
        
        {/* Customer Details */}
        <Container>
          <Header variant="h2">Customer Details</Header>
          
          {/* Account Section */}
          <Container>
            <Header variant="h3">Account</Header>
            <Form>
              <SpaceBetween size="l">
                <FormField label="Company Name">
                  <Input
                    value={formData.CompanyName}
                    onChange={({ detail }) => handleChange('CompanyName', detail.value)}
                  />
                </FormField>
                
                <FormField label="DUNS" errorText={formData.Duns && !/^\d{9}$/.test(formData.Duns) ? 'DUNS must be exactly 9 digits' : ''}>
                  <Input
                    value={formData.Duns}
                    onChange={({ detail }) => handleChange('Duns', detail.value)}
                    invalid={formData.Duns && !/^\d{9}$/.test(formData.Duns)}
                  />
                </FormField>
                
                <FormField label="Industry">
                  <Input
                    value={formData.Industry}
                    onChange={({ detail }) => handleChange('Industry', detail.value)}
                  />
                </FormField>
                
                <FormField label="Website URL">
                  <Input
                    value={formData.WebsiteUrl}
                    onChange={({ detail }) => handleChange('WebsiteUrl', detail.value)}
                  />
                </FormField>
                
                <FormField label="AWS Account ID" errorText={formData.AwsAccountId && !/^(\d{12}|\w{1,12})$/.test(formData.AwsAccountId) ? 'AWS Account ID must be 12 digits or 1-12 word characters' : ''}>
                  <Input
                    value={formData.AwsAccountId}
                    onChange={({ detail }) => handleChange('AwsAccountId', detail.value)}
                    invalid={formData.AwsAccountId && !/^(\d{12}|\w{1,12})$/.test(formData.AwsAccountId)}
                  />
                </FormField>
                
                <FormField label="Country Code">
                  <Select
                    selectedOption={formData.CountryCode ? { value: formData.CountryCode, label: formData.CountryCode } : null}
                    onChange={({ detail }) => handleChange('CountryCode', detail.selectedOption?.value || '')}
                    options={countryOptions}
                    placeholder="Select country code"
                  />
                </FormField>
                
                <FormField label="Postal Code">
                  <Input
                    value={formData.PostalCode}
                    onChange={({ detail }) => handleChange('PostalCode', detail.value)}
                  />
                </FormField>
                
                <FormField label="State or Region">
                  <Select
                    selectedOption={formData.StateOrRegion ? { value: formData.StateOrRegion, label: formData.StateOrRegion } : { value: '', label: 'Select state or region' }}
                    onChange={({ detail }) => handleChange('StateOrRegion', detail.selectedOption?.value || '')}
                    options={stateOptions}
                  />
                </FormField>
                
                <FormField label="Street Address">
                  <Input
                    value={formData.StreetAddress || ''}
                    onChange={({ detail }) => handleChange('StreetAddress', detail.value)}
                  />
                </FormField>
              </SpaceBetween>
            </Form>
          </Container>
          
          {/* Contacts Section */}
          <Container>
            <Header variant="h3">Contacts</Header>
            <Form>
              <SpaceBetween size="l">
                <FormField label="First Name">
                  <Input
                    value={formData.CustomerFirstName}
                    onChange={({ detail }) => handleChange('CustomerFirstName', detail.value)}
                  />
                </FormField>
                
                <FormField label="Last Name">
                  <Input
                    value={formData.CustomerLastName}
                    onChange={({ detail }) => handleChange('CustomerLastName', detail.value)}
                  />
                </FormField>
                
                <FormField label="Business Title">
                  <Input
                    value={formData.CustomerTitle}
                    onChange={({ detail }) => handleChange('CustomerTitle', detail.value)}
                  />
                </FormField>
                
                <FormField label="Email" errorText={formData.CustomerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.CustomerEmail) ? 'Please enter a valid email address' : ''}>
                  <Input
                    value={formData.CustomerEmail}
                    onChange={({ detail }) => handleChange('CustomerEmail', detail.value)}
                    invalid={formData.CustomerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.CustomerEmail)}
                  />
                </FormField>
                
                <FormField label="Phone">
                  <Input
                    value={formData.CustomerPhone}
                    onChange={({ detail }) => handleChange('CustomerPhone', detail.value)}
                  />
                </FormField>
              </SpaceBetween>
            </Form>
          </Container>
        </Container>
        
        {/* Project Details */}
        <Container>
          <SpaceBetween size="l">
            <Header variant="h2">Project Details</Header>
            
            <Form>
              <SpaceBetween size="l">
                <FormField label="Opportunity type">
                  <RadioGroup
                    value={formData.OpportunityType === "Net New Business" ? "new" : 
                           formData.OpportunityType === "Expansion" ? "expansion" : "renewal"}
                    onChange={({ detail }) => {
                      const typeMap = {
                        "new": "Net New Business",
                        "expansion": "Expansion",
                        "renewal": "Flat renewal"
                      };
                      handleChange('OpportunityType', typeMap[detail.value]);
                    }}
                    items={[
                      {
                        value: "new",
                        label: "Net new business",
                        description: "This opportunity is based on a new contract or agreement with a customer that has never done business with your company before."
                      },
                      {
                        value: "expansion",
                        label: "Expansion",
                        description: "This opportunity is based on an existing contract with this end customer which may include new line of business, partner product, or additional customer revenue."
                      },
                      {
                        value: "renewal",
                        label: "Flat renewal",
                        description: "This opportunity is based on an existing contract with this end customer where no expansion will take place."
                      }
                    ]}
                  />
                </FormField>

                <FormField label="Partner project title">
                  <Input 
                    value={formData.Title}
                    onChange={({ detail }) => handleChange('Title', detail.value)}
                  />
                </FormField>

                <FormField label="Customer business problem">
                  <Textarea
                    value={formData.CustomerBusinessProblem}
                    onChange={({ detail }) => handleChange('CustomerBusinessProblem', detail.value)}
                    placeholder="Enter customer business problem"
                    rows={4}
                  />
                </FormField>

                <FormField label="Use case">
                  <Select
                    selectedOption={
                      formData.CustomerUseCase 
                        ? { value: formData.CustomerUseCase, label: formData.CustomerUseCase }
                        : null
                    }
                    onChange={({ detail }) => 
                      handleChange('CustomerUseCase', detail.selectedOption ? detail.selectedOption.value : '')
                    }
                    options={useCaseOptions}
                    placeholder="Choose use case"
                  />
                </FormField>
                
                <FormField label="Competitor Name">
                  <Select
                    selectedOption={
                      formData.CompetitorName 
                        ? { value: formData.CompetitorName, label: formData.CompetitorName }
                        : null
                    }
                    onChange={({ detail }) => 
                      handleChange('CompetitorName', detail.selectedOption ? detail.selectedOption.value : '')
                    }
                    options={competitorOptions}
                    placeholder="Choose competitor"
                  />
                </FormField>

                <FormField label="Delivery model">
                  <Select
                    selectedOptions={
                      formData.DeliveryModels && formData.DeliveryModels.length > 0 
                        ? formData.DeliveryModels.map(model => ({ value: model, label: model }))
                        : []
                    }
                    onChange={({ detail }) => 
                      handleChange('DeliveryModels', detail.selectedOptions.map(option => option.value))
                    }
                    options={deliveryModelOptions}
                    placeholder="Choose delivery models"
                    multiselect
                  />
                </FormField>

                <FormField label="Target close date">
                  <DatePicker
                    value={formData.TargetCloseDate}
                    onChange={({ detail }) => handleChange('TargetCloseDate', detail.value)}
                    placeholder="YYYY/MM/DD"
                  />
                </FormField>

                <FormField label="APN programs" optional={true}>
                  <Select
                    selectedOption={
                      formData.ApnPrograms && formData.ApnPrograms.length > 0 
                        ? { value: formData.ApnPrograms[0], label: formData.ApnPrograms[0] }
                        : null
                    }
                    onChange={({ detail }) => 
                      handleChange('ApnPrograms', detail.selectedOption ? [detail.selectedOption.value] : [])
                    }
                    options={apnProgramOptions}
                    placeholder="Choose an option"
                  />
                </FormField>

                <FormField label="Primary Needs From AWS">
                  <Select
                    selectedOption={
                      formData.PrimaryNeedsFromAws && formData.PrimaryNeedsFromAws.length > 0 
                        ? { value: formData.PrimaryNeedsFromAws[0], label: formData.PrimaryNeedsFromAws[0] }
                        : null
                    }
                    onChange={({ detail }) => 
                      handleChange('PrimaryNeedsFromAws', detail.selectedOption ? [detail.selectedOption.value] : [])
                    }
                    options={[
                      { value: 'Do Not Need Support from AWS Sales Rep', label: 'Do Not Need Support from AWS Sales Rep' },
                      { value: 'Co-Sell - Technical Consultation', label: 'Co-Sell - Technical Consultation' },
                      { value: 'Co-Sell - Pricing Assistance', label: 'Co-Sell - Pricing Assistance' },
                      { value: 'Co-Sell - Support for Public Tender / RFx', label: 'Co-Sell - Support for Public Tender / RFx' },
                      { value: 'Co-Sell - Business Presentation', label: 'Co-Sell - Business Presentation' },
                      { value: 'Co-Sell - Deal Support', label: 'Co-Sell - Deal Support' },
                      { value: 'Co-Sell - Competitive Information', label: 'Co-Sell - Competitive Information' },
                      { value: 'Co-Sell - Architectural Validation', label: 'Co-Sell - Architectural Validation' },
                      { value: 'Co-Sell - Total Cost of Ownership Evaluation', label: 'Co-Sell - Total Cost of Ownership Evaluation' }
                    ]}
                    placeholder="Choose primary needs from AWS"
                  />
                </FormField>

                <FormField label="Other Solution Description">
                  <Input
                    value={formData.OtherSolutionDescription || ''}
                    onChange={({ detail }) => handleChange('OtherSolutionDescription', detail.value)}
                    placeholder="Enter other solution description"
                  />
                </FormField>

                <FormField label="Partner Opportunity Identifier" optional={true}>
                  <Input
                    value={formData.PartnerOpportunityIdentifier || ''}
                    onChange={({ detail }) => handleChange('PartnerOpportunityIdentifier', detail.value || null)}
                    placeholder="Enter partner opportunity identifier"
                  />
                </FormField>
              </SpaceBetween>
            </Form>
            
            {/* Expected Customer Spend Section */}
            <Container>
              <Header variant="h3">Expected Customer Spend</Header>
              <Form>
                <SpaceBetween size="l">
                  <FormField label="Amount">
                    <Input
                      value={formData.ExpectedAmount}
                      onChange={({ detail }) => handleChange('ExpectedAmount', detail.value)}
                      placeholder="Enter amount"
                    />
                  </FormField>
                  
                  <FormField label="Currency Code">
                    <Input
                      value="USD"
                      disabled
                    />
                  </FormField>
                  
                  <FormField label="Frequency">
                    <Input
                      value="Monthly"
                      disabled
                    />
                  </FormField>
                  
                  <FormField label="Target Company">
                    <Input
                      value="AWS"
                      disabled
                    />
                  </FormField>
                </SpaceBetween>
              </Form>
            </Container>
          </SpaceBetween>
        </Container>
        
        {/* Marketing */}
        <Container>
          <Header variant="h2">Marketing</Header>
          <Form>
            <SpaceBetween size="l">
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
                  value={formData.CampaignName}
                  onChange={({ detail }) => handleChange('CampaignName', detail.value)}
                />
              </FormField>
              
              <FormField label="Channels">
                <Select
                  selectedOption={
                    formData.MarketingChannels && formData.MarketingChannels.length > 0 
                      ? { value: formData.MarketingChannels[0], label: formData.MarketingChannels[0] }
                      : null
                  }
                  onChange={({ detail }) => 
                    handleChange('MarketingChannels', detail.selectedOption ? [detail.selectedOption.value] : [])
                  }
                  options={marketingChannelsOptions}
                  placeholder="Choose marketing channels"
                />
              </FormField>
              
              <FormField label="Source">
                <Select
                  selectedOption={formData.MarketingSource ? { value: formData.MarketingSource, label: formData.MarketingSource } : null}
                  onChange={({ detail }) => handleChange('MarketingSource', detail.selectedOption?.value || '')}
                  options={marketingSourceOptions}
                  placeholder="Select marketing source"
                />
              </FormField>
              
              <FormField label="Use Cases">
                <Select
                  selectedOption={
                    formData.MarketingUseCases && formData.MarketingUseCases.length > 0 
                      ? { value: formData.MarketingUseCases[0], label: formData.MarketingUseCases[0] }
                      : null
                  }
                  onChange={({ detail }) => 
                    handleChange('MarketingUseCases', detail.selectedOption ? [detail.selectedOption.value] : [])
                  }
                  options={marketingUseCasesOptions}
                  placeholder="Choose marketing use cases"
                />
              </FormField>
            </SpaceBetween>
          </Form>
        </Container>
        
        {/* National Security */}
        <Container>
          <Header variant="h2">National Security</Header>
          <Form>
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
          </Form>
        </Container>
        
        {/* Opportunity Team */}
        <Container>
          <Header variant="h2">Opportunity Team</Header>
          <Form>
            <SpaceBetween size="l">
              <FormField label="Business Title">
                <Select
                  selectedOption={formData.PartnerTitle ? { value: formData.PartnerTitle, label: formData.PartnerTitle } : null}
                  onChange={({ detail }) => handleChange('PartnerTitle', detail.selectedOption?.value || '')}
                  options={[
                    { value: 'PartnerAccountManager', label: 'PartnerAccountManager' }
                  ]}
                  placeholder="Select business title"
                />
              </FormField>
              
              <FormField label="First Name">
                <Input
                  value={formData.PartnerFirstName}
                  onChange={({ detail }) => handleChange('PartnerFirstName', detail.value)}
                />
              </FormField>
              
              <FormField label="Last Name">
                <Input
                  value={formData.PartnerLastName}
                  onChange={({ detail }) => handleChange('PartnerLastName', detail.value)}
                />
              </FormField>
              
              <FormField label="Email">
                <Input
                  value={formData.PartnerEmail}
                  onChange={({ detail }) => handleChange('PartnerEmail', detail.value)}
                />
              </FormField>
              
              <FormField label="Phone">
                <Input
                  value={formData.PartnerPhone}
                  onChange={({ detail }) => handleChange('PartnerPhone', detail.value)}
                />
              </FormField>
            </SpaceBetween>
          </Form>
        </Container>
        
        {/* Software Revenue */}
        <Container>
          <Header variant="h2">Software Revenue</Header>
          <Form>
            <SpaceBetween size="l">
              <FormField label="Delivery Model">
                <Select
                  selectedOption={formData.SoftwareDeliveryModel ? { value: formData.SoftwareDeliveryModel, label: formData.SoftwareDeliveryModel } : null}
                  onChange={({ detail }) => handleChange('SoftwareDeliveryModel', detail.selectedOption?.value || '')}
                  options={softwareDeliveryModelOptions}
                  placeholder="Select delivery model"
                />
              </FormField>
              
              <FormField label="Effective Date">
                <DatePicker
                  value={formData.SoftwareEffectiveDate}
                  onChange={({ detail }) => handleChange('SoftwareEffectiveDate', detail.value)}
                  placeholder="YYYY-MM-DD"
                />
              </FormField>
              
              <FormField label="Expiration Date">
                <DatePicker
                  value={formData.SoftwareExpirationDate}
                  onChange={({ detail }) => handleChange('SoftwareExpirationDate', detail.value)}
                  placeholder="YYYY-MM-DD"
                />
              </FormField>
              
              <FormField label="Amount">
                <Input
                  value={formData.SoftwareAmount}
                  onChange={({ detail }) => handleChange('SoftwareAmount', detail.value)}
                  placeholder="Enter amount"
                />
              </FormField>
              
              <FormField label="Currency Code">
                <Select
                  selectedOption={formData.SoftwareCurrencyCode ? { value: formData.SoftwareCurrencyCode, label: formData.SoftwareCurrencyCode } : null}
                  onChange={({ detail }) => handleChange('SoftwareCurrencyCode', detail.selectedOption?.value || '')}
                  options={currencyOptions}
                  placeholder="Select currency"
                />
              </FormField>
            </SpaceBetween>
          </Form>
        </Container>
        
        {/* JSON Payload Preview */}
        <Container>
            <Header variant="h2">JSON Payload Preview</Header>
            <Box variant="code">
                <pre style={{ 
                backgroundColor: '#f9f9f9', 
                padding: '15px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                overflowX: 'auto',
                maxHeight: '400px',
                fontSize: '12px'
                }}>
                {JSON.stringify({
                    ClientToken: formData.ClientToken,
                    Catalog: getCredentials().catalog || "Sandbox",
                    Origin: formData.Origin,
                    Customer: {
                    Account: {
                        Address: {
                        City: formData.City || null,
                        CountryCode: formData.CountryCode,
                        PostalCode: formData.PostalCode,
                        StateOrRegion: formData.StateOrRegion,
                        StreetAddress: formData.StreetAddress || null
                        },
                        AwsAccountId: formData.AwsAccountId,
                        CompanyName: formData.CompanyName,
                        Duns: formData.Duns,
                        Industry: formData.Industry,
                        OtherIndustry: null,
                        WebsiteUrl: formData.WebsiteUrl
                    },
                    Contacts: [
                        {
                        BusinessTitle: formData.CustomerTitle,
                        Email: formData.CustomerEmail,
                        FirstName: formData.CustomerFirstName,
                        LastName: formData.CustomerLastName,
                        Phone: formData.CustomerPhone
                        }
                    ]
                    },
                    LifeCycle: {
                    ClosedLostReason: null,
                    NextSteps: formData.NextSteps,
                    NextStepsHistory: null,
                    ReviewComments: null,
                    ReviewStatus: formData.ReviewStatus,
                    ReviewStatusReason: null,
                    Stage: formData.Stage,
                    TargetCloseDate: formData.TargetCloseDate
                    },
                    Marketing: {
                    AwsFundingUsed: formData.AwsFundingUsed,
                    CampaignName: formData.CampaignName,
                    Channels: formData.MarketingChannels,
                    Source: formData.MarketingSource,
                    UseCases: formData.MarketingUseCases
                    },
                    NationalSecurity: formData.NationalSecurity,
                    OpportunityTeam: [
                    {
                        BusinessTitle: formData.PartnerTitle,
                        Email: formData.PartnerEmail,
                        FirstName: formData.PartnerFirstName,
                        LastName: formData.PartnerLastName,
                        Phone: formData.PartnerPhone
                    }
                    ],
                    OpportunityType: formData.OpportunityType,
                    PartnerOpportunityIdentifier: null,
                    PrimaryNeedsFromAws: formData.PrimaryNeedsFromAws,
                    Project: {
                    AdditionalComments: null,
                    ApnPrograms: null,
                    CompetitorName: formData.CompetitorName,
                    CustomerBusinessProblem: formData.CustomerBusinessProblem,
                    CustomerUseCase: formData.CustomerUseCase,
                    DeliveryModels: formData.DeliveryModels,
                    ExpectedCustomerSpend: [
                        {
                        Amount: formData.ExpectedAmount,
                        CurrencyCode: formData.ExpectedCurrency,
                        Frequency: formData.ExpectedFrequency,
                        TargetCompany: formData.ExpectedTargetCompany
                        }
                    ],
                    OtherCompetitorNames: null,
                    OtherSolutionDescription: formData.OtherSolutionDescription,
                    RelatedOpportunityIdentifier: null,
                    SalesActivities: formData.SalesActivities,
                    Title: formData.Title
                    },
                    SoftwareRevenue: {
                      DeliveryModel: formData.SoftwareDeliveryModel,
                      EffectiveDate: formData.SoftwareEffectiveDate,
                      ExpirationDate: formData.SoftwareExpirationDate,
                      Value: {
                        Amount: formData.SoftwareAmount,
                        CurrencyCode: formData.SoftwareCurrencyCode
                      }
                    }
                }, null, 2)}
                </pre>
            </Box>
        </Container>
        
        <SpaceBetween direction="horizontal" size="xs" alignItems="center">
          <Button variant="link" onClick={() => navigate('/opportunities')}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>{loading ? 'Creating...' : 'Create Opportunity'}</Button>
        </SpaceBetween>
      </SpaceBetween>
    </Container>
  );
}

export default CreateAwsOpportunity;