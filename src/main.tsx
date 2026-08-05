import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AdminApp } from './admin/AdminApp.tsx';
import EngagementHubApp from './engagement/EngagementHubApp.tsx';

const isAdmin = window.location.pathname.startsWith('/admin');
const isEngagement = window.location.pathname.startsWith('/e/');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdmin ? <AdminApp /> : isEngagement ? <EngagementHubApp /> : <App />}
  </StrictMode>,
);
