import { FormField, TextInput, TextareaInput } from '../components/ui/primitives';
import { ConfigSection } from '../components/ui/layout';
import { SelectableCard } from '../components/ui/SelectableCard';
import { OtherReveal } from '../components/ui/OtherReveal';

export type BrandPrefill = Record<string, string | null | undefined>;

const VOICE_TRAITS = [
  { name: 'voiceProfessional', label: 'Professional' },
  { name: 'voiceFriendly', label: 'Friendly' },
  { name: 'voiceApproachable', label: 'Approachable' },
  { name: 'voiceInformative', label: 'Informative' },
  { name: 'voiceEducational', label: 'Educational' },
  { name: 'voiceInspirational', label: 'Inspirational' },
  { name: 'voiceAspirational', label: 'Aspirational' },
  { name: 'voiceSophisticated', label: 'Sophisticated' },
  { name: 'voiceLuxury', label: 'Luxury' },
  { name: 'voiceCasual', label: 'Casual' },
  { name: 'voicePlayful', label: 'Playful' },
  { name: 'voiceModern', label: 'Modern' },
  { name: 'voiceBold', label: 'Bold' },
  { name: 'voiceWarm', label: 'Warm' },
  { name: 'voiceTrustworthy', label: 'Trustworthy' },
  { name: 'voiceAuthoritative', label: 'Authoritative' },
  { name: 'voiceTechnical', label: 'Technical' },
  { name: 'voiceCommunityFocused', label: 'Community-focused' },
];

export const BrandVisualStep = ({ prefill = {} }: { prefill?: BrandPrefill }) => (
  <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
    <div className="mb-4 shrink-0">
      <h1 className="font-display-lg text-xl text-primary font-bold">Brand Voice & Visual Identity</h1>
      <p className="text-on-surface-variant text-xs">
        How your brand sounds, and how it should look everywhere we post.
      </p>
    </div>
    <form id="form-brand" onSubmit={(e) => e.preventDefault()}>
      <ConfigSection
        title="Brand Voice & Communication Style"
        description="Select every trait that describes your preferred voice."
        icon="record_voice_over"
        panelColor="#1d1e1f"
        panelBorderColor="#000000"
        dotColor="#e6007e"
      >
        <div className="grid grid-cols-1 gap-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 group/other">
            {VOICE_TRAITS.map(v => (
              <SelectableCard key={v.name} type="checkbox" name={v.name} defaultChecked={prefill[v.name] === 'on'}>
                {v.label}
              </SelectableCard>
            ))}
            <SelectableCard type="checkbox" name="voiceOtherEnabled" value="other" defaultChecked={!!prefill.voiceOther}>
              Other
            </SelectableCard>
            <div className="col-span-2 md:col-span-3">
              <OtherReveal name="voiceOther" defaultValue={prefill.voiceOther ?? ''} />
            </div>
          </div>

          <FormField label="If your brand were a person, how would you describe its personality?" className="col-span-2">
            <TextareaInput name="brandPersonality" rows={2} defaultValue={prefill.brandPersonality ?? ''} key={prefill.brandPersonality} />
          </FormField>

          <FormField
            label="Words & Phrases to Use"
            className="col-span-2"
            hint="Terms, phrases, taglines, or service names that should be used consistently."
          >
            <TextareaInput name="wordsToUse" rows={2} defaultValue={prefill.wordsToUse ?? ''} key={prefill.wordsToUse} />
          </FormField>

          <FormField
            label="Words & Phrases to Avoid"
            className="col-span-2"
            hint="Words, phrases, claims, tones, or expressions that should not be used."
          >
            <TextareaInput name="wordsToAvoid" rows={2} defaultValue={prefill.wordsToAvoid ?? ''} key={prefill.wordsToAvoid} />
          </FormField>

          <FormField label="Preferred Language" required>
            <div className="flex flex-col sm:flex-row gap-2">
              <SelectableCard name="preferredLanguage" value="english" defaultChecked={prefill.preferredLanguage === 'english'} required>
                English
              </SelectableCard>
              <SelectableCard name="preferredLanguage" value="spanish" defaultChecked={prefill.preferredLanguage === 'spanish'} required>
                Spanish
              </SelectableCard>
              <SelectableCard name="preferredLanguage" value="bilingual" defaultChecked={prefill.preferredLanguage === 'bilingual'} required>
                Bilingual
              </SelectableCard>
            </div>
          </FormField>

          <FormField
            label="Bilingual Approach"
            hint="Only relevant if you selected Bilingual above. Should every post appear in both languages, or should languages alternate depending on the content?"
          >
            <TextareaInput name="bilingualApproach" rows={2} defaultValue={prefill.bilingualApproach ?? ''} key={prefill.bilingualApproach} />
          </FormField>
        </div>
      </ConfigSection>

      <ConfigSection
        title="Visual Identity"
        description="Your existing brand materials and visual style."
        icon="palette"
        panelColor="#1d1e1f"
        panelBorderColor="#000000"
        dotColor="#e6007e"
      >
        <div className="grid grid-cols-1 gap-y-4">
          <FormField label="Do you have an established brand identity?" required>
            <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
              <SelectableCard name="hasBrandIdentity" value="yes" defaultChecked={prefill.hasBrandIdentity === 'yes'} required>
                Yes
              </SelectableCard>
              <SelectableCard name="hasBrandIdentity" value="no" defaultChecked={prefill.hasBrandIdentity === 'no'} required>
                No
              </SelectableCard>
              <SelectableCard name="hasBrandIdentity" value="partially" defaultChecked={prefill.hasBrandIdentity === 'partially'} required>
                Partially
              </SelectableCard>
              <SelectableCard name="hasBrandIdentity" value="in_development" defaultChecked={prefill.hasBrandIdentity === 'in_development'} required>
                Being developed
              </SelectableCard>
            </div>
          </FormField>

          <FormField
            label="Brand Materials"
            className="col-span-2"
            hint="Link to your brand guidelines, brand book, logos, fonts, color palette, graphic templates, photography guidelines, iconography, or previous social media templates. Please confirm TAG has permission to access, edit, and use these materials on social media."
          >
            <TextInput name="brandMaterialsUrl" type="url" placeholder="https://drive.google.com/..." defaultValue={prefill.brandMaterialsUrl ?? ''} key={prefill.brandMaterialsUrl} />
          </FormField>

          <FormField label="How would you describe the visual style you'd like to maintain?" className="col-span-2">
            <TextareaInput name="visualStyle" rows={2} defaultValue={prefill.visualStyle ?? ''} key={prefill.visualStyle} />
          </FormField>

          <FormField label="Do you have approved social media templates that must be used?">
            <div className="flex flex-col sm:flex-row gap-2">
              <SelectableCard name="hasApprovedTemplates" value="yes" defaultChecked={prefill.hasApprovedTemplates === 'yes'}>
                Yes
              </SelectableCard>
              <SelectableCard name="hasApprovedTemplates" value="no" defaultChecked={prefill.hasApprovedTemplates === 'no'}>
                No
              </SelectableCard>
            </div>
          </FormField>

          <FormField label="Templates Link" hint="If yes above, share the editable files or link.">
            <TextInput name="templatesUrl" type="url" defaultValue={prefill.templatesUrl ?? ''} key={prefill.templatesUrl} />
          </FormField>
        </div>
      </ConfigSection>
    </form>
  </div>
);
