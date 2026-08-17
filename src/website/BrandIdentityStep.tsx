import { FormField, TextareaInput } from '../components/ui/primitives';
import { ConfigSection } from '../components/ui/layout';
import { SelectableCard } from './SelectableCard';
import { OtherReveal } from './OtherReveal';

export type BrandPrefill = Record<string, string | null | undefined>;

const BRAND_RESOURCES = [
  { name: 'resourceLogo', label: 'Logo' },
  { name: 'resourceTypography', label: 'Typography / Brand fonts' },
  { name: 'resourceColors', label: 'Colors' },
  { name: 'resourceGuidelines', label: 'Brand guidelines' },
];

export const BrandIdentityStep = ({ prefill = {} }: { prefill?: BrandPrefill }) => (
  <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
    <div className="mb-4 shrink-0">
      <h1 className="font-display-lg text-xl text-primary font-bold">Brand Identity</h1>
      <p className="text-on-surface-variant text-xs">
        Your existing brand identity and visual assets.
      </p>
    </div>
    <form id="form-brand" onSubmit={(e) => e.preventDefault()}>
      <ConfigSection
        title="Brand Assets"
        description="Do you already have a defined visual identity?"
        icon="palette"
        panelColor="#1d1e1f"
        panelBorderColor="#000000"
        dotColor="#e6007e"
      >
        <div className="grid grid-cols-1 gap-y-4">
          <FormField label="Do you have a complete brand identity or brand guidelines file?" required>
            <div className="flex flex-col sm:flex-row gap-2">
              <SelectableCard name="hasBrandIdentity" value="yes" defaultChecked={prefill.hasBrandIdentity === 'yes'} required>
                Yes
              </SelectableCard>
              <SelectableCard name="hasBrandIdentity" value="no" defaultChecked={prefill.hasBrandIdentity === 'no'} required>
                No
              </SelectableCard>
            </div>
          </FormField>

          <FormField label="What resources are included in your brand identity?">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 group/other">
              {BRAND_RESOURCES.map(r => (
                <SelectableCard key={r.name} type="checkbox" name={r.name} defaultChecked={prefill[r.name] === 'on'}>
                  {r.label}
                </SelectableCard>
              ))}
              <SelectableCard type="checkbox" name="resourceOtherEnabled" value="other" defaultChecked={!!prefill.resourceOther}>
                Other
              </SelectableCard>
              <div className="md:col-span-2">
                <OtherReveal name="resourceOther" defaultValue={prefill.resourceOther ?? ''} />
              </div>
            </div>
          </FormField>

          <div className="p-4 bg-surface-container-low border border-outline-variant rounded-xl text-xs text-on-surface-variant">
            Please upload all the brand-related files in the Drive folder shared by email. A link
            to a Drive folder was shared with this form — please upload all brand-related files
            there.
          </div>

          <FormField
            label="In 3-5 words, how would you describe your brand?"
            hint="e.g. calm, premium, family-friendly, bold, intimate"
          >
            <TextareaInput name="brandDescriptionWords" rows={2} defaultValue={prefill.brandDescriptionWords ?? ''} key={prefill.brandDescriptionWords} />
          </FormField>
        </div>
      </ConfigSection>
    </form>
  </div>
);
