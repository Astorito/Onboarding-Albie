import { FormField, TextInput, TextareaInput } from '../components/ui/primitives';
import { ConfigSection } from '../components/ui/layout';

export type BasicsPrefill = Record<string, string | null | undefined>;

export const BusinessBasicsStep = ({ prefill = {} }: { prefill?: BasicsPrefill }) => (
  <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
    <div className="mb-4 shrink-0">
      <h1 className="font-display-lg text-xl text-primary font-bold">Business Basics</h1>
      <p className="text-on-surface-variant text-xs">
        Initial PPC setup includes strategic planning, campaign structure build-out, ad copy
        creation, audience targeting, conversion tracking implementation, and account
        configuration across corresponding platforms.
      </p>
    </div>
    <form id="form-basics" onSubmit={(e) => e.preventDefault()}>
      <ConfigSection
        title="About Your Business"
        description="Tell us who you are and where to reach you."
        icon="business_center"
        panelColor="#1d1e1f"
        panelBorderColor="#000000"
        dotColor="#e6007e"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormField label="Email" required className="col-span-2">
            <TextInput name="email" type="email" placeholder="you@yourbusiness.com" defaultValue={prefill.email ?? ''} key={prefill.email} />
          </FormField>

          <FormField label="Business Name" required className="col-span-2">
            <TextInput name="businessName" placeholder="Your Business Name" defaultValue={prefill.businessName ?? ''} key={prefill.businessName} />
          </FormField>

          <FormField label="Have you run any paid advertising campaigns before? If so, which platforms have you used?" className="col-span-2">
            <TextareaInput name="pastCampaigns" rows={3} placeholder="e.g. Google Ads for 6 months, Meta Ads..." defaultValue={prefill.pastCampaigns ?? ''} key={prefill.pastCampaigns} />
          </FormField>
        </div>
      </ConfigSection>
    </form>
  </div>
);
