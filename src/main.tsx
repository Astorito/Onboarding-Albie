import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AdminApp } from './admin/AdminApp.tsx';
import MarketingApp from './marketing/MarketingApp.tsx';

const isAdmin = window.location.pathname.startsWith('/admin');
const isMarketing = window.location.pathname.startsWith('/marketing');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdmin ? <AdminApp /> : isMarketing ? <MarketingApp /> : <App />}
  </StrictMode>,
);
