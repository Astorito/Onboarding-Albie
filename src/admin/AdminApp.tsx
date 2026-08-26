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

  // The whole app shares one index.html — its title says "ALBIE Onboarding",
  // correct for the booking-engine product itself, but the admin panel
  // manages every product (Hotel, Web Design, Marketing, Social), not just
  // Albie. Same swap-on-mount/restore-on-unmount pattern as the other flows.
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'TAG Onboarding';
    return () => { document.title = previousTitle; };
  }, []);

  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <img src="/albie-logo-dark.svg" alt="ALBIE" className="h-8 w-auto opacity-60" />
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
