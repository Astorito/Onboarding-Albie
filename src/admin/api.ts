// Typed fetch helpers for all /api/admin/* endpoints.

export interface Account {
  'Account ID': string;
  'Account Name': string;
  'Created At': string;
}

export interface Onboarding {
  'Session ID': string;
  'Account ID': string;
  'Onboarding Name': string;
  'Status': string;
  'PDF Link': string;
  'Created By': string;
  'Admin Created At': string;
  'Property Name'?: string;
  'Timestamp'?: string;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'include', ...options });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data as T;
}

export const adminApi = {
  me: () => apiFetch<{ email: string }>('/api/admin/me'),

  login: (email: string, password: string) =>
    apiFetch<{ ok: boolean; email: string }>('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiFetch<{ ok: boolean }>('/api/admin/logout', { method: 'POST' }),

  getAccounts: () => apiFetch<Account[]>('/api/admin/accounts'),

  createAccount: (accountName: string) =>
    apiFetch<{ accountId: string; accountName: string }>('/api/admin/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountName }),
    }),

  getOnboardings: () => apiFetch<Onboarding[]>('/api/admin/onboardings'),

  createOnboarding: (accountId: string, onboardingName: string) =>
    apiFetch<{ sessionId: string }>('/api/admin/onboardings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, onboardingName }),
    }),

  deleteOnboarding: (sessionId: string) =>
    apiFetch<{ success: boolean }>(`/api/admin/onboardings?sessionId=${encodeURIComponent(sessionId)}`, {
      method: 'DELETE',
    }),
};
