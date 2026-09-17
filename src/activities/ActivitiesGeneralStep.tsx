import { useState } from 'react';
import { FormField, TextInput, TextareaInput, SelectInput } from '../components/ui/primitives';
import { ConfigSection } from '../components/ui/layout';
import { COUNTRY_STATES, COUNTRY_CITIES } from '../data/geo';
import { CURRENCIES } from '../data/currencies';

// Property details for OnActivities. This is a deliberately separate component
// from the hotel flow's GeneralInformationStep rather than a shared/refactored
// one: the hotel onboarding is not to be touched, and this version drops the
// lodging-specific parts (PMS / Channel Manager) and speaks about activities
// instead of rooms. The genuinely shared, product-neutral data — the country /
// state / city tables and the currency list — is imported, not copied.

const COUNTRIES = [
  'Antigua and Barbuda', 'Argentina', 'Australia', 'Austria', 'Bahamas', 'Barbados', 'Belgium',
  'Belize', 'Brazil', 'Cambodia', 'Canada', 'Chile', 'China', 'Colombia', 'Costa Rica', 'Croatia',
  'Cuba', 'Czech Republic', 'Denmark', 'Dominican Republic', 'Egypt', 'El Salvador', 'Finland',
  'France', 'Germany', 'Greece', 'Guatemala', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia',
  'Ireland', 'Italy', 'Jamaica', 'Japan', 'Kenya', 'Malaysia', 'Maldives', 'Malta', 'Mauritius',
  'Mexico', 'Morocco', 'Myanmar', 'Nepal', 'Netherlands', 'New Zealand', 'Norway', 'Panama', 'Peru',
  'Philippines', 'Poland', 'Portugal', 'Seychelles', 'Singapore', 'South Africa', 'South Korea',
  'Spain', 'Sri Lanka', 'Sweden', 'Switzerland', 'Tanzania', 'Thailand', 'Turkey',
  'Turks and Caicos', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Vietnam',
];

const TIMEZONES: { value: string; label: string }[] = [
  { value: 'Pacific/Honolulu', label: 'UTC−10 – Hawaii Time' },
  { value: 'America/Anchorage', label: 'UTC−9 – Alaska Time' },
  { value: 'America/Los_Angeles', label: 'UTC−8 – Pacific Time (US)' },
  { value: 'America/Denver', label: 'UTC−7 – Mountain Time (US)' },
  { value: 'America/Chicago', label: 'UTC−6 – Central Time (US)' },
  { value: 'America/New_York', label: 'UTC−5 – Eastern Time (US)' },
  { value: 'America/Santiago', label: 'UTC−4 – Chile Standard Time' },
  { value: 'America/Argentina/Buenos_Aires', label: 'UTC−3 – Argentina Time' },
  { value: 'America/Sao_Paulo', label: 'UTC−3 – Brasilia Time' },
  { value: 'Atlantic/Azores', label: 'UTC−1 – Azores Time' },
  { value: 'Europe/London', label: 'UTC±0 – Greenwich Mean Time' },
  { value: 'Europe/Lisbon', label: 'UTC±0 – Western European Time' },
  { value: 'Europe/Paris', label: 'UTC+1 – Central European Time' },
  { value: 'Europe/Copenhagen', label: 'UTC+1 – Central European Time (DK)' },
  { value: 'Europe/Madrid', label: 'UTC+1 – Central European Time (ES)' },
  { value: 'Europe/Berlin', label: 'UTC+1 – Central European Time (DE)' },
  { value: 'Europe/Rome', label: 'UTC+1 – Central European Time (IT)' },
  { value: 'Europe/Amsterdam', label: 'UTC+1 – Central European Time (NL)' },
  { value: 'Europe/Stockholm', label: 'UTC+1 – Central European Time (SE)' },
  { value: 'Europe/Oslo', label: 'UTC+1 – Central European Time (NO)' },
  { value: 'Europe/Zurich', label: 'UTC+1 – Central European Time (CH)' },
  { value: 'Europe/Athens', label: 'UTC+2 – Eastern European Time (GR)' },
  { value: 'Europe/Helsinki', label: 'UTC+2 – Eastern European Time (FI)' },
  { value: 'Europe/Istanbul', label: 'UTC+3 – Turkey Time' },
  { value: 'Asia/Dubai', label: 'UTC+4 – Gulf Standard Time' },
  { value: 'Asia/Kolkata', label: 'UTC+5:30 – India Standard Time' },
  { value: 'Asia/Jakarta', label: 'UTC+7 – Western Indonesia Time' },
  { value: 'Asia/Singapore', label: 'UTC+8 – Singapore Time' },
  { value: 'Asia/Tokyo', label: 'UTC+9 – Japan Standard Time' },
  { value: 'Australia/Sydney', label: 'UTC+10 – Australian Eastern Time' },
  { value: 'Pacific/Auckland', label: 'UTC+12 – New Zealand Time' },
];

