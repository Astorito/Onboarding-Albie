import { useState, useImperativeHandle, forwardRef, Fragment, type Dispatch, type SetStateAction } from 'react';
import { FormField, TextInput, TextareaInput, SelectInput, SystemCodeNote } from '../../components/ui/primitives';
import { ConfigSection, ItemCard, AddItemButton, FormActions } from '../../components/ui/layout';
import type { RoomItem } from './RoomInformationStep';
import { normalizeRatePlans, ratePlanSummary, type RatePlan, type RatesData } from '../../utils/rates';

export type { RatePlan, RatesData };

type FormState = Omit<RatePlan, 'id'>;

// A factory (not a shared constant) because appliesToRooms is an array — a
// spread of a module-level constant would hand every form the same array.
const emptyForm = (): FormState => ({
  rateCode: '',
  rateGroup: '',
  shortTitle: '',
  longTitle: '',
  description: '',
  status: 'Active',
  orderIndex: '',
  availFrom: '',
  availTo: '',
  appliesToRooms: [],
  minStay: '',
  maxStay: '',
  imageUrl: '',
  tags: '',
  salesMessages: '',
  terms: '',
});

interface Props {
  rates: RatesData;
  setRates: Dispatch<SetStateAction<RatesData>>;
  rooms?: RoomItem[];
}

export interface RatesPackagesStepHandle {
  // See RoomInformationStepHandle.commitPending for rationale.
  commitPending: () => RatePlan[] | null;
}

