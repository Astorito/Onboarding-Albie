import { useState, type FormEvent } from 'react';
import { adminApi } from './api';

interface Props {
  onLogin: (email: string) => void;
}

export function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await adminApi.login(email, password);
      onLogin(data.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <img src="/albie-logo-dark.svg" alt="Albie" className="h-10 w-auto" />
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          <h1 className="text-xl font-bold text-[#0D3A39] mb-1">Panel admin</h1>
          <p className="text-sm text-gray-500 mb-6">Ingresá con tus credenciales</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0D3A39] mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0D3A39] outline-none focus:border-[#2F6B6D] focus:ring-2 focus:ring-[#2F6B6D]/10 transition"
                placeholder="tu@empresa.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0D3A39] mb-1.5 uppercase tracking-wide">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0D3A39] outline-none focus:border-[#2F6B6D] focus:ring-2 focus:ring-[#2F6B6D]/10 transition"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-red-600 text-xs font-medium bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2F6B6D] text-white font-bold rounded-xl py-3 text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 cursor-pointer mt-1"
            >
              {loading ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
