import { useState } from 'react';
import type { Onboarding } from './api';
import { computeCompletionPercent } from './completionFields';

// Same label set the sidebar/legacy dropdown filter uses — kept local since
// Dashboard already exports nothing (avoids introducing a shared module for
// two string maps).
const AREA_LABELS: Record<string, string> = {
  hotel: 'ALBIE',
  webdesign: 'Web Design',
  marketing: 'Paid Media',
  social: 'Social Media',
};

function formatDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function StatusBadge({ status }: { status: string }) {
  const isCompleted = status === 'completed';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
      isCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-amber-400'}`} />
      {isCompleted ? 'Completed' : 'Pending'}
    </span>
  );
}

export function OnboardingCard({
  onboarding: o,
  accountName,
  engagementLabel,
  copied,
  onOpen,
  onCopyLink,
  onDelete,
}: {
  onboarding: Onboarding;
  accountName: string;
  // Present only for Type === 'engagement' — the "ALBIE + Paid Media" style badge.
  engagementLabel?: string;
  copied: boolean;
  onOpen: () => void;
  onCopyLink: () => void;
  onDelete?: () => void;
  key?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isEngagement = o['Type'] === 'engagement';
  const areaLabel = isEngagement ? 'Engagement' : (AREA_LABELS[o['Type'] ?? 'hotel'] ?? 'ALBIE');
  const completion = computeCompletionPercent(o);
  const title = o['Onboarding Name'] || o['Property Name'] || o['Session ID'];

  return (
    <div className="relative bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <span className="inline-block bg-[#2F6B6D]/10 text-[#2F6B6D] text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg">
          {areaLabel}
        </span>
        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition cursor-pointer"
            title="Actions"
          >
            ⋮
          </button>
          {menuOpen && (
            <>
              {/* Click-outside catcher */}
              <button
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-10 cursor-default"
                aria-hidden
                tabIndex={-1}
              />
              <div className="absolute right-0 top-8 z-20 w-40 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 flex flex-col">
                <button
                  onClick={() => { setMenuOpen(false); onOpen(); }}
                  className="text-left px-3.5 py-2 text-sm text-[#0D3A39] hover:bg-gray-50 transition cursor-pointer"
                >
                  Open
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onCopyLink(); }}
                  className="text-left px-3.5 py-2 text-sm text-[#0D3A39] hover:bg-gray-50 transition cursor-pointer"
                >
                  {copied ? 'Copied!' : 'Copy link'}
                </button>
                {o['PDF Link'] && (
                  <a
                    href={o['PDF Link']}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="text-left px-3.5 py-2 text-sm text-[#0D3A39] hover:bg-gray-50 transition"
                  >
                    View PDF
                  </a>
                )}
                {onDelete && (
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(); }}
                    className="text-left px-3.5 py-2 text-sm text-red-500 hover:bg-red-50 transition cursor-pointer"
                  >
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="min-w-0">
        <p className="font-bold text-[#0D3A39] leading-snug truncate">{title}</p>
        {accountName && <p className="text-xs text-gray-400 truncate">{accountName}</p>}
      </div>

      {/* No completion % for engagements — their bundled products' own field
          data doesn't come back on this pseudo-row, so there's nothing real
          to compute against (see completionFields.ts). */}
      {completion !== null && (
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-400 font-medium">Progress</span>
            <span className="font-bold text-[#0D3A39]">{completion}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#2F6B6D] transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-1 mt-auto">
        {isEngagement ? (
          <span className="text-xs text-gray-400">{engagementLabel}</span>
        ) : (
          <StatusBadge status={o['Status'] ?? ''} />
        )}
        <span className="text-[11px] text-gray-400">
          {formatDate(o['Admin Created At'] || o['Timestamp'] || '')}
        </span>
      </div>
    </div>
  );
}
