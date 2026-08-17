export type RatePlan = {
  id: number;
  rateCode: string;
  rateGroup: string;
  shortTitle: string;
  longTitle: string;
  description: string;
  status: string;
  orderIndex: string;
  availFrom: string;
  availTo: string;
  minStay: string;
  maxStay: string;
  // Rooms this rate is offered for, by display name. Empty means "all rooms".
  // Note there is deliberately NO legacy `appliesTo` field here: normalizeRatePlans
  // folds it into this array so a stored plan can never hold two contradictory
  // answers to "which rooms?".
  appliesToRooms: string[];
  imageUrl: string;
  tags: string;
  salesMessages: string;
  terms: string;
};

export type RatesData = RatePlan[];

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));

// Builds a fully-populated plan: every key present, every scalar a string, and
// appliesToRooms always an array. Doing the coercion here (rather than at each
// call site) is what lets the form bind directly to a plan without React
// flipping inputs to uncontrolled on a field an older record never stored.
function toPlan(o: Record<string, unknown>, id: number): RatePlan {
  const legacyRoom = str(o.appliesTo).trim();
  const rooms = Array.isArray(o.appliesToRooms)
    ? o.appliesToRooms.map((s) => str(s).trim()).filter(Boolean)
    : legacyRoom
      ? [legacyRoom]
      : [];

  return {
    id,
    rateCode: str(o.rateCode),
    rateGroup: str(o.rateGroup),
    shortTitle: str(o.shortTitle),
    longTitle: str(o.longTitle),
    description: str(o.description),
    status: str(o.status) || 'Active',
    orderIndex: str(o.orderIndex),
    availFrom: str(o.availFrom),
    availTo: str(o.availTo),
    minStay: str(o.minStay),
    maxStay: str(o.maxStay),
    appliesToRooms: rooms,
    imageUrl: str(o.imageUrl),
    tags: str(o.tags),
    salesMessages: str(o.salesMessages),
    terms: str(o.terms),
  };
}

function isPlanObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

// Rates were originally a single flat object — one plan per onboarding — and
// existing onboardings still have that shape stored. Every read funnels through
// here: an array passes through, a legacy object becomes a one-element list with
// all of its fields preserved.
//
// This never rewrites anything on disk. A stored object only turns into an array
// once that onboarding is saved again, and then its existing plan is simply item
// #1 of the list, with nothing lost.
//
// Idempotent by design — normalizeRatePlans(normalizeRatePlans(x)) equals
// normalizeRatePlans(x) — so it is safe to call at every read boundary.
export function normalizeRatePlans(raw: unknown): RatePlan[] {
  if (raw === null || raw === undefined) return [];

  // A doubly-encoded cell parses to a JSON *string*. Without this the plan would
  // be silently dropped, and the next autosave would overwrite it with [].
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return normalizeRatePlans(JSON.parse(trimmed));
      } catch {
        return [];
      }
    }
    return [];
  }

  if (typeof raw !== 'object') return [];

  const objects = Array.isArray(raw)
    ? raw.filter(isPlanObject)
    : // An untouched onboarding stores `{}` and a cleared form stores all-blank
      // values. Neither is a real rate plan, so neither becomes a blank card.
      Object.values(raw as Record<string, unknown>).some((v) => str(v).trim() !== '')
      ? [raw as Record<string, unknown>]
      : [];

  // Ids must come out unique: Edit and Delete match on id, so a duplicate would
  // silently act on the wrong plan. Backfilling from the array index is NOT safe
  // (`[{id:2}, {no id}]` would mint a second id 2), so unclaimed ids are handed
  // out from the lowest free integer instead.
  const taken = new Set<number>();
  let nextId = 1;
  const allocateId = (candidate: unknown): number => {
    if (typeof candidate === 'number' && Number.isFinite(candidate) && !taken.has(candidate)) {
      taken.add(candidate);
      return candidate;
    }
    while (taken.has(nextId)) nextId++;
    taken.add(nextId);
    return nextId;
  };

  return objects.map((o) => toPlan(o, allocateId(o.id)));
}

// Empty means the rate is offered on every room type — same meaning the legacy
// single `appliesTo: ''` had.
export function formatAppliesTo(p: { appliesToRooms?: string[] }): string {
  return p.appliesToRooms && p.appliesToRooms.length > 0
    ? p.appliesToRooms.join(', ')
    : 'All rooms';
}

// Card subtitle for the rate plan list — ItemCard requires a plain string.
export function ratePlanSummary(p: RatePlan): string {
  const parts = [p.rateCode, p.rateGroup, p.status].map((s) => s.trim()).filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : '—';
}
