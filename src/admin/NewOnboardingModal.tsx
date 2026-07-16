import { useState, useEffect, type FormEvent } from 'react';
import { adminApi, type Account } from './api';
import { slugFromRow } from '../utils/slug';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function NewOnboardingModal({ onClose, onCreated }: Props) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [isNewAccount, setIsNewAccount] = useState(false);
  const [onboardingName, setOnboardingName] = useState('');
  const [pocEmail, setPocEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    adminApi.getAccounts().then(setAccounts).catch(() => {});
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let accountId = selectedAccountId;

      if (isNewAccount) {
        if (!newAccountName.trim()) throw new Error('Ingresá el nombre de la cuenta');
        const acc = await adminApi.createAccount(newAccountName.trim());
        accountId = acc.accountId;
      }

      if (!accountId) throw new Error('Seleccioná o creá una cuenta');
      if (!onboardingName.trim()) throw new Error('Ingresá el nombre del onboarding');

      const trimmedName = onboardingName.trim();
      const { sessionId } = await adminApi.createOnboarding(
        accountId,
        trimmedName,
        pocEmail.trim() || undefined,
      );
      // Readable, resolvable link. The slug is derived (never stored); it shows
      // the property and resolves back to this Session ID server-side.
      const slug = slugFromRow(trimmedName, sessionId);
      const link = slug
        ? `${window.location.origin}/o/${slug}`
        : `${window.location.origin}/?token=${sessionId}`;
      setGeneratedLink(link);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear onboarding');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#0D3A39]">Nuevo onboarding</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition text-xl leading-none cursor-pointer">✕</button>
        </div>

        {!generatedLink ? (
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            {/* Account selector */}
            <div>
              <label className="block text-xs font-semibold text-[#0D3A39] mb-1.5 uppercase tracking-wide">Cuenta / Cliente</label>

              {!isNewAccount ? (
                <div className="flex gap-2">
                  <select
                    value={selectedAccountId}
                    onChange={e => setSelectedAccountId(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0D3A39] outline-none focus:border-[#2F6B6D] focus:ring-2 focus:ring-[#2F6B6D]/10 transition bg-white"
                  >
                    <option value="">Seleccionar cuenta…</option>
                    {accounts.map(a => (
                      <option key={a['Account ID']} value={a['Account ID']}>
                        {a['Account Name']}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => { setIsNewAccount(true); setSelectedAccountId(''); }}
                    className="px-4 py-3 border border-[#2F6B6D] text-[#2F6B6D] text-sm font-semibold rounded-xl hover:bg-[#2F6B6D]/5 transition cursor-pointer whitespace-nowrap"
                  >
                    + Nueva
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nombre de la cuenta"
                    value={newAccountName}
                    onChange={e => setNewAccountName(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0D3A39] outline-none focus:border-[#2F6B6D] focus:ring-2 focus:ring-[#2F6B6D]/10 transition"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => { setIsNewAccount(false); setNewAccountName(''); }}
                    className="px-4 py-3 border border-gray-200 text-gray-500 text-sm font-semibold rounded-xl hover:bg-gray-50 transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            {/* Onboarding name */}
            <div>
              <label className="block text-xs font-semibold text-[#0D3A39] mb-1.5 uppercase tracking-wide">Nombre del lugar</label>
              <input
                type="text"
                placeholder="Ej: Hotel Patagonia Norte"
                value={onboardingName}
                onChange={e => setOnboardingName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0D3A39] outline-none focus:border-[#2F6B6D] focus:ring-2 focus:ring-[#2F6B6D]/10 transition"
              />
            </div>

            {/* POC email */}
            <div>
              <label className="block text-xs font-semibold text-[#0D3A39] mb-1.5 uppercase tracking-wide">
                Email del POC
                <span className="ml-1.5 font-normal text-gray-400 normal-case tracking-normal">— recibe el PDF al completar</span>
              </label>
              <input
                type="email"
                placeholder="ana@theanythinggroup.com"
                value={pocEmail}
                onChange={e => setPocEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0D3A39] outline-none focus:border-[#2F6B6D] focus:ring-2 focus:ring-[#2F6B6D]/10 transition"
              />
            </div>

            {error && (
              <p className="text-red-600 text-xs font-medium bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold rounded-xl py-3 text-sm hover:bg-gray-50 transition cursor-pointer">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="flex-1 bg-[#2F6B6D] text-white font-bold rounded-xl py-3 text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 cursor-pointer">
                {loading ? 'Creando…' : 'Crear onboarding'}
              </button>
            </div>
          </form>
        ) : (
          /* Success — show link */
          <div className="p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F2EA5F] flex items-center justify-center shrink-0 text-[#0D3A39] text-lg font-bold">✓</div>
              <div>
                <p className="font-bold text-[#0D3A39]">Onboarding creado</p>
                <p className="text-sm text-gray-500">Compartí el link con el cliente</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Link del onboarding</p>
              <p className="text-sm text-[#2F6B6D] font-mono break-all">{generatedLink}</p>
            </div>

            <button
              onClick={copyLink}
              className="w-full bg-[#2F6B6D] text-white font-bold rounded-xl py-3 text-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              {copied ? '¡Copiado!' : 'Copiar link'}
            </button>

            <button onClick={onClose} className="w-full border border-gray-200 text-gray-600 font-semibold rounded-xl py-3 text-sm hover:bg-gray-50 transition cursor-pointer">
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
