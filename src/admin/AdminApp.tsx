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

  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <img src="/albie-logo-dark.svg" alt="Albie" className="h-8 w-auto opacity-60" />
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
