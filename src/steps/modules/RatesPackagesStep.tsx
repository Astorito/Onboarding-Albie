import { useState, type Dispatch, type SetStateAction } from 'react';
import { Icon, FormField, TextInput, TextareaInput, SelectInput } from '../../components/ui/primitives';

export type RatesData = Record<string, string>;

interface Props {
  rates: RatesData;
  setRates: Dispatch<SetStateAction<RatesData>>;
}

export const RatesPackagesStep = ({ rates, setRates }: Props) => {
  const [activeTab, setActiveTab] = useState('create');

  const tabs = [
    { id: 'create', label: 'Create Rate', icon: 'add_circle' },
    { id: 'visibility', label: 'Visibility', icon: 'visibility' },
    { id: 'descriptions', label: 'Descriptions', icon: 'description' },
    { id: 'images', label: 'Images', icon: 'image' },
    { id: 'tags', label: 'Tags & Messages', icon: 'label' },
  ];

  const handleChange = (field: string, value: string) =>
    setRates((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
      <div className="mb-4 shrink-0">
        <h1 className="font-display-lg text-xl text-primary font-bold">Rates & Packages</h1>
        <p className="text-on-surface-variant text-xs">
          Configure pricing rules, rate groups, and promotional packages.
        </p>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 custom-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-white border border-outline-variant text-on-surface-variant hover:border-primary'
            }`}
          >
            <Icon name={t.icon} className="text-sm" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <FormField label="Rate Group" required>
              <SelectInput
                value={rates.rateGroup ?? ''}
                onChange={(e) => handleChange('rateGroup', e.target.value)}
              >
                <option value="">Select or create group</option>
                <option>Leisure</option>
                <option>Business</option>
                <option>Corporate</option>
                <option>Promotions</option>
              </SelectInput>
            </FormField>

            <FormField label="Parent Rate">
              <SelectInput
                value={rates.parentRate ?? ''}
                onChange={(e) => handleChange('parentRate', e.target.value)}
              >
                <option>None (standalone rate)</option>
                <option>Best Available Rate</option>
              </SelectInput>
            </FormField>

            <FormField label="Linked Rates" className="col-span-2">
              <TextInput
                placeholder="Search and link existing rates..."
                value={rates.linkedRates ?? ''}
                onChange={(e) => handleChange('linkedRates', e.target.value)}
              />
            </FormField>

            <FormField label="Attach Add-Ons to Rate" className="col-span-2">
              <TextInput
                placeholder="Search add-ons to attach to this rate..."
                value={rates.attachedAddons ?? ''}
                onChange={(e) => handleChange('attachedAddons', e.target.value)}
              />
            </FormField>

            <FormField label="Experiences" className="col-span-2">
              <TextInput
                placeholder="Search experiences to include in this rate..."
                value={rates.experiences ?? ''}
                onChange={(e) => handleChange('experiences', e.target.value)}
              />
            </FormField>

            <div className="col-span-2 p-4 bg-secondary-container/30 rounded-xl flex items-start gap-3">
              <Icon name="auto_awesome" className="text-secondary text-lg shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-primary text-xs mb-1">Package Builder</p>
                <p className="text-[11px] text-on-surface-variant">
                  Combine a base rate with add-ons and experiences to create a promotional package
                  with a bundled price.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'visibility' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
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

            <FormField label="Order Index">
              <TextInput
                type="number"
                placeholder="1"
                value={rates.orderIndex ?? ''}
                onChange={(e) => handleChange('orderIndex', e.target.value)}
              />
            </FormField>

            <FormField label="Availability From" required>
              <TextInput
                type="date"
                value={rates.availFrom ?? ''}
                onChange={(e) => handleChange('availFrom', e.target.value)}
              />
            </FormField>

            <FormField label="Availability To" required>
              <TextInput
                type="date"
                value={rates.availTo ?? ''}
                onChange={(e) => handleChange('availTo', e.target.value)}
              />
            </FormField>
          </div>
        )}

        {activeTab === 'descriptions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <FormField label="Rate Code" required>
              <TextInput
                placeholder="BAR-2025"
                value={rates.rateCode ?? ''}
                onChange={(e) => handleChange('rateCode', e.target.value)}
              />
            </FormField>

            <FormField label="Assign Rate Group" required>
              <SelectInput
                value={rates.descRateGroup ?? ''}
                onChange={(e) => handleChange('descRateGroup', e.target.value)}
              >
                <option value="">Select group</option>
                <option>Leisure</option>
                <option>Business</option>
                <option>Promotions</option>
              </SelectInput>
            </FormField>

            <FormField label="Short Title" required>
              <TextInput
                placeholder="Best Available Rate"
                value={rates.shortTitle ?? ''}
                onChange={(e) => handleChange('shortTitle', e.target.value)}
              />
            </FormField>

            <FormField label="Long Title" required>
              <TextInput
                placeholder="Best Available Rate – Flexible Booking"
                value={rates.longTitle ?? ''}
                onChange={(e) => handleChange('longTitle', e.target.value)}
              />
            </FormField>

            <FormField label="Rate Description" required className="col-span-2">
              <TextareaInput
                rows={3}
                placeholder="Describe what this rate includes..."
                value={rates.description ?? ''}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </FormField>

            <FormField label="Terms & Conditions" className="col-span-2">
              <TextareaInput
                rows={3}
                placeholder="Conditions, restrictions, and legal notes..."
                value={rates.terms ?? ''}
                onChange={(e) => handleChange('terms', e.target.value)}
              />
            </FormField>
          </div>
        )}

        {activeTab === 'images' && (
          <FormField label="Rate Images">
            <label className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-outline-variant rounded-xl cursor-pointer hover:border-primary transition-colors group">
              <Icon name="add_photo_alternate" className="text-4xl text-primary/40 group-hover:text-primary mb-2" />
              <span className="text-sm text-on-surface-variant font-bold">Upload Rate Images</span>
              <span className="text-xs text-on-surface-variant">JPG, PNG up to 5MB each</span>
              <input type="file" className="hidden" accept="image/*" multiple />
            </label>
          </FormField>
        )}

        {activeTab === 'tags' && (
          <div className="space-y-4">
            <FormField label="Tags">
              <TextInput
                placeholder="e.g. summer, promotion, non-refundable..."
                value={rates.tags ?? ''}
                onChange={(e) => handleChange('tags', e.target.value)}
              />
              <p className="text-[10px] text-on-surface-variant mt-1">
                Add existing or custom tags separated by commas.
              </p>
            </FormField>
            <FormField label="Sales Messages">
              <TextareaInput
                rows={3}
                placeholder='Create a promotional message, e.g. "Book now and save 20%!"'
                value={rates.salesMessages ?? ''}
                onChange={(e) => handleChange('salesMessages', e.target.value)}
              />
            </FormField>
          </div>
        )}
      </div>
    </div>
  );
};