const LANGUAGES: { value: string; label: string }[] = [
  { value: 'ar', label: 'Arabic (العربية)' }, { value: 'da', label: 'Danish (Dansk)' },
  { value: 'nl', label: 'Dutch (Nederlands)' }, { value: 'en', label: 'English' },
  { value: 'fi', label: 'Finnish (Suomi)' }, { value: 'fr', label: 'French (Français)' },
  { value: 'de', label: 'German (Deutsch)' }, { value: 'el', label: 'Greek (Ελληνικά)' },
  { value: 'it', label: 'Italian (Italiano)' }, { value: 'ja', label: 'Japanese (日本語)' },
  { value: 'no', label: 'Norwegian (Norsk)' }, { value: 'pl', label: 'Polish (Polski)' },
  { value: 'pt', label: 'Portuguese (Português)' }, { value: 'ru', label: 'Russian (Русский)' },
  { value: 'es', label: 'Spanish (Español)' }, { value: 'sv', label: 'Swedish (Svenska)' },
  { value: 'tr', label: 'Turkish (Türkçe)' }, { value: 'zh', label: 'Chinese (中文)' },
];

export type ActivitiesGeneralPrefill = Record<string, string | null | undefined>;

// Select with known options + an "Add Manually" escape hatch; falls back to a
// plain text input when the selected country has no list.
function GeoField({
  name, label, options, value, manualValue, isManual,
  onSelect, onManualChange, onBackToList, placeholder,
}: {
  name: string;
  label: string;
  options: string[];
  value: string;
  manualValue: string;
  isManual: boolean;
  onSelect: (v: string) => void;
  onManualChange: (v: string) => void;
  onBackToList: () => void;
  placeholder: string;
}) {
  if (options.length === 0) {
    return <TextInput name={name} placeholder={placeholder} value={manualValue} onChange={e => onManualChange(e.target.value)} />;
  }
  if (isManual) {
    return (
      <div className="flex flex-col gap-1">
        <TextInput
          name={name}
          placeholder={`Enter ${label.toLowerCase()}...`}
          value={manualValue}
          onChange={e => onManualChange(e.target.value)}
          autoFocus
        />
        <button
          type="button"
          onClick={onBackToList}
          className="text-xs text-primary underline text-left hover:opacity-70 transition-opacity"
        >
          ← Back to list
        </button>
      </div>
    );
  }
  return (
    <SelectInput
      name={name}
      value={value}
      onChange={e => onSelect(e.target.value === '__manual__' ? '__trigger_manual__' : e.target.value)}
    >
      <option value="">Select {label}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
      <option disabled value="">──────────</option>
      <option value="__manual__">＋ Add Manually</option>
    </SelectInput>
  );
}

