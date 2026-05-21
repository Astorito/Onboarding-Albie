import { type Dispatch, type SetStateAction } from 'react';
import { FormField, TextInput, TextareaInput, SelectInput } from '../../components/ui/primitives';
import { ConfigSection } from '../../components/ui/layout';
import type { RoomItem } from './RoomInformationStep';

export type RatesData = Record<string, string>;

interface Props {
  rates: RatesData;
  setRates: Dispatch<SetStateAction<RatesData>>;
  rooms?: RoomItem[];
}

export const RatesPackagesStep = ({ rates, setRates, rooms = [] }: Props) => {
  const handleChange = (field: string, value: string) =>
    setRates((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
      <div className="mb-5 shrink-0">
        <h1 className="font-display-lg text-2xl text-primary font-bold">Rates & Packages</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Set up a rate plan with pricing rules, visibility windows, and the rooms it applies to.
        </p>
      </div>

      {/* Section 1 — Basics */}
      <ConfigSection
        title="Rate Plan Basics"
        description="The core identification for this rate. Code is internal, titles are guest-facing."
        icon="sell"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <FormField label="Rate Code" required hint='Internal code. Example: "BAR-2025" or "NRR-SUMMER".'>
            <TextInput
              placeholder="BAR-2025"
              value={rates.rateCode ?? ''}
              onChange={(e) => handleChange('rateCode', e.target.value)}
            />
          </FormField>

          <FormField label="Rate Group" required hint="Categorize this rate for reporting.">
            <SelectInput
              value={rates.rateGroup ?? ''}
              onChange={(e) => handleChange('rateGroup', e.target.value)}
            >
              <option value="">Select group</option>
              <option>Leisure</option>
              <option>Business</option>
              <option>Corporate</option>
              <option>Promotions</option>
            </SelectInput>
          </FormField>

          <FormField label="Short Title" required hint='Shown in rate cards. Example: "Best Available Rate".'>
            <TextInput
              placeholder="Best Available Rate"
              value={rates.shortTitle ?? ''}
              onChange={(e) => handleChange('shortTitle', e.target.value)}
            />
          </FormField>

          <FormField label="Long Title" hint="Optional descriptive title for the booking detail page.">
            <TextInput
              placeholder="Best Available Rate – Flexible Booking"
              value={rates.longTitle ?? ''}
              onChange={(e) => handleChange('longTitle', e.target.value)}
            />
          </FormField>

          <FormField label="Rate Description" required className="col-span-2" hint="What guests see — what does this rate include?">
            <TextareaInput
              rows={3}
              placeholder="Best flexible rate. Free cancellation up to 24h before check-in. Breakfast not included."
              value={rates.description ?? ''}
              onChange={(e) => handleChange('description', e.target.value)}
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
              value={rates.status ?? 'Active'}
              onChange={(e) => handleChange('status', e.target.value)}
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
              value={rates.orderIndex ?? ''}
              onChange={(e) => handleChange('orderIndex', e.target.value)}
            />
          </FormField>

          <FormField label="Bookable From" required hint="The first date guests can book this rate.">
            <TextInput
              type="date"
              value={rates.availFrom ?? ''}
              onChange={(e) => handleChange('availFrom', e.target.value)}
            />
          </FormField>

          <FormField label="Bookable Until" required hint="The last date this rate is offered.">
            <TextInput
              type="date"
              value={rates.availTo ?? ''}
              onChange={(e) => handleChange('availTo', e.target.value)}
            />
          </FormField>

          <FormField label="Minimum Stay (nights)" hint="Example: 2 for weekend-only rates.">
            <TextInput
              type="number"
              min={1}
              placeholder="1"
              value={rates.minStay ?? ''}
              onChange={(e) => handleChange('minStay', e.target.value)}
            />
          </FormField>

          <FormField label="Maximum Stay (nights)" hint="Leave blank for no limit.">
            <TextInput
              type="number"
              min={1}
              placeholder="14"
              value={rates.maxStay ?? ''}
              onChange={(e) => handleChange('maxStay', e.target.value)}
            />
          </FormField>

          <FormField label="Applies To Rooms" className="col-span-2" hint="Which room types this rate is offered for.">
            <SelectInput
              value={rates.appliesTo ?? ''}
              onChange={(e) => handleChange('appliesTo', e.target.value)}
            >
              <option value="">All rooms</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.shortTitle || r.code}>
                  {r.shortTitle || r.code}
                </option>
              ))}
            </SelectInput>
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
              value={rates.imageUrl ?? ''}
              onChange={(e) => handleChange('imageUrl', e.target.value)}
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
              value={rates.tags ?? ''}
              onChange={(e) => handleChange('tags', e.target.value)}
            />
          </FormField>

          <FormField label="Sales Message" hint='Short promotional message. Example: "Book now, save 20%!"'>
            <TextareaInput
              rows={2}
              placeholder='Book now and save 20%!'
              value={rates.salesMessages ?? ''}
              onChange={(e) => handleChange('salesMessages', e.target.value)}
            />
          </FormField>

          <FormField label="Terms & Conditions" hint="Legal copy shown on the booking confirmation.">
            <TextareaInput
              rows={3}
              placeholder="Conditions, restrictions, legal notes..."
              value={rates.terms ?? ''}
              onChange={(e) => handleChange('terms', e.target.value)}
            />
          </FormField>
        </div>
      </ConfigSection>
    </div>
  );
};
