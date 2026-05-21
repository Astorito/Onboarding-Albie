import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '../components/ui/primitives';
import { ALL_MODULES } from '../constants';
import type { CancellationPolicy } from './modules/CancellationPoliciesStep';
import type { RoomItem } from './modules/RoomInformationStep';
import type { AddonConfig } from './modules/AddOnsStep';
import type { RatesData } from './modules/RatesPackagesStep';
import type { TaxItem } from './modules/TaxesFeesStep';

export interface ReviewData {
  general: Record<string, string>;
  brand: Record<string, string>;
  dns: Record<string, string>;
  cancellationPolicies: CancellationPolicy[];
  rooms: RoomItem[];
  addons: Record<string, AddonConfig>;
  rates: RatesData;
  taxes: TaxItem[];
}

const FIELD_LABELS: Record<string, string> = {
  // General
  propertyName: 'Property Name',
  description: 'Description',
  address: 'Address',
  city: 'City',
  stateProvince: 'State / Province',
  country: 'Country',
  zipCode: 'ZIP / Postal Code',
  timezone: 'Timezone',
  currency: 'Currency',
  language: 'Language',
  phone: 'Phone',
  notificationEmail: 'Notification Email',
  websiteUrl: 'Website URL',
  // Brand
  siteTitle: 'Site Title',
  primaryColor: 'Primary Color',
  secondaryColor: 'Secondary Color',
  accentColor: 'Accent Color',
  fontFamily: 'Font Family',
  buttonStyle: 'Button Style',
  logoUrl: 'Logo URL',
  faviconUrl: 'Favicon URL',
  // DNS
  subdomain: 'Subdomain',
  gtmId: 'GTM ID',
  ga4Id: 'GA4 ID',
  mapId: 'Google Map ID',
};

