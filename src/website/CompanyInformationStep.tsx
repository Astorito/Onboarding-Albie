import { FormField, TextInput } from '../components/ui/primitives';
import { ConfigSection } from '../components/ui/layout';
import { SelectableCard } from './SelectableCard';
import { OtherReveal } from './OtherReveal';

export type CompanyPrefill = Record<string, string | null | undefined>;

const INDUSTRIES = [
  { value: 'hotel_hospitality', label: 'Hotel / Hospitality' },
  { value: 'restaurant_fnb', label: 'Restaurant / F&B' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'corporate_services', label: 'Corporate / Services' },
  { value: 'ecommerce', label: 'E-commerce' },
];

const GOALS = [
  { name: 'goalBrandAwareness', label: 'Brand awareness' },
  { name: 'goalLeadGeneration', label: 'Lead generation' },
  { name: 'goalSalesEcommerce', label: 'Sales / E-commerce' },
  { name: 'goalInformational', label: 'Informational' },
];

export const CompanyInformationStep = ({ prefill = {} }: { prefill?: CompanyPrefill }) => (
  <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
    <div className="mb-4 shrink-0">
      <h1 className="font-display-lg text-xl text-primary font-bold">Company Information</h1>
      <p className="text-on-surface-variant text-xs">
        Tell us about your business and what this website needs to achieve.
      </p>
    </div>
    <form id="form-company" onSubmit={(e) => e.preventDefault()}>
      <ConfigSection
        title="About Your Business"
        description="Core details we'll need to get your project started."
        icon="business_center"
        panelColor="#1d1e1f"
        panelBorderColor="#000000"
        dotColor="#e6007e"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormField label="Company / Brand Name" required className="col-span-2">
            <TextInput name="companyName" placeholder="Your Company Name" defaultValue={prefill.companyName ?? ''} key={prefill.companyName} />
          </FormField>

          <FormField label="Industry / Market" required className="col-span-2">
            <div className="flex flex-col gap-2 group/other">
              {INDUSTRIES.map(i => (
                <SelectableCard key={i.value} name="industry" value={i.value} defaultChecked={prefill.industry === i.value} required>
                  {i.label}
                </SelectableCard>
              ))}
              <SelectableCard name="industry" value="other" defaultChecked={prefill.industry === 'other'} required>
                Other
              </SelectableCard>
              <OtherReveal name="industryOther" defaultValue={prefill.industryOther ?? ''} />
            </div>
          </FormField>

          <FormField label="Existing Website URL" className="col-span-2">
            <TextInput name="existingWebsiteUrl" type="url" placeholder="https://www.yourcompany.com" defaultValue={prefill.existingWebsiteUrl ?? ''} key={prefill.existingWebsiteUrl} />
          </FormField>

          <FormField label="Main Contact Person (name & role)" required>
            <TextInput name="contactPerson" placeholder="e.g. Jane Doe, Marketing Director" defaultValue={prefill.contactPerson ?? ''} key={prefill.contactPerson} />
          </FormField>

          <FormField label="Email Address" required>
            <TextInput name="email" type="email" placeholder="you@yourcompany.com" defaultValue={prefill.email ?? ''} key={prefill.email} />
          </FormField>

          <FormField label="What is the primary goal of this website?" className="col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 group/other">
              {GOALS.map(g => (
                <SelectableCard key={g.name} type="checkbox" name={g.name} defaultChecked={prefill[g.name] === 'on'}>
                  {g.label}
                </SelectableCard>
              ))}
              <SelectableCard type="checkbox" name="goalOtherEnabled" value="other" defaultChecked={!!prefill.goalOther}>
                Other
              </SelectableCard>
              <div className="md:col-span-2">
                <OtherReveal name="goalOther" defaultValue={prefill.goalOther ?? ''} />
              </div>
            </div>
          </FormField>
        </div>
      </ConfigSection>
    </form>
  </div>
);
