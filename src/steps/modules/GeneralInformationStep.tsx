import { useState } from 'react';
import { FormField, TextInput, TextareaInput, SelectInput } from '../../components/ui/primitives';
import { ConfigSection } from '../../components/ui/layout';
import { StepPrefill } from '../../types';
import { COUNTRY_STATES, COUNTRY_CITIES } from '../../data/geo';

// Smart field: shows a select with options + "Add Manually", or a text input in manual mode.
// Falls back to plain text input when the country has no known options.
function GeoField({
  name,
  label,
  options,
  value,
  manualValue,
  isManual,
  onSelect,
  onManualChange,
  onBackToList,
  placeholder,
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
    // No data for this country — plain text input
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
      onChange={e => {
        if (e.target.value === '__manual__') onSelect('__trigger_manual__');
        else onSelect(e.target.value);
      }}
    >
      <option value="">Select {label}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
      <option disabled value="">──────────</option>
      <option value="__manual__">＋ Add Manually</option>
    </SelectInput>
  );
}

export const GeneralInformationStep = ({ prefill = {} }: { prefill?: StepPrefill }) => {
  const initCountry = prefill.country ?? '';
  const initState   = prefill.stateProvince ?? '';
  const initCity    = prefill.city ?? '';

  // Determine initial modes based on whether prefill values are in the known lists
  const KNOWN_COUNTRIES = ['Antigua and Barbuda','Argentina','Australia','Austria','Bahamas','Barbados','Belgium','Belize','Brazil','Cambodia','Canada','Chile','China','Colombia','Costa Rica','Croatia','Cuba','Czech Republic','Denmark','Dominican Republic','Egypt','El Salvador','Finland','France','Germany','Greece','Guatemala','Honduras','Hungary','Iceland','India','Indonesia','Ireland','Italy','Jamaica','Japan','Kenya','Malaysia','Maldives','Malta','Mauritius','Mexico','Morocco','Myanmar','Nepal','Netherlands','New Zealand','Norway','Panama','Peru','Philippines','Poland','Portugal','Seychelles','Singapore','South Africa','South Korea','Spain','Sri Lanka','Sweden','Switzerland','Tanzania','Thailand','Turkey','Turks and Caicos','United Arab Emirates','United Kingdom','United States','Uruguay','Vietnam'];
  const initCountryManual = initCountry !== '' && !KNOWN_COUNTRIES.includes(initCountry);

  const initStateOpts = COUNTRY_STATES[initCountry] ?? [];
  const initCityOpts  = COUNTRY_CITIES[initCountry] ?? [];
  const initStateManual = initState !== '' && initStateOpts.length > 0 && !initStateOpts.includes(initState);
  const initCityManual  = initCity  !== '' && initCityOpts.length  > 0 && !initCityOpts.includes(initCity);

  const [country,       setCountry]       = useState(initCountryManual ? '' : initCountry);
  const [countryManual, setCountryManual] = useState(initCountryManual);
  const [manualCountry, setManualCountry] = useState(initCountryManual ? initCountry : '');
  const [stateVal,      setStateVal]      = useState(initStateManual ? '' : initState);
  const [cityVal,       setCityVal]       = useState(initCityManual  ? '' : initCity);
  const [stateManual,   setStateManual]   = useState(initStateManual);
  const [cityManual,    setCityManual]    = useState(initCityManual);
  const [manualState,   setManualState]   = useState(initStateManual ? initState : '');
  const [manualCity,    setManualCity]    = useState(initCityManual  ? initCity  : '');

  const stateOptions = COUNTRY_STATES[country] ?? [];
  const cityOptions  = COUNTRY_CITIES[country] ?? [];

  const handleCountryChange = (val: string) => {
    if (val === '__manual__') {
      setCountryManual(true);
      setCountry('');
    } else {
      setCountry(val);
    }
    // Reset state and city when country changes
    setStateVal(''); setCityVal('');
    setStateManual(false); setCityManual(false);
    setManualState(''); setManualCity('');
  };

  const handleStateSelect = (val: string) => {
    if (val === '__trigger_manual__') { setStateManual(true); setStateVal(''); }
    else setStateVal(val);
  };

  const handleCitySelect = (val: string) => {
    if (val === '__trigger_manual__') { setCityManual(true); setCityVal(''); }
    else setCityVal(val);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
      <div className="mb-4 shrink-0">
        <h1 className="font-display-lg text-xl text-primary font-bold">General Information</h1>
        <p className="text-on-surface-variant text-xs">
          Core property details, contact info, and locale settings.
        </p>
      </div>
      <form id="form-general" onSubmit={(e) => e.preventDefault()}>
        <ConfigSection
          title="Property Details"
          description="Provide general information, contact details, and regional preferences for your property."
          icon="apartment"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <FormField label="Property Name" required className="col-span-2">
              <TextInput name="propertyName" placeholder="The Grand Pavilion Hotel" defaultValue={prefill.propertyName ?? ''} key={prefill.propertyName} />
            </FormField>

            <FormField label="Property Description" required className="col-span-2">
              <TextareaInput name="description" rows={3} placeholder="A brief description of your property..." defaultValue={prefill.description ?? ''} key={prefill.description} />
            </FormField>

            <FormField label="Address" required className="col-span-2">
              <TextInput name="address" placeholder="Bredgade 34" defaultValue={prefill.address ?? ''} key={prefill.address} />
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
              <SelectInput
                name="country"
                value={country}
                onChange={e => handleCountryChange(e.target.value)}
              >
                <option value="">Select Country</option>
                <option value="Antigua and Barbuda">Antigua and Barbuda</option>
                <option value="Argentina">Argentina</option>
                <option value="Australia">Australia</option>
                <option value="Austria">Austria</option>
                <option value="Bahamas">Bahamas</option>
                <option value="Barbados">Barbados</option>
                <option value="Belgium">Belgium</option>
                <option value="Belize">Belize</option>
                <option value="Brazil">Brazil</option>
                <option value="Cambodia">Cambodia</option>
                <option value="Canada">Canada</option>
                <option value="Chile">Chile</option>
                <option value="China">China</option>
                <option value="Colombia">Colombia</option>
                <option value="Costa Rica">Costa Rica</option>
                <option value="Croatia">Croatia</option>
                <option value="Cuba">Cuba</option>
                <option value="Czech Republic">Czech Republic</option>
                <option value="Denmark">Denmark</option>
                <option value="Dominican Republic">Dominican Republic</option>
                <option value="Egypt">Egypt</option>
                <option value="El Salvador">El Salvador</option>
                <option value="Finland">Finland</option>
                <option value="France">France</option>
                <option value="Germany">Germany</option>
                <option value="Greece">Greece</option>
                <option value="Guatemala">Guatemala</option>
                <option value="Honduras">Honduras</option>
                <option value="Hungary">Hungary</option>
                <option value="Iceland">Iceland</option>
                <option value="India">India</option>
                <option value="Indonesia">Indonesia</option>
                <option value="Ireland">Ireland</option>
                <option value="Italy">Italy</option>
                <option value="Jamaica">Jamaica</option>
                <option value="Japan">Japan</option>
                <option value="Kenya">Kenya</option>
                <option value="Malaysia">Malaysia</option>
                <option value="Maldives">Maldives</option>
                <option value="Malta">Malta</option>
                <option value="Mauritius">Mauritius</option>
                <option value="Mexico">Mexico</option>
                <option value="Morocco">Morocco</option>
                <option value="Myanmar">Myanmar</option>
                <option value="Nepal">Nepal</option>
                <option value="Netherlands">Netherlands</option>
                <option value="New Zealand">New Zealand</option>
                <option value="Norway">Norway</option>
                <option value="Panama">Panama</option>
                <option value="Peru">Peru</option>
                <option value="Philippines">Philippines</option>
                <option value="Poland">Poland</option>
                <option value="Portugal">Portugal</option>
                <option value="Seychelles">Seychelles</option>
                <option value="Singapore">Singapore</option>
                <option value="South Africa">South Africa</option>
                <option value="South Korea">South Korea</option>
                <option value="Spain">Spain</option>
                <option value="Sri Lanka">Sri Lanka</option>
                <option value="Sweden">Sweden</option>
                <option value="Switzerland">Switzerland</option>
                <option value="Tanzania">Tanzania</option>
                <option value="Thailand">Thailand</option>
                <option value="Turkey">Turkey</option>
                <option value="Turks and Caicos">Turks and Caicos</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="United States">United States</option>
                <option value="Uruguay">Uruguay</option>
                <option value="Vietnam">Vietnam</option>
                <option disabled value="">──────────</option>
                <option value="__manual__">＋ Add Manually</option>
              </SelectInput>
              )}
            </FormField>

            <FormField label="ZIP / Postal Code" required>
              <TextInput name="zipCode" placeholder="1260" defaultValue={prefill.zipCode ?? ''} key={prefill.zipCode} />
            </FormField>

            <FormField label="City" required>
              <GeoField
                name="city"
                label="City"
                options={cityOptions}
                value={cityVal}
                manualValue={manualCity}
                isManual={cityManual}
                onSelect={handleCitySelect}
                onManualChange={setManualCity}
                onBackToList={() => { setCityManual(false); setCityVal(''); setManualCity(''); }}
                placeholder="Copenhagen"
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
                onSelect={handleStateSelect}
                onManualChange={setManualState}
                onBackToList={() => { setStateManual(false); setStateVal(''); setManualState(''); }}
                placeholder="Capital Region"
              />
            </FormField>

            <FormField label="Timezone" required>
              <SelectInput name="timezone" defaultValue={prefill.timezone ?? ''} key={prefill.timezone}>
                <option value="">Select Timezone</option>
                <option value="Pacific/Honolulu">UTC−10 – Hawaii Time</option>
                <option value="America/Anchorage">UTC−9 – Alaska Time</option>
                <option value="America/Los_Angeles">UTC−8 – Pacific Time (US)</option>
                <option value="America/Denver">UTC−7 – Mountain Time (US)</option>
                <option value="America/Chicago">UTC−6 – Central Time (US)</option>
                <option value="America/New_York">UTC−5 – Eastern Time (US)</option>
                <option value="America/Santiago">UTC−4 – Chile Standard Time</option>
                <option value="America/Argentina/Buenos_Aires">UTC−3 – Argentina Time</option>
                <option value="America/Sao_Paulo">UTC−3 – Brasilia Time</option>
                <option value="Atlantic/Azores">UTC−1 – Azores Time</option>
                <option value="Europe/London">UTC±0 – Greenwich Mean Time</option>
                <option value="Europe/Lisbon">UTC±0 – Western European Time</option>
                <option value="Europe/Paris">UTC+1 – Central European Time</option>
                <option value="Europe/Copenhagen">UTC+1 – Central European Time (DK)</option>
                <option value="Europe/Madrid">UTC+1 – Central European Time (ES)</option>
                <option value="Europe/Berlin">UTC+1 – Central European Time (DE)</option>
                <option value="Europe/Rome">UTC+1 – Central European Time (IT)</option>
                <option value="Europe/Amsterdam">UTC+1 – Central European Time (NL)</option>
                <option value="Europe/Stockholm">UTC+1 – Central European Time (SE)</option>
                <option value="Europe/Oslo">UTC+1 – Central European Time (NO)</option>
                <option value="Europe/Zurich">UTC+1 – Central European Time (CH)</option>
                <option value="Europe/Athens">UTC+2 – Eastern European Time (GR)</option>
                <option value="Europe/Helsinki">UTC+2 – Eastern European Time (FI)</option>
                <option value="Europe/Istanbul">UTC+3 – Turkey Time</option>
                <option value="Asia/Dubai">UTC+4 – Gulf Standard Time</option>
                <option value="Asia/Kolkata">UTC+5:30 – India Standard Time</option>
                <option value="Asia/Jakarta">UTC+7 – Western Indonesia Time</option>
                <option value="Asia/Singapore">UTC+8 – Singapore Time</option>
                <option value="Asia/Tokyo">UTC+9 – Japan Standard Time</option>
                <option value="Australia/Sydney">UTC+10 – Australian Eastern Time</option>
                <option value="Pacific/Auckland">UTC+12 – New Zealand Time</option>
              </SelectInput>
            </FormField>

            <FormField label="Currency" required>
              <SelectInput name="currency" defaultValue={prefill.currency ?? ''} key={prefill.currency}>
                <option value="">Select Currency</option>
                <option value="AED">AED – UAE Dirham (د.إ)</option>
                <option value="ARS">ARS – Argentine Peso ($)</option>
                <option value="AUD">AUD – Australian Dollar ($)</option>
                <option value="BRL">BRL – Brazilian Real (R$)</option>
                <option value="CAD">CAD – Canadian Dollar ($)</option>
                <option value="CHF">CHF – Swiss Franc (Fr)</option>
                <option value="CLP">CLP – Chilean Peso ($)</option>
                <option value="COP">COP – Colombian Peso ($)</option>
                <option value="CRC">CRC – Costa Rican Colón (₡)</option>
                <option value="DKK">DKK – Danish Krone (kr)</option>
                <option value="EUR">EUR – Euro (€)</option>
                <option value="GBP">GBP – British Pound (£)</option>
                <option value="IDR">IDR – Indonesian Rupiah (Rp)</option>
                <option value="JPY">JPY – Japanese Yen (¥)</option>
                <option value="MXN">MXN – Mexican Peso ($)</option>
                <option value="NOK">NOK – Norwegian Krone (kr)</option>
                <option value="NZD">NZD – New Zealand Dollar ($)</option>
                <option value="PEN">PEN – Peruvian Sol (S/)</option>
                <option value="PLN">PLN – Polish Złoty (zł)</option>
                <option value="SCR">SCR – Seychellois Rupee (₨)</option>
                <option value="SEK">SEK – Swedish Krona (kr)</option>
                <option value="SGD">SGD – Singapore Dollar ($)</option>
                <option value="THB">THB – Thai Baht (฿)</option>
                <option value="TRY">TRY – Turkish Lira (₺)</option>
                <option value="USD">USD – US Dollar ($)</option>
                <option value="UYU">UYU – Uruguayan Peso ($U)</option>
                <option value="VND">VND – Vietnamese Dong (₫)</option>
                <option value="ZAR">ZAR – South African Rand (R)</option>
              </SelectInput>
            </FormField>

            <FormField label="Language" required>
              <SelectInput name="language" defaultValue={prefill.language ?? ''} key={prefill.language}>
                <option value="">Select Language</option>
                <option value="ar">Arabic (العربية)</option>
                <option value="da">Danish (Dansk)</option>
                <option value="nl">Dutch (Nederlands)</option>
                <option value="en">English</option>
                <option value="fi">Finnish (Suomi)</option>
                <option value="fr">French (Français)</option>
                <option value="de">German (Deutsch)</option>
                <option value="el">Greek (Ελληνικά)</option>
                <option value="it">Italian (Italiano)</option>
                <option value="ja">Japanese (日本語)</option>
                <option value="no">Norwegian (Norsk)</option>
                <option value="pl">Polish (Polski)</option>
                <option value="pt">Portuguese (Português)</option>
                <option value="ru">Russian (Русский)</option>
                <option value="es">Spanish (Español)</option>
                <option value="sv">Swedish (Svenska)</option>
                <option value="tr">Turkish (Türkçe)</option>
                <option value="zh">Chinese (中文)</option>
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
              <TextInput name="phone" type="tel" placeholder="+45 000 000 000" defaultValue={prefill.phone ?? ''} key={prefill.phone} />
            </FormField>

            <FormField label="Notification Email" required>
              <TextInput name="notificationEmail" type="email" placeholder="reservations@yourhotel.com" defaultValue={prefill.notificationEmail ?? ''} key={prefill.notificationEmail} />
            </FormField>

            <FormField label="Website URL" required className="col-span-2">
              <TextInput name="websiteUrl" type="url" placeholder="https://www.yourhotel.com" defaultValue={prefill.websiteUrl ?? ''} key={prefill.websiteUrl} />
            </FormField>

            <FormField label="Property Terms & Conditions" required className="col-span-2">
              <TextareaInput
                name="termsConditions"
                rows={4}
                placeholder="Enter your property's full terms and conditions..."
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
