import { useState, useEffect } from 'react';
import { adminApi } from './api';
import { LoginPage } from './LoginPage';
import { Dashboard } from './Dashboard';

type AuthState = 'loading' | 'unauthenticated' | 'authenticated';

export function AdminApp() {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    adminApi.me()
      .then(data => { setAdminEmail(data.email); setAuthState('authenticated'); })
      .catch(() => setAuthState('unauthenticated'));
  }, []);

  // The whole app shares one index.html — its title/favicon say "ALBIE",
  // correct for the booking-engine product itself, but the admin panel
  // manages every product (Hotel, Web Design, Marketing, Social), not just
  // Albie. Same swap-on-mount/restore-on-unmount pattern as the other flows.
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    const previousHref = link?.href;
    const previousTitle = document.title;
    if (link) link.href = '/tag-favicon.png';
    document.title = 'TAG Onboarding';
    return () => {
      if (link && previousHref) link.href = previousHref;
      document.title = previousTitle;
    };
  }, []);

  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <img src="/tag-logo-black.png" alt="TAG" className="h-8 w-auto opacity-60" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#2F6B6D] animate-bounce" />
        </div>
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return (
      <LoginPage onLogin={email => { setAdminEmail(email); setAuthState('authenticated'); }} />
    );
  }

  return (
    <Dashboard
      adminEmail={adminEmail}
      onLogout={() => { setAdminEmail(''); setAuthState('unauthenticated'); }}
    />
  );
}