const friendly = (key: string) =>
  FIELD_LABELS[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

// Renders the body for a given module when expanded
const ModuleBody = ({ moduleId, data }: { moduleId: string; data: ReviewData }) => {
  // Plain object fields (general, brand, dns)
  if (moduleId === 'general' || moduleId === 'brand' || moduleId === 'dns') {
    const obj = moduleId === 'general' ? data.general : moduleId === 'brand' ? data.brand : data.dns;
    const entries = Object.entries(obj).filter(([, v]) => v && String(v).trim() !== '');
    if (entries.length === 0) return <Empty />;
    return (
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 text-xs">
        {entries.map(([k, v]) => (
          <div key={k} className="flex flex-col gap-0.5">
            <dt className="font-bold text-primary text-[10px] uppercase tracking-wider">{friendly(k)}</dt>
            <dd className="text-on-surface-variant break-words">{v}</dd>
          </div>
        ))}
      </dl>
    );
  }

  if (moduleId === 'cancellation') {
    if (data.cancellationPolicies.length === 0) return <Empty />;
    return (
      <ul className="space-y-3 text-xs">
        {data.cancellationPolicies.map((p) => (
          <li key={p.id} className="p-3 bg-surface-container-low/50 rounded-lg">
            <p className="font-bold text-primary text-sm mb-0.5">
              {p.name} {p.isDefault && <span className="text-[9px] bg-secondary text-on-secondary px-1.5 py-0.5 rounded ml-1">Default</span>}
            </p>
            <p className="text-on-surface-variant">
              Window: <strong>{p.window}h</strong> · Penalty: <strong>{p.penaltyType}{p.penaltyValue ? ` (${p.penaltyValue})` : ''}</strong>
            </p>
            {p.description && <p className="text-on-surface-variant mt-1.5 italic">{p.description}</p>}
          </li>
        ))}
      </ul>
    );
  }

  if (moduleId === 'rooms') {
    if (data.rooms.length === 0) return <Empty />;
    return (
      <ul className="space-y-3 text-xs">
        {data.rooms.map((r) => (
          <li key={r.id} className="p-3 bg-surface-container-low/50 rounded-lg">
            <p className="font-bold text-primary text-sm mb-0.5">
              {r.shortTitle || r.name} <span className="text-[10px] text-on-surface-variant font-normal">· {r.code}</span>
            </p>
            <p className="text-on-surface-variant">
              {r.type} · {r.bed} · {r.bedrooms}br · max {r.maxOccupants} guests ({r.maxAdults} adults + {r.childrenCapacity} children)
            </p>
            {r.facilities.length > 0 && (
              <p className="text-on-surface-variant mt-1 text-[10px]">{r.facilities.join(' · ')}</p>
            )}
          </li>
        ))}
      </ul>
    );
  }

  if (moduleId === 'addons') {
    const enabled = Object.entries(data.addons).filter(([, cfg]) => cfg.enabled);
    if (enabled.length === 0) return <Empty />;
    return (
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
        {enabled.map(([name, cfg]) => (
          <li key={name} className="flex items-center justify-between gap-2 p-2.5 bg-surface-container-low/50 rounded-lg">
            <span className="font-bold text-primary">{name}</span>
            <span className="text-on-surface-variant">{cfg.price ? `$${cfg.price}` : 'Free'}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (moduleId === 'rates') {
    const entries = Object.entries(data.rates).filter(([, v]) => v && String(v).trim() !== '');
    if (entries.length === 0) return <Empty />;
    return (
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 text-xs">
        {entries.map(([k, v]) => (
          <div key={k} className="flex flex-col gap-0.5">
            <dt className="font-bold text-primary text-[10px] uppercase tracking-wider">{friendly(k)}</dt>
            <dd className="text-on-surface-variant break-words">{v}</dd>
          </div>
        ))}
      </dl>
    );
  }

  if (moduleId === 'taxes') {
    if (data.taxes.length === 0) return <Empty />;
    return (
      <ul className="space-y-3 text-xs">
        {data.taxes.map((t) => (
          <li key={t.id} className="p-3 bg-surface-container-low/50 rounded-lg">
            <p className="font-bold text-primary text-sm mb-0.5">{t.name}</p>
            <p className="text-on-surface-variant">
              {t.type} · {t.chargeType} <strong>{t.value}{t.chargeType === 'Percentage' ? '%' : ''}</strong> · {t.quantifier}
            </p>
          </li>
        ))}
      </ul>
    );
  }

  return <Empty />;
};

const Empty = () => (
  <p className="text-xs text-on-surface-variant italic">No data entered for this module yet.</p>
);

export const ReviewStep = ({
  clientModules,
  onEdit,
  verified,
  onToggleVerify,
  reviewData,
}: {
  clientModules: string[];
  onEdit: (moduleId: string) => void;
  verified: Set<string>;
  onToggleVerify: (id: string) => void;
  reviewData: ReviewData;
}) => {
  const activeModules = ALL_MODULES.filter((m) => clientModules.includes(m.id));
  const allVerified = activeModules.every((m) => verified.has(m.id));
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col py-4">
      <div className="mb-6 shrink-0 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display-lg text-2xl text-primary font-bold">Review Configuration</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Click each card to expand the data. Confirm each module with the checkmark.
          </p>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap ${
          allVerified
            ? 'bg-green-100 text-green-700'
            : 'bg-surface-container-highest text-on-surface-variant'
        }`}>
          {verified.size} / {activeModules.length} verified
        </span>
      </div>

      <div className="space-y-3 pb-28">
        {activeModules.map((m) => {
          const isVerified = verified.has(m.id);
          const isExpanded = expandedId === m.id;
          return (
            <div
              key={m.id}
              className={`bg-white border-2 rounded-2xl overflow-hidden shadow-sm transition-all duration-200 ${
                isVerified ? 'border-green-400' : isExpanded ? 'border-primary/40' : 'border-outline-variant'
              }`}
            >
              {/* Card header — clickable to toggle expand */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : m.id)}
                className="w-full px-5 py-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-surface-container-low/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isVerified ? 'bg-green-100' : 'bg-secondary/15'
                  }`}>
                    <Icon name={isVerified ? 'check_circle' : m.icon} className={`text-lg ${isVerified ? 'text-green-600' : 'text-secondary'}`} />
                  </div>
                  <div className="min-w-0 text-left">
                    <h2 className="font-bold text-primary text-sm">{m.title}</h2>
                    <p className="text-[10px] text-on-surface-variant truncate">{m.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); onEdit(m.id); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onEdit(m.id); } }}
                    className="text-[10px] font-bold text-primary px-2.5 py-1 rounded-md hover:bg-secondary-container/40 transition-colors cursor-pointer"
                  >
                    EDIT
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); onToggleVerify(m.id); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onToggleVerify(m.id); } }}
                    aria-label={isVerified ? 'Mark as unverified' : 'Mark as verified'}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                      isVerified
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-white border-outline-variant text-transparent hover:border-primary'
                    }`}
                  >
                    <Icon name="check" className="text-sm" />
                  </span>
                  <Icon
                    name="expand_more"
                    className={`text-lg text-on-surface-variant transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {/* Expanded body */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    key="body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-outline-variant"
                  >
                    <div className="p-5 bg-surface-container-low/20">
                      <ModuleBody moduleId={m.id} data={reviewData} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