export const ActivitiesGeneralStep = ({ prefill = {} }: { prefill?: ActivitiesGeneralPrefill }) => {
  const initCountry = prefill.country ?? '';
  const initState = prefill.stateProvince ?? '';
  const initCity = prefill.city ?? '';

  const initCountryManual = initCountry !== '' && !COUNTRIES.includes(initCountry);
  const initStateOpts = COUNTRY_STATES[initCountry] ?? [];
  const initCityOpts = COUNTRY_CITIES[initCountry] ?? [];
  // A value that isn't in the country's list (including countries with no list
  // at all) is treated as manual, so it lands in manualState/manualCity — which
  // is what GeoField renders in both the manual and no-options branches. Without
  // this, remounting the step (going back and forward) would blank the field.
  const initStateManual = initState !== '' && !initStateOpts.includes(initState);
  const initCityManual = initCity !== '' && !initCityOpts.includes(initCity);

  const [country, setCountry] = useState(initCountryManual ? '' : initCountry);
  const [countryManual, setCountryManual] = useState(initCountryManual);
  const [manualCountry, setManualCountry] = useState(initCountryManual ? initCountry : '');
  const [stateVal, setStateVal] = useState(initStateManual ? '' : initState);
  const [cityVal, setCityVal] = useState(initCityManual ? '' : initCity);
  const [stateManual, setStateManual] = useState(initStateManual);
  const [cityManual, setCityManual] = useState(initCityManual);
  const [manualState, setManualState] = useState(initStateManual ? initState : '');
  const [manualCity, setManualCity] = useState(initCityManual ? initCity : '');

  const stateOptions = COUNTRY_STATES[country] ?? [];
  const cityOptions = COUNTRY_CITIES[country] ?? [];

  const handleCountryChange = (val: string) => {
    if (val === '__manual__') { setCountryManual(true); setCountry(''); }
    else setCountry(val);
    setStateVal(''); setCityVal('');
    setStateManual(false); setCityManual(false);
    setManualState(''); setManualCity('');
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
      <div className="mb-4 shrink-0">
        <h1 className="font-display-lg text-xl text-primary font-bold">General Information</h1>
        <p className="text-on-surface-variant text-xs">
          Core details about your property, contact info, and locale settings.
        </p>
      </div>
      <form id="form-general" onSubmit={(e) => e.preventDefault()}>
        <ConfigSection
          title="Property Details"
          description="Tell us who you are, where you operate, and which regional settings your bookings should use."
          icon="storefront"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <FormField label="Property Name" required className="col-span-2">
              <TextInput name="propertyName" placeholder="Patagonia Adventure Tours" defaultValue={prefill.propertyName ?? ''} key={prefill.propertyName} />
            </FormField>

            <FormField label="Description" required className="col-span-2">
              <TextareaInput name="description" rows={3} placeholder="A brief description of what your business offers..." defaultValue={prefill.description ?? ''} key={prefill.description} />
            </FormField>

            <FormField label="Address" required className="col-span-2">
              <TextInput name="address" placeholder="Av. San Martín 1234" defaultValue={prefill.address ?? ''} key={prefill.address} />
            </FormField>

            <FormField label="Country" required>
              {countryManual ? (
                <div className="flex flex-col gap-1">
                  <TextInput
                    name="country"
                    placeholder="Enter country..."
                    value={manualCountry}
                    onChange={e => setManualCountry(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => { setCountryManual(false); setCountry(''); setManualCountry(''); }}
                    className="text-xs text-primary underline text-left hover:opacity-70 transition-opacity"
                  >
                    ← Back to list
                  </button>
                </div>
              ) : (
                <SelectInput name="country" value={country} onChange={e => handleCountryChange(e.target.value)}>
                  <option value="">Select Country</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  <option disabled value="">──────────</option>
                  <option value="__manual__">＋ Add Manually</option>
                </SelectInput>
              )}
            </FormField>

            <FormField label="ZIP / Postal Code" required>
              <TextInput name="zipCode" placeholder="8400" defaultValue={prefill.zipCode ?? ''} key={prefill.zipCode} />
            </FormField>

            <FormField label="City" required>
              <GeoField
                name="city"
                label="City"
                options={cityOptions}
                value={cityVal}
                manualValue={manualCity}
                isManual={cityManual}
                onSelect={(v) => { if (v === '__trigger_manual__') { setCityManual(true); setCityVal(''); } else setCityVal(v); }}
                onManualChange={setManualCity}
                onBackToList={() => { setCityManual(false); setCityVal(''); setManualCity(''); }}
                placeholder="Bariloche"
              />
            </FormField>

            <FormField label="State / Province" required>
              <GeoField
                name="stateProvince"
                label="State / Province"
                options={stateOptions}
                value={stateVal}
                manualValue={manualState}
                isManual={stateManual}
                onSelect={(v) => { if (v === '__trigger_manual__') { setStateManual(true); setStateVal(''); } else setStateVal(v); }}
                onManualChange={setManualState}
                onBackToList={() => { setStateManual(false); setStateVal(''); setManualState(''); }}
                placeholder="Río Negro"
              />
            </FormField>

            <FormField label="Timezone" required>
              <SelectInput name="timezone" defaultValue={prefill.timezone ?? ''} key={prefill.timezone}>
                <option value="">Select Timezone</option>
                {TIMEZONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </SelectInput>
            </FormField>

            <FormField label="Currency" required>
              <SelectInput name="currency" defaultValue={prefill.currency ?? ''} key={prefill.currency}>
                <option value="">Select Currency</option>
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
              </SelectInput>
            </FormField>

            <FormField label="Language" required>
              <SelectInput name="language" defaultValue={prefill.language ?? ''} key={prefill.language}>
                <option value="">Select Language</option>
                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </SelectInput>
            </FormField>

            <FormField label="Date Format" required>
              <SelectInput name="dateFormat" defaultValue={prefill.dateFormat ?? ''} key={prefill.dateFormat}>
                <option value="">Select Format</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </SelectInput>
            </FormField>

            <FormField label="Phone Number" required>
              <TextInput name="phone" type="tel" placeholder="+54 9 294 000 0000" defaultValue={prefill.phone ?? ''} key={prefill.phone} />
            </FormField>

            <FormField label="Notification Email" required>
              <TextInput name="notificationEmail" type="email" placeholder="bookings@yourbusiness.com" defaultValue={prefill.notificationEmail ?? ''} key={prefill.notificationEmail} />
            </FormField>

            <FormField label="Website URL" required className="col-span-2">
              <TextInput name="websiteUrl" type="url" placeholder="https://www.yourbusiness.com" defaultValue={prefill.websiteUrl ?? ''} key={prefill.websiteUrl} />
            </FormField>

            <FormField
              label="Terms & Conditions"
              required
              className="col-span-2"
              hint="General terms that apply to your business. Terms specific to one activity go on that activity."
            >
              <TextareaInput
                name="termsConditions"
                rows={4}
                placeholder="Enter your general terms and conditions..."
                defaultValue={prefill.termsConditions ?? ''}
                key={prefill.termsConditions}
              />
            </FormField>
          </div>
        </ConfigSection>
      </form>
    </div>
  );
};
