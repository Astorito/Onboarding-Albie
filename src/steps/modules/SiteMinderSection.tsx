import type { Dispatch, SetStateAction } from 'react';
import { FormField, TextInput } from '../../components/ui/primitives';
import { ConfigSection, AddItemButton } from '../../components/ui/layout';

export interface SiteMinderSite {
  id: number;
  bookingSite: string;
  hotelCode: string; // Hotel Code / Property ID
  rates: string;
  rateMultiplier: string;
  myChannel: boolean;
  mapped: boolean;
  enabled: boolean;
}

export interface SiteMinderData {
  connect: boolean;
  sites: SiteMinderSite[];
}

export const DEFAULT_SITEMINDER: SiteMinderData = { connect: false, sites: [] };

const emptySite = (): SiteMinderSite => ({
  id: Date.now() + Math.random(),
  bookingSite: '',
  hotelCode: '',
  rates: '',
  rateMultiplier: '',
  myChannel: false,
  mapped: false,
  enabled: false,
});

interface Props {
  data: SiteMinderData;
  setData: Dispatch<SetStateAction<SiteMinderData>>;
}

const YesNoToggle = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex flex-col gap-1.5">
    <span className="font-bold text-primary text-[10px] uppercase tracking-wider">{label}</span>
    <div className="flex rounded-lg border border-outline-variant overflow-hidden w-fit">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`px-3 py-1.5 text-xs font-bold cursor-pointer transition-all ${
          value ? 'bg-primary text-white' : 'bg-white text-on-surface-variant hover:bg-surface-container-low'
        }`}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`px-3 py-1.5 text-xs font-bold cursor-pointer transition-all border-l border-outline-variant ${
          !value ? 'bg-primary text-white' : 'bg-white text-on-surface-variant hover:bg-surface-container-low'
        }`}
      >
        No
      </button>
    </div>
  </div>
);

export const SiteMinderSection = ({ data, setData }: Props) => {
  const setConnect = (connect: boolean) => setData((prev) => ({ ...prev, connect }));

  const addSite = () =>
    setData((prev) => ({ ...prev, sites: [...prev.sites, emptySite()] }));

  const removeSite = (id: number) =>
    setData((prev) => ({ ...prev, sites: prev.sites.filter((s) => s.id !== id) }));

  const updateSite = (id: number, patch: Partial<SiteMinderSite>) =>
    setData((prev) => ({
      ...prev,
      sites: prev.sites.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));

  return (
    <ConfigSection
      title="SiteMinder Integration"
      description="Tell us if this property connects to SiteMinder, so we can configure the right channel setup."
      icon="hub"
    >
      <div className="flex items-center justify-between gap-4 mb-2">
        <p className="font-bold text-primary text-sm">Are you going to connect to SiteMinder?</p>
        <div className="flex rounded-lg border border-outline-variant overflow-hidden shrink-0">
          <button
            type="button"
            onClick={() => setConnect(true)}
            className={`px-4 py-2 text-xs font-bold cursor-pointer transition-all ${
              data.connect ? 'bg-primary text-white' : 'bg-white text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setConnect(false)}
            className={`px-4 py-2 text-xs font-bold cursor-pointer transition-all border-l border-outline-variant ${
              !data.connect ? 'bg-primary text-white' : 'bg-white text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            No
          </button>
        </div>
      </div>

      {data.connect && (
        <div className="space-y-3 mt-3">
          {data.sites.map((site) => (
            <div key={site.id} className="p-4 border border-outline-variant rounded-xl bg-surface-container-low/30 relative">
              <button
                type="button"
                onClick={() => removeSite(site.id)}
                aria-label="Remove booking site"
                className="absolute top-3 right-3 text-on-surface-variant hover:text-red-600 cursor-pointer text-sm"
              >
                ✕
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-6">
                <FormField label="Booking Site">
                  <TextInput
                    placeholder="Booking.com"
                    value={site.bookingSite}
                    onChange={(e) => updateSite(site.id, { bookingSite: e.target.value })}
                  />
                </FormField>
                <FormField label="Hotel Code / Property ID">
                  <TextInput
                    placeholder="HTL-001"
                    value={site.hotelCode}
                    onChange={(e) => updateSite(site.id, { hotelCode: e.target.value })}
                  />
                </FormField>
                <FormField label="Rates">
                  <TextInput
                    placeholder="Standard Rate"
                    value={site.rates}
                    onChange={(e) => updateSite(site.id, { rates: e.target.value })}
                  />
                </FormField>
                <FormField label="Rate Multiplier">
                  <TextInput
                    placeholder="1.0"
                    value={site.rateMultiplier}
                    onChange={(e) => updateSite(site.id, { rateMultiplier: e.target.value })}
                  />
                </FormField>
              </div>
              <div className="flex flex-wrap gap-6 mt-4">
                <YesNoToggle
                  label="My Channel"
                  value={site.myChannel}
                  onChange={(v) => updateSite(site.id, { myChannel: v })}
                />
                <YesNoToggle
                  label="Mapped"
                  value={site.mapped}
                  onChange={(v) => updateSite(site.id, { mapped: v })}
                />
                <YesNoToggle
                  label="Enabled"
                  value={site.enabled}
                  onChange={(v) => updateSite(site.id, { enabled: v })}
                />
              </div>
            </div>
          ))}
          <AddItemButton label="Add Booking Site" onClick={addSite} />
        </div>
      )}
    </ConfigSection>
  );
};
