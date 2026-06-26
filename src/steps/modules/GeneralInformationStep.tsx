import { FormField, TextInput, TextareaInput, SelectInput } from '../../components/ui/primitives';
import { ConfigSection } from '../../components/ui/layout';
import { StepPrefill } from '../../types';

export const GeneralInformationStep = ({ prefill = {} }: { prefill?: StepPrefill }) => (
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

          <FormField label="City" required>
            <TextInput name="city" placeholder="Copenhagen" defaultValue={prefill.city ?? ''} key={prefill.city} />
          </FormField>

          <FormField label="State / Province" required>
            <TextInput name="stateProvince" placeholder="Capital Region" defaultValue={prefill.stateProvince ?? ''} key={prefill.stateProvince} />
          </FormField>

          <FormField label="Country" required>
            <SelectInput name="country" defaultValue={prefill.country ?? ''} key={prefill.country}>
              <option value="">Select Country</option>
              <option value="Argentina">Argentina</option>
              <option value="Australia">Australia</option>
              <option value="Austria">Austria</option>
              <option value="Belgium">Belgium</option>
              <option value="Brazil">Brazil</option>
              <option value="Canada">Canada</option>
              <option value="Chile">Chile</option>
              <option value="Colombia">Colombia</option>
              <option value="Costa Rica">Costa Rica</option>
              <option value="Denmark">Denmark</option>
              <option value="Finland">Finland</option>
              <option value="France">France</option>
              <option value="Germany">Germany</option>
              <option value="Greece">Greece</option>
              <option value="Indonesia">Indonesia</option>
              <option value="Ireland">Ireland</option>
              <option value="Italy">Italy</option>
              <option value="Japan">Japan</option>
              <option value="Mexico">Mexico</option>
              <option value="Netherlands">Netherlands</option>
              <option value="New Zealand">New Zealand</option>
              <option value="Norway">Norway</option>
              <option value="Peru">Peru</option>
              <option value="Poland">Poland</option>
              <option value="Portugal">Portugal</option>
              <option value="Seychelles">Seychelles</option>
              <option value="Singapore">Singapore</option>
              <option value="South Africa">South Africa</option>
              <option value="Spain">Spain</option>
              <option value="Sweden">Sweden</option>
              <option value="Switzerland">Switzerland</option>
              <option value="Thailand">Thailand</option>
              <option value="Turkey">Turkey</option>
              <option value="United Arab Emirates">United Arab Emirates</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="United States">United States</option>
              <option value="Uruguay">Uruguay</option>
              <option value="Vietnam">Vietnam</option>
            </SelectInput>
          </FormField>

          <FormField label="ZIP / Postal Code" required>
            <TextInput name="zipCode" placeholder="1260" defaultValue={prefill.zipCode ?? ''} key={prefill.zipCode} />
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
