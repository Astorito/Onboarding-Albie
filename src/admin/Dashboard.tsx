import { useState, useEffect, useCallback } from 'react';
import { adminApi, type Onboarding } from './api';
import { NewOnboardingModal } from './NewOnboardingModal';

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

export function Dashboard({ adminEmail, onLogout }: Props) {
  const [onboardings, setOnboardings] = useState<Onboarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState('');

  const fetchOnboardings = useCallback(async () => {
    try {
      const data = await adminApi.getOnboardings();
      setOnboardings(data.filter(o => o['Session ID']));
    } catch {
      // silently fail — table stays empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOnboardings(); }, [fetchOnboardings]);

  const copyLink = (sessionId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/?token=${sessionId}`);
    setCopiedId(sessionId);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const handleLogout = async () => {
    await adminApi.logout().catch(() => {});
    onLogout();
  };

  // Group by Account ID, unassigned onboardings go under 'Sin cuenta'
  const groups: Record<string, { label: string; items: Onboarding[] }> = {};
  for (const o of onboardings) {
    const key = o['Account ID'] || '__none__';
    const label = key === '__none__' ? 'Sin cuenta' : (o['Account ID'] ?? 'Sin cuenta');
    if (!groups[key]) groups[key] = { label, items: [] };
    groups[key].items.push(o);
  }

  // Sort: accounts with most recent first
  const sortedGroups = Object.entries(groups).sort(([a], [b]) => {
    if (a === '__none__') return 1;
    if (b === '__none__') return -1;
    const aDate = groups[a].items[0]?.['Admin Created At'] ?? '';
    const bDate = groups[b].items[0]?.['Admin Created At'] ?? '';
    return bDate.localeCompare(aDate);
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
          <div className="flex flex-col gap-8">
            {sortedGroups.map(([key, group]) => (
              <section key={key}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 rounded-full bg-[#2F6B6D]" />
                  <h2 className="font-bold text-[#0D3A39] text-sm uppercase tracking-wide">{group.label}</h2>
                  <span className="text-xs text-gray-400">{group.items.length}</span>
                </div>

                <div className="grid gap-3">
                  {group.items.map(o => {
                    const sessionId = o['Session ID'];
                    return (
                      <div key={sessionId} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-bold text-[#0D3A39] truncate">
                              {o['Onboarding Name'] || o['Property Name'] || sessionId}
                            </p>
                            <StatusBadge status={o['Status']} />
                          </div>
                          <p className="text-xs text-gray-400">
                            Creado {formatDate(o['Admin Created At'] || o['Timestamp'] || '')}
                            {o['Created By'] && ` · ${o['Created By']}`}
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
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <NewOnboardingModal
          onClose={() => setShowModal(false)}
          onCreated={() => { fetchOnboardings(); }}
        />
      )}
    </div>
  );
}
