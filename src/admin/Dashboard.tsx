import { useState, useEffect, useCallback } from 'react';
import { adminApi, type Onboarding, type Account } from './api';
import { NewOnboardingModal } from './NewOnboardingModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { slugFromRow } from '../utils/slug';
import { Icon } from '../components/ui/primitives';

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
      {isCompleted ? 'Completed' : 'Pending'}
    </span>
  );
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function isThisMonth(iso: string): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function MetricCard({
  label, value, active, onClick,
}: {
  label: string;
  value: number;
  // When provided, the card doubles as a filter toggle — see `productFilter`
  // in Dashboard. Cards without onClick (e.g. "this month") stay plain stats.
  active?: boolean;
  onClick?: () => void;
}) {
  const clickable = !!onClick;
  const Tag = clickable ? 'button' : 'div';
  return (
    <Tag
      type={clickable ? 'button' : undefined}
      onClick={onClick}
      className={`text-left rounded-2xl border px-5 py-4 flex flex-col gap-1 transition-all ${
        clickable ? 'cursor-pointer' : ''
      } ${
        active
          ? 'bg-[#2F6B6D] border-[#2F6B6D]'
          : clickable
            ? 'bg-white border-gray-100 hover:border-[#2F6B6D]/40'
            : 'bg-white border-gray-100'
      }`}
    >
      <span className={`text-2xl font-bold ${active ? 'text-white' : 'text-[#0D3A39]'}`}>{value}</span>
      <span className={`text-xs ${active ? 'text-white/80' : 'text-gray-500'}`}>{label}</span>
    </Tag>
  );
}

type ProductFilter = 'all' | 'hotel' | 'webdesign' | 'marketing' | 'social' | 'engagement';

// Engagement rows bundle 2+ products behind one hub link — filtering by a
// specific product should surface a bundle that INCLUDES it, not just
// standalone rows of that exact type. Legacy Sheets rows have no 'Type'
// field and are all hotel/Albie (same convention the metrics below use).
function matchesProductFilter(o: Onboarding, filter: ProductFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'engagement') return o['Type'] === 'engagement';
  if (o['Type'] === 'engagement') {
    if (filter === 'hotel') return !!o['Albie Enabled'];
    if (filter === 'webdesign') return !!o['Web Design Enabled'];
    if (filter === 'marketing') return !!o['Marketing Enabled'];
    if (filter === 'social') return !!o['Social Enabled'];
    return false;
  }
  if (filter === 'hotel') return !o['Type'] || o['Type'] === 'hotel';
  return o['Type'] === filter;
}

const PRODUCT_FILTER_LABELS: Record<ProductFilter, string> = {
  all: 'All areas',
  hotel: 'ALBIE',
  webdesign: 'Web Design',
  marketing: 'Paid Media',
  social: 'Social Media',
  engagement: 'Engagements',
};

// Matches against everything visible in a row: the onboarding's own name,
// the legacy hotel-flow's Property Name, and the account it belongs to (so
// searching a client name finds all of that client's onboardings even when
// the onboarding itself was named something else).
function matchesSearch(o: Onboarding, query: string, accountName: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return [o['Onboarding Name'], o['Property Name'], accountName]
    .some(v => (v ?? '').toLowerCase().includes(q));
}

