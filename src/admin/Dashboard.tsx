import { useState, useEffect, useCallback } from 'react';
import { adminApi, type Onboarding, type Account } from './api';
import { NewOnboardingModal } from './NewOnboardingModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface Props {
  adminEmail: string;
  onLogout: () => void;
}

type StatusBadgeProps = { status: string };
function StatusBadge({ status }: StatusBadgeProps) {
  const isCompleted = status === 'completed';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
      isCompleted
        ? 'bg-emerald-50 text-emerald-700'
        : 'bg-amber-50 text-amber-700'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-amber-400'}`} />
      {isCompleted ? 'Completado' : 'Pendiente'}
    </span>
  );
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export function Dashboard({ adminEmail, onLogout }: Props) {
  const [onboardings, setOnboardings] = useState<Onboarding[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Onboarding | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const fetchAll = useCallback(async () => {
    try {
      const [data, accs] = await Promise.all([
        adminApi.getOnboardings(),
        adminApi.getAccounts(),
      ]);
      setOnboardings(data.filter(o => o['Session ID']));
      setAccounts(accs);
    } catch {
      // silently fail — table stays empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const accountNameById = Object.fromEntries(
    accounts.map(a => [a['Account ID'], a['Account Name']])
  );

  const toggleGroup = (key: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const copyLink = (sessionId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/?token=${sessionId}`);
    setCopiedId(sessionId);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const handleLogout = async () => {
    await adminApi.logout().catch(() => {});
    onLogout();
  };

  // Group by Account ID, resolve name from accounts list
  const groups: Record<string, { label: string; items: Onboarding[] }> = {};
  for (const o of onboardings) {
    const key = o['Account ID'] || '__none__';
    const label = key === '__none__'
      ? 'Independiente'
      : (accountNameById[key] ?? key);
    if (!groups[key]) groups[key] = { label, items: [] };
    groups[key].items.push(o);
  }

  // Sort: accounts alphabetically, independents last
  const sortedGroups = Object.entries(groups).sort(([a, ga], [b, gb]) => {
    if (a === '__none__') return 1;
    if (b === '__none__') return -1;
    return ga.label.localeCompare(gb.label, 'es');
  });

  return (
    <div className="min-h-screen bg-gray-50 font-[DM_Sans,sans-serif]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <img src="/albie-logo-dark.svg" alt="Albie" className="h-8 w-auto" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 hidden sm:block">{adminEmail}</span>
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#2F6B6D] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              + Nuevo onboarding
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-gray-600 transition cursor-pointer"
              title="Cerrar sesión"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0D3A39]">Onboardings</h1>
          <p className="text-sm text-gray-500 mt-1">{onboardings.length} onboarding{onboardings.length !== 1 ? 's' : ''} en total</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 text-sm">Cargando…</div>
        ) : onboardings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F2EA5F] flex items-center justify-center text-2xl mb-4">📋</div>
            <p className="font-bold text-[#0D3A39] text-lg mb-1">No hay onboardings todavía</p>
            <p className="text-gray-500 text-sm mb-6">Creá el primero para generar un link y enviárselo al cliente</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#2F6B6D] text-white text-sm font-bold px-6 py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              + Nuevo onboarding
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {sortedGroups.map(([key, group]) => {
              const isOpen = !collapsed.has(key);
              return (
                <section key={key} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  {/* Group header — clickable to collapse */}
                  <button
                    onClick={() => toggleGroup(key)}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition cursor-pointer"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#2F6B6D] shrink-0" />
                    <span className="font-bold text-[#0D3A39] text-sm flex-1">{group.label}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {group.items.length}
                    </span>
                    <ChevronIcon open={isOpen} />
                  </button>

                  {/* Items */}
                  {isOpen && (
                    <div className="border-t border-gray-100 divide-y divide-gray-50">
                      {group.items.map(o => {
                        const sessionId = o['Session ID'];
                        return (
                          <div key={sessionId} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <p className="font-semibold text-[#0D3A39] truncate">
                                  {o['Onboarding Name'] || o['Property Name'] || sessionId}
                                </p>
                                <StatusBadge status={o['Status']} />
                              </div>
                              <p className="text-xs text-gray-400">
                                Creado {formatDate(o['Admin Created At'] || o['Timestamp'] || '')}
                                {o['Created By'] && ` · ${o['Created By']}`}
                                {o['POC Email'] && ` · POC: ${o['POC Email']}`}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {o['PDF Link'] && (
                                <a
                                  href={o['PDF Link']}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-semibold text-[#2F6B6D] border border-[#2F6B6D]/30 px-3 py-2 rounded-lg hover:bg-[#2F6B6D]/5 transition"
                                >
                                  Ver PDF
                                </a>
                              )}
                              <button
                                onClick={() => copyLink(sessionId)}
                                className="text-xs font-semibold bg-[#F2EA5F] text-[#0D3A39] px-3 py-2 rounded-lg hover:opacity-80 transition cursor-pointer"
                              >
                                {copiedId === sessionId ? '¡Copiado!' : 'Copiar link'}
                              </button>
                              <button
                                onClick={() => setDeleteTarget(o)}
                                className="text-xs font-semibold text-red-400 border border-red-100 px-3 py-2 rounded-lg hover:bg-red-50 transition cursor-pointer"
                                title="Eliminar onboarding"
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>

      {showModal && (
        <NewOnboardingModal
          onClose={() => setShowModal(false)}
          onCreated={() => { fetchAll(); }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          sessionId={deleteTarget['Session ID']}
          onboardingName={deleteTarget['Onboarding Name'] || deleteTarget['Property Name'] || deleteTarget['Session ID']}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => { fetchAll(); setDeleteTarget(null); }}
        />
      )}
    </div>
  );
}
