import { FormField, TextareaInput } from '../components/ui/primitives';
import { ConfigSection } from '../components/ui/layout';

export type CompetitorsPrefill = Record<string, string | null | undefined>;

export const CompetitorsReferencesStep = ({ prefill = {} }: { prefill?: CompetitorsPrefill }) => (
  <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
    <div className="mb-4 shrink-0">
      <h1 className="font-display-lg text-xl text-primary font-bold">Competitors & References</h1>
      <p className="text-on-surface-variant text-xs">
        Who else is out there, and what inspires you — direct or not.
      </p>
    </div>
    <form id="form-competitors" onSubmit={(e) => e.preventDefault()}>
      <ConfigSection
        title="Competitors & References"
        description="Brands and accounts worth knowing about."
        icon="compare_arrows"
        panelColor="#1d1e1f"
        panelBorderColor="#000000"
        dotColor="#e6007e"
      >
        <div className="grid grid-cols-1 gap-y-4">
          <FormField
            label="Direct Competitors"
            className="col-span-2"
            hint="Their names, websites, and social media links when possible."
          >
            <TextareaInput name="directCompetitors" rows={2} defaultValue={prefill.directCompetitors ?? ''} key={prefill.directCompetitors} />
          </FormField>

          <FormField
            label="Aspirational Brands"
            className="col-span-2"
            hint="Brands, businesses, or accounts you'd like to share as reference — they don't need to be direct competitors. Explain what you like about their content, tone, visuals, or strategy."
          >
            <TextareaInput name="aspirationalBrands" rows={3} defaultValue={prefill.aspirationalBrands ?? ''} key={prefill.aspirationalBrands} />
          </FormField>

          <FormField
            label="Content References"
            className="col-span-2"
            hint="Links to specific posts, campaigns, videos, designs, or accounts, with a note on what you like or prefer about each."
          >
            <TextareaInput name="contentReferences" rows={3} defaultValue={prefill.contentReferences ?? ''} key={prefill.contentReferences} />
          </FormField>

          <FormField
            label="Content You Dislike"
            className="col-span-2"
            hint="Any styles, trends, formats, or approaches you'd like us to steer away from."
          >
            <TextareaInput name="contentToAvoid" rows={2} defaultValue={prefill.contentToAvoid ?? ''} key={prefill.contentToAvoid} />
          </FormField>
        </div>
      </ConfigSection>
    </form>
  </div>
);
