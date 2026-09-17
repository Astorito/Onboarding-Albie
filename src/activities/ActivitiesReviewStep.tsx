import { Icon } from '../components/ui/primitives';
import { ACTIVITIES_MODULES } from './constants';
import {
  isActivityBlank, formatDuration, formatPrice, formatDays, formatSeason,
  formatTax, formatPolicyWindow, formatPolicyPenalty,
  type ActivityItem, type ActivityTax, type ActivityCancellationPolicy,
} from './types';

export interface ActivitiesReviewData {
  general: Record<string, string>;
  brand: Record<string, string>;
  cancellationPolicies: ActivityCancellationPolicy[];
  taxes: ActivityTax[];
  activities: ActivityItem[];
}

const FIELD_LABELS: Record<string, string> = {
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
  dateFormat: 'Date Format',
  termsConditions: 'Terms & Conditions',
  siteTitle: 'Site Title',
  primaryColor: 'Primary Color',
  secondaryColor: 'Secondary Color',
  accentColor: 'Accent Color',
  fontFamily: 'Font Family',
  buttonStyle: 'Button Style',
  logoUrl: 'Logo URL',
  faviconUrl: 'Favicon URL',
};

const friendly = (key: string) =>
  FIELD_LABELS[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

const Empty = () => (
  <p className="text-xs text-on-surface-variant italic">No data entered for this step yet.</p>
);

function KeyValues({ data }: { data: Record<string, string> }) {
  const entries = Object.entries(data).filter(([, v]) => v && String(v).trim() !== '');
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

function ModuleBody({ moduleId, data }: { moduleId: string; data: ActivitiesReviewData }) {
  if (moduleId === 'general') return <KeyValues data={data.general} />;
  if (moduleId === 'brand') return <KeyValues data={data.brand} />;

  if (moduleId === 'cancellation') {
    if (data.cancellationPolicies.length === 0) return <Empty />;
    return (
      <ul className="flex flex-col gap-3 text-xs">
        {data.cancellationPolicies.map((p) => (
          <li key={p.id} className="border-l-2 border-secondary pl-3">
            <p className="font-bold text-primary">
              {p.name || 'Unnamed policy'}
              {p.isDefault && (
                <span className="ml-2 text-[10px] bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded">
                  Default
                </span>
              )}
            </p>
            <p className="text-on-surface-variant">
              {formatPolicyWindow(p)} · {formatPolicyPenalty(p)}
            </p>
            {p.notes && <p className="text-on-surface-variant italic">{p.notes}</p>}
          </li>
        ))}
      </ul>
    );
  }

  if (moduleId === 'taxes') {
    if (data.taxes.length === 0) return <Empty />;
    return (
      <ul className="flex flex-col gap-2 text-xs">
        {data.taxes.map((t) => (
          <li key={t.id} className="border-l-2 border-secondary pl-3">
            <span className="font-bold text-primary">{t.name || 'Unnamed tax'}</span>
            <span className="text-on-surface-variant"> · {formatTax(t)}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (moduleId === 'activities') {
    const filled = data.activities.filter((a) => !isActivityBlank(a));
    if (filled.length === 0) return <Empty />;
    return (
      <ul className="flex flex-col gap-4 text-xs">
        {filled.map((a) => {
          const policy = data.cancellationPolicies.find((p) => p.id === a.cancellationPolicyId);
          const taxNames = a.taxIds
            .map((id) => data.taxes.find((t) => t.id === id))
            .filter(Boolean)
            .map((t) => t!.name || 'Unnamed tax');
          return (
            <li key={a.id} className="border-l-2 border-secondary pl-3">
              <p className="font-bold text-primary">{a.name || 'Untitled activity'}</p>
              <p className="text-on-surface-variant">
                {[formatDuration(a), formatPrice(a)].filter(Boolean).join(' · ') || 'No pricing set'}
              </p>
              {a.description && <p className="text-on-surface-variant italic">{a.description}</p>}
              <p className="text-on-surface-variant">
                {formatDays(a) || 'No days selected'}
                {a.timeSlots.length > 0 && ` · ${a.timeSlots.join(', ')}`}
                {` · ${formatSeason(a)}`}
              </p>
              <p className="text-on-surface-variant">
                Capacity: {a.capacity || '—'} · Group: {a.minParticipants || '—'}–{a.maxParticipants || '—'}
              </p>
              <p className="text-on-surface-variant">
                Cancellation: {policy ? policy.name || 'Unnamed policy' : 'Not set'}
                {' · '}Taxes: {taxNames.length > 0 ? taxNames.join(', ') : 'None'}
              </p>
            </li>
          );
        })}
      </ul>
    );
  }

  return <Empty />;
}

export const ActivitiesReviewStep = ({
  reviewData,
  onEdit,
}: {
  reviewData: ActivitiesReviewData;
  onEdit: (moduleId: string) => void;
}) => (
  <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
    <div className="mb-4 shrink-0">
      <h1 className="font-display-lg text-xl text-primary font-bold">Review Your Answers</h1>
      <p className="text-on-surface-variant text-xs">
        Double-check everything before submitting your activities setup.
      </p>
    </div>

    <div className="flex flex-col gap-4">
      {ACTIVITIES_MODULES.map((m) => (
        <div key={m.id} className="bg-white border border-outline-variant rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name={m.icon} className="text-secondary text-2xl" />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-primary">{m.title}</h3>
              <p className="text-[11px] text-on-surface-variant">{m.description}</p>
            </div>
            <button
              type="button"
              onClick={() => onEdit(m.id)}
              className="text-xs font-bold text-primary uppercase tracking-wide hover:text-secondary transition-colors cursor-pointer"
            >
              Edit
            </button>
          </div>
          <ModuleBody moduleId={m.id} data={reviewData} />
        </div>
      ))}
    </div>
  </div>
);
