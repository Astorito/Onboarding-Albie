import { FormField, TextareaInput } from '../components/ui/primitives';
import { ConfigSection } from '../components/ui/layout';

export type InspirationPrefill = Record<string, string | null | undefined>;

export const InspirationReferencesStep = ({ prefill = {} }: { prefill?: InspirationPrefill }) => (
  <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
    <div className="mb-4 shrink-0">
      <h1 className="font-display-lg text-xl text-primary font-bold">Inspiration & References</h1>
      <p className="text-on-surface-variant text-xs">
        Websites you like, and who you compete with.
      </p>
    </div>
    <form id="form-inspiration" onSubmit={(e) => e.preventDefault()}>
      <ConfigSection
        title="References"
        description="Sites you admire, and what to avoid."
        icon="lightbulb"
        panelColor="#1d1e1f"
        panelBorderColor="#000000"
        dotColor="#e6007e"
      >
        <div className="grid grid-cols-1 gap-y-4">
          <FormField label="Reference Websites (URLs)">
            <TextareaInput name="referenceWebsites" rows={2} placeholder="https://..." defaultValue={prefill.referenceWebsites ?? ''} key={prefill.referenceWebsites} />
          </FormField>

          <FormField label="What do you like about those websites?">
            <TextareaInput name="likesAboutReferences" rows={2} defaultValue={prefill.likesAboutReferences ?? ''} key={prefill.likesAboutReferences} />
          </FormField>

          <FormField label="Is there anything you dislike or want to avoid?">
            <TextareaInput name="dislikesToAvoid" rows={2} defaultValue={prefill.dislikesToAvoid ?? ''} key={prefill.dislikesToAvoid} />
          </FormField>

          <FormField label="Who are your direct or indirect competitors?">
            <TextareaInput name="competitors" rows={2} defaultValue={prefill.competitors ?? ''} key={prefill.competitors} />
          </FormField>
        </div>
      </ConfigSection>
    </form>
  </div>
);
