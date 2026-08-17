import { FormField, TextInput, TextareaInput } from '../components/ui/primitives';
import { ConfigSection } from '../components/ui/layout';
import { SelectableCard } from './SelectableCard';
import { OtherReveal } from './OtherReveal';

export type FeaturesPrefill = Record<string, string | null | undefined>;

const FEATURES = [
  { name: 'featureContactForms', label: 'Contact forms' },
  { name: 'featureNewsletter', label: 'Newsletter subscriptions' },
  { name: 'featureBookingSystem', label: 'Booking system' },
  { name: 'featureEcommerce', label: 'E-commerce' },
  { name: 'featureBlogDynamic', label: 'Blog / Dynamic content' },
  {
    name: 'featureThirdPartyIntegrations',
    label: 'Third-party integrations (CRM, Payments, WhatsApp, Google Tag Manager)',
  },
];

const DOMAIN_STATUS = [
  { value: 'already_purchased', label: 'Already purchased' },
  { value: 'need_assistance', label: 'Need assistance' },
  { value: 'not_sure', label: 'Not sure' },
];

const HOSTING_STATUS = [
  { value: 'already_have', label: 'Already have' },
  { value: 'need_assistance', label: 'Need assistance' },
  { value: 'not_sure', label: 'Not sure' },
];

export const FeaturesInfrastructureStep = ({ prefill = {} }: { prefill?: FeaturesPrefill }) => (
  <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
    <div className="mb-4 shrink-0">
      <h1 className="font-display-lg text-xl text-primary font-bold">Features & Infrastructure</h1>
      <p className="text-on-surface-variant text-xs">
        Required features, SEO, and domain/hosting status.
      </p>
    </div>
    <form id="form-features" onSubmit={(e) => e.preventDefault()}>
      <ConfigSection
        title="Features & SEO"
        description="What functionality does this site need?"
        icon="settings"
        panelColor="#1d1e1f"
        panelBorderColor="#000000"
        dotColor="#e6007e"
      >
        <div className="grid grid-cols-1 gap-y-4">
          <FormField label="Which features do you require?">
            <div className="grid grid-cols-1 gap-y-2 group/other">
              {FEATURES.map(f => (
                <SelectableCard key={f.name} type="checkbox" name={f.name} defaultChecked={prefill[f.name] === 'on'}>
                  {f.label}
                </SelectableCard>
              ))}
              <SelectableCard type="checkbox" name="featureOtherEnabled" value="other" defaultChecked={!!prefill.featureOther}>
                Other
              </SelectableCard>
              <OtherReveal name="featureOther" defaultValue={prefill.featureOther ?? ''} />
            </div>
          </FormField>

          <FormField label="SEO Goals or Priority Keywords">
            <TextareaInput name="seoGoals" rows={2} defaultValue={prefill.seoGoals ?? ''} key={prefill.seoGoals} />
          </FormField>
        </div>
      </ConfigSection>

      <ConfigSection
        title="Domain and Hosting Status"
        description="Please provide information about the hosting and the domain (url) status."
        icon="dns"
        panelColor="#1d1e1f"
        panelBorderColor="#000000"
        dotColor="#e6007e"
      >
        <div className="grid grid-cols-1 gap-y-4">
          <FormField label="Domain Property">
            <div className="flex flex-col sm:flex-row gap-2 group/other flex-wrap">
              {DOMAIN_STATUS.map(d => (
                <SelectableCard key={d.value} name="domainProperty" value={d.value} defaultChecked={prefill.domainProperty === d.value}>
                  {d.label}
                </SelectableCard>
              ))}
              <SelectableCard name="domainProperty" value="other" defaultChecked={prefill.domainProperty === 'other'}>
                Other
              </SelectableCard>
              <div className="w-full">
                <OtherReveal name="domainPropertyOther" defaultValue={prefill.domainPropertyOther ?? ''} />
              </div>
            </div>
          </FormField>

          <FormField label="Hosting Provider">
            <div className="flex flex-col sm:flex-row gap-2 group/other flex-wrap">
              {HOSTING_STATUS.map(h => (
                <SelectableCard key={h.value} name="hostingProvider" value={h.value} defaultChecked={prefill.hostingProvider === h.value}>
                  {h.label}
                </SelectableCard>
              ))}
              <SelectableCard name="hostingProvider" value="other" defaultChecked={prefill.hostingProvider === 'other'}>
                Other
              </SelectableCard>
              <div className="w-full">
                <OtherReveal name="hostingProviderOther" defaultValue={prefill.hostingProviderOther ?? ''} />
              </div>
            </div>
          </FormField>

          <FormField label="Anything Else You Want to Share With Us?">
            <TextareaInput name="additionalInfo" rows={3} defaultValue={prefill.additionalInfo ?? ''} key={prefill.additionalInfo} />
          </FormField>

          <FormField label="Desired Timeline or Deadline">
            <TextInput name="desiredTimeline" type="date" defaultValue={prefill.desiredTimeline ?? ''} key={prefill.desiredTimeline} />
          </FormField>
        </div>
      </ConfigSection>
    </form>
  </div>
);
