import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AdminApp } from './admin/AdminApp.tsx';
import EngagementHubApp from './engagement/EngagementHubApp.tsx';
import MarketingApp from './marketing/MarketingApp.tsx';
import WebsiteApp from './website/WebsiteApp.tsx';
// Not connected yet — see the note at the top of SocialApp.tsx. Routed here so
// it's reviewable on this branch; not part of the Engagement hub or any
// existing product's routing.
import SocialApp from './social/SocialApp.tsx';

const isAdmin = window.location.pathname.startsWith('/admin');
const isEngagement = window.location.pathname.startsWith('/e/');
const isMarketing = window.location.pathname.startsWith('/marketing');
const isWebsite = window.location.pathname.startsWith('/website');
const isSocial = window.location.pathname.startsWith('/social');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdmin ? <AdminApp /> : isEngagement ? <EngagementHubApp /> : isMarketing ? <MarketingApp /> : isWebsite ? <WebsiteApp /> : isSocial ? <SocialApp /> : <App />}
  </StrictMode>,
);