function engagementProductsLabel(o: Onboarding): string {
  const products = [
    o['Albie Enabled'] && 'ALBIE',
    o['Marketing Enabled'] && 'Paid Media',
    o['Web Design Enabled'] && 'Web Design',
    o['Social Enabled'] && 'Social Media',
  ].filter(Boolean);
  return products.join(' + ') || 'No products';
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
  // expanded starts empty → all groups closed by default
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [productFilter, setProductFilter] = useState<ProductFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const [dataResult, accsResult] = await Promise.allSettled([
        adminApi.getOnboardings(),
        adminApi.getAccounts(),
      ]);
      if (dataResult.status === 'fulfilled') {
        setOnboardings(dataResult.value.filter(o => o['Session ID']));
      }
      if (accsResult.status === 'fulfilled') {
        setAccounts(accsResult.value);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const accountNameById = Object.fromEntries(
    accounts.map(a => [a['Account ID'], a['Account Name']])
  );

  const toggleGroup = (key: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const copyLink = (o: Onboarding) => {
    const sessionId = o['Session ID'];
    const slug = slugFromRow(o['Onboarding Name'] ?? '', sessionId);
    // An engagement bundles 2+ products behind one hub screen — copy that
    // link, never a single product's direct link.
    if (o['Type'] === 'engagement') {
      const link = `${window.location.origin}/e/${slug || sessionId}`;
      navigator.clipboard.writeText(link);
      setCopiedId(sessionId);
      setTimeout(() => setCopiedId(''), 2000);
      return;
    }
    // Prefer the readable, resolvable /o/<slug> link; fall back to the legacy
    // ?token= link if we can't derive a slug (e.g. missing name/session id).
    const basePath =
      o['Type'] === 'webdesign' ? '/website/o/'
      : o['Type'] === 'marketing' ? '/marketing/o/'
      : o['Type'] === 'social' ? '/social/o/'
      : '/o/';
    const fallbackPath =
      o['Type'] === 'webdesign' ? '/website?token='
      : o['Type'] === 'marketing' ? '/marketing?token='
      : o['Type'] === 'social' ? '/social?token='
      : '/?token=';
    const link = slug
      ? `${window.location.origin}${basePath}${slug}`
      : `${window.location.origin}${fallbackPath}${sessionId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(sessionId);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const handleLogout = async () => {
    await adminApi.logout().catch(() => {});
    onLogout();
  };

  const filteredOnboardings = onboardings.filter(o =>
    matchesProductFilter(o, productFilter)
    && matchesSearch(o, searchQuery, accountNameById[o['Account ID']] ?? ''),
  );

  // Group by Account ID, resolve name from accounts list
  const groups: Record<string, { label: string; items: Onboarding[] }> = {};
  for (const o of filteredOnboardings) {
    const key = o['Account ID'] || '__none__';
    const label = key === '__none__'
      ? 'Independent'
      : (accountNameById[key] ?? key);
    if (!groups[key]) groups[key] = { label, items: [] };
    groups[key].items.push(o);
  }

  // Sort: accounts alphabetically, independents last
  const sortedGroups = Object.entries(groups).sort(([a, ga], [b, gb]) => {
    if (a === '__none__') return 1;
    if (b === '__none__') return -1;
    return ga.label.localeCompare(gb.label, 'en');
  });

  // Metrics — each product count includes engagements that bundle it (same
  // predicate the filter itself uses), so a tile's number always matches
  // what clicking it will show.
  const metrics = {
    thisMonth: onboardings.filter(o => isThisMonth(o['Admin Created At'] || o['Timestamp'] || '')).length,
    marketing: onboardings.filter(o => matchesProductFilter(o, 'marketing')).length,
    albie: onboardings.filter(o => matchesProductFilter(o, 'hotel')).length,
    webDesign: onboardings.filter(o => matchesProductFilter(o, 'webdesign')).length,
    social: onboardings.filter(o => matchesProductFilter(o, 'social')).length,
    engagement: onboardings.filter(o => o['Type'] === 'engagement').length,
    total: onboardings.length,
  };

  return (
    <div className="min-h-screen bg-gray-50 font-[DM_Sans,sans-serif]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <img src="/tag-logo-black.png" alt="TAG" className="h-8 w-auto" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 hidden sm:block">{adminEmail}</span>
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#2F6B6D] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              + New onboarding
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-gray-600 transition cursor-pointer"
              title="Log out"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {!loading && onboardings.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
            <MetricCard label="Onboardings this month" value={metrics.thisMonth} />
            <MetricCard label="All onboardings" value={metrics.total} active={productFilter === 'all'} onClick={() => setProductFilter('all')} />
            <MetricCard label="ALBIE" value={metrics.albie} active={productFilter === 'hotel'} onClick={() => setProductFilter('hotel')} />
            <MetricCard label="Web Design" value={metrics.webDesign} active={productFilter === 'webdesign'} onClick={() => setProductFilter('webdesign')} />
            <MetricCard label="Paid Media" value={metrics.marketing} active={productFilter === 'marketing'} onClick={() => setProductFilter('marketing')} />
            <MetricCard label="Social Media" value={metrics.social} active={productFilter === 'social'} onClick={() => setProductFilter('social')} />
            <MetricCard label="Engagements" value={metrics.engagement} active={productFilter === 'engagement'} onClick={() => setProductFilter('engagement')} />
          </div>
        )}

        {!loading && onboardings.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M18 11a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by onboarding or account name…"
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#0D3A39] outline-none focus:border-[#2F6B6D] focus:ring-2 focus:ring-[#2F6B6D]/10 transition bg-white"
              />
            </div>
            <div className="relative sm:w-52">
              <select
                value={productFilter}
                onChange={e => setProductFilter(e.target.value as ProductFilter)}
                className="w-full appearance-none border border-gray-200 rounded-xl pl-4 pr-9 py-2.5 text-sm text-[#0D3A39] outline-none focus:border-[#2F6B6D] focus:ring-2 focus:ring-[#2F6B6D]/10 transition bg-white"
              >
                {(Object.keys(PRODUCT_FILTER_LABELS) as ProductFilter[]).map(key => (
                  <option key={key} value={key}>{PRODUCT_FILTER_LABELS[key]}</option>
                ))}
              </select>
              <Icon name="expand_more" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-lg text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0D3A39]">Onboardings</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filteredOnboardings.length} onboarding{filteredOnboardings.length !== 1 ? 's' : ''}
            {productFilter === 'all' && !searchQuery.trim() ? ' total' : ` (filtered, out of ${onboardings.length})`}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 text-sm">Loading…</div>
        ) : onboardings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F2EA5F] flex items-center justify-center text-2xl mb-4">📋</div>
            <p className="font-bold text-[#0D3A39] text-lg mb-1">No onboardings yet</p>
            <p className="text-gray-500 text-sm mb-6">Create the first one to generate a link and send it to the client</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#2F6B6D] text-white text-sm font-bold px-6 py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              + New onboarding
            </button>
          </div>
        ) : filteredOnboardings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl mb-4">🔍</div>
            <p className="font-bold text-[#0D3A39] text-lg mb-1">No onboardings match this filter</p>
            <p className="text-gray-500 text-sm mb-6">Try a different search or area, or clear the filters</p>
            <button
              onClick={() => { setProductFilter('all'); setSearchQuery(''); }}
              className="bg-[#2F6B6D] text-white text-sm font-bold px-6 py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {sortedGroups.map(([key, group]) => {
              const isOpen = expanded.has(key);
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
                                {o['Type'] === 'engagement' ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#2F6B6D]/10 text-[#2F6B6D]">
                                    {engagementProductsLabel(o)}
                                  </span>
                                ) : (
                                  <StatusBadge status={o['Status'] ?? ''} />
                                )}
                              </div>
                              <p className="text-xs text-gray-400">
                                Created {formatDate(o['Admin Created At'] || o['Timestamp'] || '')}
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
                                  View PDF
                                </a>
                              )}
                              <button
                                onClick={() => copyLink(o)}
                                className="text-xs font-semibold bg-[#F2EA5F] text-[#0D3A39] px-3 py-2 rounded-lg hover:opacity-80 transition cursor-pointer"
                              >
                                {copiedId === sessionId ? 'Copied!' : 'Copy link'}
                              </button>
                              {o['Type'] !== 'engagement' && (
                                <button
                                  onClick={() => setDeleteTarget(o)}
                                  className="text-xs font-semibold text-red-400 border border-red-100 px-3 py-2 rounded-lg hover:bg-red-50 transition cursor-pointer"
                                  title="Delete onboarding"
                                >
                                  Delete
                                </button>
                              )}
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
