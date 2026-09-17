// Data shapes for the OnActivities onboarding — properties that sell activities
// or experiences and have no lodging. Deliberately independent from the hotel
// flow's types (src/types.ts, RoomItem, RatePlan…): nothing here is shared with
// it, so changes on either side can't affect the other.

export const DAYS = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
] as const;

export const DESCRIPTION_MAX = 350;

export type ActivityItem = {
  id: number;
  name: string;
  description: string;          // capped at DESCRIPTION_MAX in the UI
  termsConditions: string;
  duration: string;             // numeric-as-string, like every other user input in this app
  durationUnit: 'minutes' | 'hours' | 'days';
  priceType: 'fixed' | 'per_person';
  price: string;
  // Which of the globally-defined taxes / policies apply to this activity.
  taxIds: number[];
  cancellationPolicyId: number | null;
  capacity: string;             // total spots available for the activity
  minParticipants: string;      // minimum people served per experience
  maxParticipants: string;      // maximum people served per experience
  availableDays: string[];      // subset of DAYS keys
  timeSlots: string[];          // departure times, 'HH:MM'
  seasonFrom: string;           // 'YYYY-MM-DD'; empty pair = available all year
  seasonTo: string;
};

export type ActivityTax = {
  id: number;
  name: string;
  // Matches the three ways the spec asks for taxes to be calculated.
  calcType: 'percentage' | 'per_person' | 'per_item';
  value: string;
};

export type ActivityCancellationPolicy = {
  id: number;
  name: string;
  window: string;               // numeric-as-string; unit given by windowUnit
  windowUnit: 'hours' | 'days';
  penaltyType: 'none' | 'percentage' | 'fixed';
  penaltyValue: string;
  notes: string;
  isDefault: boolean;
};

// New activities are seeded blank — see SEEDED_ACTIVITY_SLOTS in ActivitiesStep.
export function emptyActivity(id: number): ActivityItem {
  return {
    id,
    name: '',
    description: '',
    termsConditions: '',
    duration: '',
    durationUnit: 'hours',
    priceType: 'per_person',
    price: '',
    taxIds: [],
    cancellationPolicyId: null,
    capacity: '',
    minParticipants: '',
    maxParticipants: '',
    availableDays: [],
    timeSlots: [],
    seasonFrom: '',
    seasonTo: '',
  };
}

// True when the user hasn't typed anything into this activity. Used both to
// render the collapsed "empty slot" state and — critically — to decide whether a
// whole payload is blank, so an unhydrated form can never overwrite real answers
// (same protection as the hotel and social flows).
export function isActivityBlank(a: ActivityItem): boolean {
  return (
    !a.name.trim() &&
    !a.description.trim() &&
    !a.termsConditions.trim() &&
    !a.duration.trim() &&
    !a.price.trim() &&
    !a.capacity.trim() &&
    !a.minParticipants.trim() &&
    !a.maxParticipants.trim() &&
    a.taxIds.length === 0 &&
    a.cancellationPolicyId === null &&
    a.availableDays.length === 0 &&
    a.timeSlots.length === 0 &&
    !a.seasonFrom.trim() &&
    !a.seasonTo.trim()
  );
}

export function emptyTax(id: number): ActivityTax {
  return { id, name: '', calcType: 'percentage', value: '' };
}

export function emptyPolicy(id: number): ActivityCancellationPolicy {
  return {
    id,
    name: '',
    window: '24',
    windowUnit: 'hours',
    penaltyType: 'none',
    penaltyValue: '',
    notes: '',
    isDefault: false,
  };
}

// ── Display helpers (shared by the step, the review screen and the admin) ──────

export function formatDuration(a: ActivityItem): string {
  if (!a.duration.trim()) return '';
  const n = a.duration.trim();
  const unit = a.durationUnit === 'minutes' ? 'min' : a.durationUnit === 'days' ? 'day' : 'hr';
  const plural = unit !== 'min' && Number(n) !== 1 ? 's' : '';
  return `${n} ${unit}${plural}`;
}

export function formatPrice(a: ActivityItem): string {
  if (!a.price.trim()) return '';
  return a.priceType === 'per_person' ? `${a.price} per person` : `${a.price} flat`;
}

export function formatTax(t: ActivityTax): string {
  const value = t.value.trim();
  if (!value) return t.calcType === 'percentage' ? '—' : '—';
  if (t.calcType === 'percentage') return `${value}%`;
  if (t.calcType === 'per_person') return `${value} per person`;
  return `${value} per item`;
}

export function formatPolicyWindow(p: ActivityCancellationPolicy): string {
  if (!p.window.trim()) return 'No window set';
  const unit = p.windowUnit === 'days' ? 'day' : 'hour';
  const plural = Number(p.window) !== 1 ? 's' : '';
  return `Up to ${p.window} ${unit}${plural} before`;
}

export function formatPolicyPenalty(p: ActivityCancellationPolicy): string {
  if (p.penaltyType === 'none') return 'No penalty';
  if (p.penaltyType === 'percentage') return `${p.penaltyValue || '—'}% of total`;
  return `${p.penaltyValue || '—'} fixed`;
}

export function formatDays(a: ActivityItem): string {
  if (a.availableDays.length === 0) return '';
  if (a.availableDays.length === 7) return 'Every day';
  return DAYS.filter((d) => a.availableDays.includes(d.key)).map((d) => d.label).join(', ');
}

export function formatSeason(a: ActivityItem): string {
  if (!a.seasonFrom && !a.seasonTo) return 'All year';
  if (a.seasonFrom && a.seasonTo) return `${a.seasonFrom} → ${a.seasonTo}`;
  return a.seasonFrom ? `From ${a.seasonFrom}` : `Until ${a.seasonTo}`;
}

// Tolerant readers for whatever comes back from Airtable's JSON columns — an old
// or partially-written record must never crash the form or silently drop fields.
export function normalizeActivities(raw: unknown): ActivityItem[] {
  const list = coerceArray(raw);
  return list.map((v, i) => {
    const o = (v ?? {}) as Partial<ActivityItem>;
    const base = emptyActivity(typeof o.id === 'number' ? o.id : Date.now() + i);
    return {
      ...base,
      ...o,
      id: base.id,
      taxIds: Array.isArray(o.taxIds) ? o.taxIds.filter((t) => typeof t === 'number') : [],
      cancellationPolicyId: typeof o.cancellationPolicyId === 'number' ? o.cancellationPolicyId : null,
      availableDays: Array.isArray(o.availableDays) ? o.availableDays.filter((d) => typeof d === 'string') : [],
      timeSlots: Array.isArray(o.timeSlots) ? o.timeSlots.filter((t) => typeof t === 'string') : [],
    };
  });
}

export function normalizeTaxes(raw: unknown): ActivityTax[] {
  return coerceArray(raw).map((v, i) => {
    const o = (v ?? {}) as Partial<ActivityTax>;
    return { ...emptyTax(typeof o.id === 'number' ? o.id : Date.now() + i), ...o };
  });
}

export function normalizePolicies(raw: unknown): ActivityCancellationPolicy[] {
  return coerceArray(raw).map((v, i) => {
    const o = (v ?? {}) as Partial<ActivityCancellationPolicy>;
    return { ...emptyPolicy(typeof o.id === 'number' ? o.id : Date.now() + i), ...o };
  });
}

// Airtable long-text columns hand back a string; a doubly-encoded cell hands back
// a string containing JSON. Both are tolerated, anything else becomes [].
function coerceArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string' && raw.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}