export const RatesPackagesStep = forwardRef<RatesPackagesStepHandle, Props>(
  ({ rates, setRates, rooms = [] }, ref) => {
    // Tolerates a legacy object arriving straight through props (e.g. a session
    // hydrated by an older client) so the list never renders from a bad shape.
    const plans = normalizeRatePlans(rates);

    const [showForm, setShowForm] = useState(plans.length === 0);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm());

    const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
      setForm((f) => ({ ...f, [k]: v }));

    const roomOptions = rooms.map((r) => r.shortTitle || r.code).filter(Boolean);
    // A saved plan can reference a room that was since renamed or deleted. Render
    // those alongside the live options (selected) so the hotel can see them and
    // choose to remove them, instead of them silently vanishing on the next save.
    const orphanRooms = form.appliesToRooms.filter((name) => !roomOptions.includes(name));
    const roomChoices = [...roomOptions, ...orphanRooms];

    const toggleRoom = (name: string) =>
      setForm((f) => ({
        ...f,
        appliesToRooms: f.appliesToRooms.includes(name)
          ? f.appliesToRooms.filter((r) => r !== name)
          : [...f.appliesToRooms, name],
      }));

    const startNew = () => {
      setForm(emptyForm());
      setEditingId(null);
      setShowForm(true);
    };

    const startEdit = (p: RatePlan) => {
      // No field-by-field defaulting needed: normalizeRatePlans already guarantees
      // every key is present and every scalar is a string, and it has already
      // folded any legacy `appliesTo` room into appliesToRooms.
      const { id, ...rest } = p;
      setForm({ ...rest, appliesToRooms: [...rest.appliesToRooms] });
      setEditingId(id);
      setShowForm(true);
    };

    const cancel = () => {
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm());
    };

    const commit = (): RatePlan[] => {
      const next = editingId !== null
        ? plans.map((p) => (p.id === editingId ? { ...p, ...form } : p))
        : [...plans, { id: Date.now(), ...form }];
      setRates(next);
      cancel();
      return next;
    };

    const savePlan = () => { commit(); };

    useImperativeHandle(ref, () => ({
      commitPending: () => {
        if (!showForm) return null;
        const hasData = form.rateCode.trim() || form.shortTitle.trim() || form.description.trim();
        if (!hasData) return null;
        return commit();
      },
    }), [showForm, form, editingId, plans]);

    return (
      <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
        <div className="mb-5 shrink-0">
          <h1 className="font-display-lg text-2xl text-primary font-bold">Rates & Packages</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Add each rate plan you sell — pricing rules, visibility windows, and the rooms it applies to.
          </p>
        </div>

        {!showForm ? (
          <div className="space-y-3">
            {plans.map((p) => (
              <Fragment key={p.id}>
                <ItemCard
                  icon="sell"
                  title={p.shortTitle || p.rateCode || 'Rate Plan'}
                  subtitle={ratePlanSummary(p)}
                  onEdit={() => startEdit(p)}
                  onDelete={() => setRates(plans.filter((x) => x.id !== p.id))}
                />
              </Fragment>
            ))}
            <AddItemButton label="Add Rate Plan" onClick={startNew} />
          </div>
        ) : (
          <>
            {/* Section 1 — Basics */}
            <ConfigSection
              title={editingId !== null ? 'Edit Rate Plan' : 'Rate Plan Basics'}
              description="The core identification for this rate. Code is internal, titles are guest-facing."
              icon="sell"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <FormField label="Rate Code" required hint='A unique code for this rate — e.g. "BAR-2025" (example only).'>
                  <TextInput
                    placeholder="e.g. BAR-2025"
                    value={form.rateCode}
                    onChange={(e) => update('rateCode', e.target.value)}
                    aria-describedby="rate-code-guidance"
                  />
                </FormField>

                <FormField label="Rate Group" required hint="Categorize this rate for reporting.">
                  <SelectInput
                    value={form.rateGroup}
                    onChange={(e) => update('rateGroup', e.target.value)}
                  >
                    <option value="">Select group</option>
                    <option>Leisure</option>
                    <option>Business</option>
                    <option>Corporate</option>
                    <option>Promotions</option>
                  </SelectInput>
                </FormField>

                <SystemCodeNote kind="rate" id="rate-code-guidance" className="col-span-2" />

                <FormField label="Short Title" required hint='Shown in rate cards. Example: "Best Available Rate".'>
                  <TextInput
                    placeholder="Best Available Rate"
                    value={form.shortTitle}
                    onChange={(e) => update('shortTitle', e.target.value)}
                  />
                </FormField>

                <FormField label="Long Title" hint="Optional descriptive title for the booking detail page.">
                  <TextInput
                    placeholder="Best Available Rate – Flexible Booking"
                    value={form.longTitle}
                    onChange={(e) => update('longTitle', e.target.value)}
                  />
                </FormField>

                <FormField label="Rate Description" required className="col-span-2" hint="What guests see — what does this rate include?">
                  <TextareaInput
                    rows={3}
                    placeholder="Best flexible rate. Free cancellation up to 24h before check-in. Breakfast not included."
                    value={form.description}
                    onChange={(e) => update('description', e.target.value)}
                  />
                </FormField>
              </div>
            </ConfigSection>

            {/* Section 2 — Visibility & restrictions */}
            <ConfigSection
              title="Visibility & Restrictions"
              description="When this rate is available and any minimum-stay rules."
              icon="visibility"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <FormField label="Status" required>
                  <SelectInput
                    value={form.status}
                    onChange={(e) => update('status', e.target.value)}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Draft</option>
                  </SelectInput>
                </FormField>

                <FormField label="Display Order" hint="Lower numbers show first. Example: 1.">
                  <TextInput
                    type="number"
                    placeholder="1"
                    value={form.orderIndex}
                    onChange={(e) => update('orderIndex', e.target.value)}
                  />
                </FormField>

                <FormField label="Bookable From" required hint="The first date guests can book this rate.">
                  <TextInput
                    type="date"
                    value={form.availFrom}
                    onChange={(e) => update('availFrom', e.target.value)}
                  />
                </FormField>

                <FormField label="Bookable Until" required hint="The last date this rate is offered.">
                  <TextInput
                    type="date"
                    value={form.availTo}
                    onChange={(e) => update('availTo', e.target.value)}
                  />
                </FormField>

                <FormField label="Minimum Stay (nights)" hint="Example: 2 for weekend-only rates.">
                  <TextInput
                    type="number"
                    min={1}
                    placeholder="1"
                    value={form.minStay}
                    onChange={(e) => update('minStay', e.target.value)}
                  />
                </FormField>

                <FormField label="Maximum Stay (nights)" hint="Leave blank for no limit.">
                  <TextInput
                    type="number"
                    min={1}
                    placeholder="14"
                    value={form.maxStay}
                    onChange={(e) => update('maxStay', e.target.value)}
                  />
                </FormField>

                <FormField
                  label="Applies To Rooms"
                  className="col-span-2"
                  hint="Select every room type this rate is offered for. Leave all unselected to offer it on all rooms."
                >
                  {roomChoices.length === 0 ? (
                    <p className="text-xs text-on-surface-variant italic">
                      No room types added yet — this rate will apply to all rooms. Add rooms in the
                      Room Information step to target specific ones.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {roomChoices.map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => toggleRoom(name)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-[11px] font-bold cursor-pointer text-left ${
                            form.appliesToRooms.includes(name)
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary'
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  )}
                </FormField>
              </div>
            </ConfigSection>

            {/* Section 3 — Image */}
            <ConfigSection
              title="Promotional Image"
              description="Optional banner image shown on the booking page for this rate."
              icon="image"
            >
              <div className="grid grid-cols-1 gap-y-5">
                <FormField label="Image URL" hint="Paste a public image URL. JPG or PNG, ~1200×600 recommended.">
                  <TextInput
                    type="url"
                    placeholder="https://cdn.yourhotel.com/rates/bar-banner.jpg"
                    value={form.imageUrl}
                    onChange={(e) => update('imageUrl', e.target.value)}
                  />
                </FormField>
              </div>
            </ConfigSection>

            {/* Section 4 — Tags & Messages */}
            <ConfigSection
              title="Tags & Promotional Messages"
              description="Optional labels and copy to highlight this rate on the booking page."
              icon="label"
            >
              <div className="grid grid-cols-1 gap-y-5">
                <FormField label="Tags" hint='Comma-separated. Example: "summer, promotion, non-refundable".'>
                  <TextInput
                    placeholder="summer, promotion, non-refundable"
                    value={form.tags}
                    onChange={(e) => update('tags', e.target.value)}
                  />
                </FormField>

                <FormField label="Sales Message" hint='Short promotional message. Example: "Book now, save 20%!"'>
                  <TextareaInput
                    rows={2}
                    placeholder='Book now and save 20%!'
                    value={form.salesMessages}
                    onChange={(e) => update('salesMessages', e.target.value)}
                  />
                </FormField>

                <FormField label="Terms & Conditions" hint="Legal copy shown on the booking confirmation.">
                  <TextareaInput
                    rows={3}
                    placeholder="Conditions, restrictions, legal notes..."
                    value={form.terms}
                    onChange={(e) => update('terms', e.target.value)}
                  />
                </FormField>

                <div className="mt-6">
                  <FormActions
                    onCancel={cancel}
                    onSave={savePlan}
                    saveLabel={editingId !== null ? 'Update Rate Plan' : 'Save Rate Plan'}
                  />
                </div>
              </div>
            </ConfigSection>
          </>
        )}
      </div>
    );
  },
);
