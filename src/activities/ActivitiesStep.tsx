import { useState } from 'react';
import { FormField, TextInput, TextareaInput, SelectInput, Icon } from '../components/ui/primitives';
import { ConfigSection, AddItemButton } from '../components/ui/layout';
import {
  DAYS, DESCRIPTION_MAX, emptyActivity, isActivityBlank,
  formatDuration, formatPrice, formatDays, formatSeason, formatTax,
  type ActivityItem, type ActivityTax, type ActivityCancellationPolicy,
} from './types';

// The core step. Properties of this kind typically run 4-5 activities, so the
// list is seeded with SEEDED_SLOTS empty ones — the client sees the whole set at
// a glance instead of discovering an "add" button. One activity expands at a
// time (an accordion): each has ~15 fields, so rendering them all expanded would
// be an unusable wall of inputs.
//
// Edits apply immediately by id, like the taxes and cancellation steps.

export const SEEDED_SLOTS = 5;

export function seedActivities(): ActivityItem[] {
  // Date.now() + i keeps ids unique; ids are what edit/remove match on.
  return Array.from({ length: SEEDED_SLOTS }, (_, i) => emptyActivity(Date.now() + i));
}

function TimeSlots({
  slots, onChange,
}: {
  slots: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState('');
  const addSlot = () => {
    const v = draft.trim();
    if (!v || slots.includes(v)) { setDraft(''); return; }
    onChange([...slots, v].sort());
    setDraft('');
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <TextInput
          type="time"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSlot(); } }}
        />
        <button
          type="button"
          onClick={addSlot}
          className="shrink-0 px-4 py-2.5 border border-primary text-primary text-sm font-semibold rounded-lg hover:bg-primary/5 transition cursor-pointer whitespace-nowrap"
        >
          Add time
        </button>
      </div>
      {slots.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {slots.map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5 text-xs bg-surface-container-low border border-outline-variant rounded-lg px-2.5 py-1">
              {s}
              <button
                type="button"
                onClick={() => onChange(slots.filter((x) => x !== s))}
                className="text-on-surface-variant hover:text-red-500 transition-colors cursor-pointer"
                title={`Remove ${s}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export const ActivitiesStep = ({
  activities,
  setActivities,
  taxes,
  policies,
}: {
  activities: ActivityItem[];
  setActivities: (next: ActivityItem[]) => void;
  taxes: ActivityTax[];
  policies: ActivityCancellationPolicy[];
}) => {
  const [openId, setOpenId] = useState<number | null>(activities[0]?.id ?? null);

  const update = (id: number, patch: Partial<ActivityItem>) =>
    setActivities(activities.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const remove = (id: number) => {
    setActivities(activities.filter((a) => a.id !== id));
    if (openId === id) setOpenId(null);
  };

  const add = () => {
    const next = emptyActivity(Date.now());
    // A new activity inherits the default policy, if one was marked.
    const fallback = policies.find((p) => p.isDefault);
    if (fallback) next.cancellationPolicyId = fallback.id;
    setActivities([...activities, next]);
    setOpenId(next.id);
  };

  const toggleDay = (a: ActivityItem, day: string) =>
    update(a.id, {
      availableDays: a.availableDays.includes(day)
        ? a.availableDays.filter((d) => d !== day)
        : [...a.availableDays, day],
    });

  const toggleTax = (a: ActivityItem, taxId: number) =>
    update(a.id, {
      taxIds: a.taxIds.includes(taxId) ? a.taxIds.filter((t) => t !== taxId) : [...a.taxIds, taxId],
    });

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
      <div className="mb-4 shrink-0">
        <h1 className="font-display-lg text-xl text-primary font-bold">Activities</h1>
        <p className="text-on-surface-variant text-xs">
          One entry per activity or experience you sell. Click one to fill it in — empty ones are
          simply ignored.
        </p>
      </div>

      <ConfigSection
        title="Your Activities"
        description="Describe each experience, how long it runs, what it costs, and when it's available."
        icon="local_activity"
      >
        <div className="flex flex-col gap-3">
          {activities.map((a, index) => {
            const isOpen = openId === a.id;
            const blank = isActivityBlank(a);
            const summary = [formatDuration(a), formatPrice(a), formatDays(a)].filter(Boolean).join(' · ');

            return (
              <div key={a.id} className="border border-outline-variant rounded-xl bg-white overflow-hidden">
                {/* Collapsed header — always visible */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : a.id)}
                    className="flex-1 flex items-center gap-3 text-left cursor-pointer min-w-0"
                  >
                    <span className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                      blank ? 'bg-surface-container-low text-on-surface-variant' : 'bg-primary text-white'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm font-bold truncate ${blank ? 'text-on-surface-variant' : 'text-primary'}`}>
                        {a.name.trim() || `Activity ${index + 1}`}
                      </span>
                      <span className="block text-xs text-on-surface-variant truncate">
                        {blank ? 'Empty — click to fill in' : summary || 'No details yet'}
                      </span>
                    </span>
                    <Icon
                      name="expand_more"
                      className={`text-on-surface-variant transition-transform shrink-0 ${isOpen ? '' : '-rotate-90'}`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(a.id)}
                    className="shrink-0 text-on-surface-variant hover:text-red-500 transition-colors cursor-pointer text-sm"
                    title="Remove activity"
                  >
                    ✕
                  </button>
                </div>

                {isOpen && (
                  <div className="border-t border-outline-variant px-4 py-5 flex flex-col gap-6">
                    {/* ── The basics ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <FormField label="Activity Name" required className="col-span-2">
                        <TextInput
                          value={a.name}
                          onChange={(e) => update(a.id, { name: e.target.value })}
                          placeholder="Guided kayak tour"
                        />
                      </FormField>

                      <FormField
                        label="Description"
                        required
                        className="col-span-2"
                        hint={`${a.description.length}/${DESCRIPTION_MAX} characters`}
                      >
                        <TextareaInput
                          rows={3}
                          value={a.description}
                          maxLength={DESCRIPTION_MAX}
                          onChange={(e) => update(a.id, { description: e.target.value.slice(0, DESCRIPTION_MAX) })}
                          placeholder="What the experience includes, where it starts, what to bring..."
                        />
                      </FormField>

                      <FormField label="Duration" required>
                        <div className="flex gap-2">
                          <TextInput
                            type="number"
                            value={a.duration}
                            onChange={(e) => update(a.id, { duration: e.target.value })}
                            placeholder="3"
                          />
                          <SelectInput
                            value={a.durationUnit}
                            onChange={(e) => update(a.id, { durationUnit: e.target.value as ActivityItem['durationUnit'] })}
                          >
                            <option value="minutes">minutes</option>
                            <option value="hours">hours</option>
                            <option value="days">days</option>
                          </SelectInput>
                        </div>
                      </FormField>

                      <FormField label="Price" required>
                        <div className="flex gap-2">
                          <SelectInput
                            value={a.priceType}
                            onChange={(e) => update(a.id, { priceType: e.target.value as ActivityItem['priceType'] })}
                          >
                            <option value="per_person">Per person</option>
                            <option value="fixed">Fixed price</option>
                          </SelectInput>
                          <TextInput
                            type="number"
                            value={a.price}
                            onChange={(e) => update(a.id, { price: e.target.value })}
                            placeholder="50"
                          />
                        </div>
                      </FormField>
                    </div>

                    {/* ── Capacity ── */}
                    <div>
                      <p className="text-[11px] font-bold text-primary uppercase tracking-wide mb-3">Capacity</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                        <FormField label="Total spots" hint="How many people can book this activity.">
                          <TextInput
                            type="number"
                            value={a.capacity}
                            onChange={(e) => update(a.id, { capacity: e.target.value })}
                            placeholder="20"
                          />
                        </FormField>
                        <FormField label="Minimum group" hint="Fewest people needed to run it.">
                          <TextInput
                            type="number"
                            value={a.minParticipants}
                            onChange={(e) => update(a.id, { minParticipants: e.target.value })}
                            placeholder="2"
                          />
                        </FormField>
                        <FormField label="Maximum group" hint="Most people served per experience.">
                          <TextInput
                            type="number"
                            value={a.maxParticipants}
                            onChange={(e) => update(a.id, { maxParticipants: e.target.value })}
                            placeholder="10"
                          />
                        </FormField>
                      </div>
                    </div>

                    {/* ── Availability ── */}
                    <div>
                      <p className="text-[11px] font-bold text-primary uppercase tracking-wide mb-3">Availability</p>
                      <div className="flex flex-col gap-4">
                        <FormField label="Days of the week" hint="Leave all unselected if it runs on request only.">
                          <div className="flex flex-wrap gap-2">
                            {DAYS.map((d) => {
                              const on = a.availableDays.includes(d.key);
                              return (
                                <button
                                  key={d.key}
                                  type="button"
                                  onClick={() => toggleDay(a, d.key)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                                    on
                                      ? 'bg-primary text-white border-primary'
                                      : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary/40'
                                  }`}
                                >
                                  {d.label}
                                </button>
                              );
                            })}
                          </div>
                        </FormField>

                        <FormField label="Departure times" hint="Add each start time. Leave empty if the time is flexible.">
                          <TimeSlots slots={a.timeSlots} onChange={(next) => update(a.id, { timeSlots: next })} />
                        </FormField>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                          <FormField label="Season starts" hint="Leave both empty if it runs all year.">
                            <TextInput
                              type="date"
                              value={a.seasonFrom}
                              onChange={(e) => update(a.id, { seasonFrom: e.target.value })}
                            />
                          </FormField>
                          <FormField label="Season ends">
                            <TextInput
                              type="date"
                              value={a.seasonTo}
                              onChange={(e) => update(a.id, { seasonTo: e.target.value })}
                            />
                          </FormField>
                        </div>
                      </div>
                    </div>

                    {/* ── Taxes & cancellation, referencing the global lists ── */}
                    <div>
                      <p className="text-[11px] font-bold text-primary uppercase tracking-wide mb-3">Taxes & Cancellation</p>
                      <div className="flex flex-col gap-4">
                        <FormField label="Taxes that apply">
                          {taxes.length === 0 ? (
                            <p className="text-xs text-on-surface-variant italic">
                              No taxes defined. Go back to the Taxes step to add them.
                            </p>
                          ) : (
                            <div className="flex flex-col gap-2">
                              {taxes.map((t) => (
                                <label key={t.id} className="flex items-center gap-2.5 text-sm text-on-surface cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={a.taxIds.includes(t.id)}
                                    onChange={() => toggleTax(a, t.id)}
                                    className="accent-primary w-4 h-4"
                                  />
                                  {t.name || 'Unnamed tax'}
                                  <span className="text-xs text-on-surface-variant">({formatTax(t)})</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </FormField>

                        <FormField label="Cancellation policy">
                          {policies.length === 0 ? (
                            <p className="text-xs text-on-surface-variant italic">
                              No policies defined. Go back to the Cancellation Policies step to add one.
                            </p>
                          ) : (
                            <SelectInput
                              value={a.cancellationPolicyId === null ? '' : String(a.cancellationPolicyId)}
                              onChange={(e) =>
                                update(a.id, { cancellationPolicyId: e.target.value === '' ? null : Number(e.target.value) })
                              }
                            >
                              <option value="">No policy selected</option>
                              {policies.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name || 'Unnamed policy'}
                                </option>
                              ))}
                            </SelectInput>
                          )}
                        </FormField>

                        <FormField
                          label="Terms & conditions for this activity"
                          hint="Only what's specific to this one — general terms live on the first step."
                        >
                          <TextareaInput
                            rows={2}
                            value={a.termsConditions}
                            onChange={(e) => update(a.id, { termsConditions: e.target.value })}
                            placeholder="Minimum age 12. Participants must know how to swim."
                          />
                        </FormField>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setOpenId(null)}
                        className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <AddItemButton label="Add Activity" onClick={add} />

          {/* Seeded empty slots are fine to leave — say so, so nobody feels
              obliged to fill all five. */}
          <p className="text-xs text-on-surface-variant italic">
            {activities.filter((a) => !isActivityBlank(a)).length} of {activities.length} filled in.
            Empty activities are ignored.
          </p>
        </div>
      </ConfigSection>

      {/* A quick sanity summary of what's configured — useful once several
          activities are in play. */}
      {activities.some((a) => !isActivityBlank(a)) && (
        <div className="mt-4 text-xs text-on-surface-variant">
          {activities.filter((a) => !isActivityBlank(a)).map((a) => (
            <div key={a.id} className="py-0.5">
              <span className="font-semibold text-primary">{a.name.trim() || 'Untitled'}</span>
              {' — '}{formatSeason(a)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
