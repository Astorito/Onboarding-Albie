import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AdminApp } from './admin/AdminApp.tsx';
import EngagementHubApp from './engagement/EngagementHubApp.tsx';
import MarketingApp from './marketing/MarketingApp.tsx';
import WebsiteApp from './website/WebsiteApp.tsx';

const isAdmin = window.location.pathname.startsWith('/admin');
const isEngagement = window.location.pathname.startsWith('/e/');
const isMarketing = window.location.pathname.startsWith('/marketing');
const isWebsite = window.location.pathname.startsWith('/website');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdmin ? <AdminApp /> : isEngagement ? <EngagementHubApp /> : isMarketing ? <MarketingApp /> : isWebsite ? <WebsiteApp /> : <App />}
  </StrictMode>,
);
