import { FormField, TextInput, SelectInput } from '../../components/ui/primitives';
import { ConfigSection } from '../../components/ui/layout';
import { StepPrefill } from '../../types';

export const WebsiteBrandStep = ({ prefill = {} }: { prefill?: StepPrefill }) => {
  const fonts = [
    'Hanken Grotesk',
    'Inter',
    'Playfair Display',
    'Montserrat',
    'Lato',
    'Georgia',
    'DM Sans',
    'Plus Jakarta Sans',
  ];
  const buttonStyles = ['Rounded (lg)', 'Pill (full)', 'Square', 'Outlined'];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
      <div className="mb-4 shrink-0">
        <h1 className="font-display-lg text-xl text-primary font-bold">Website & Brand</h1>
        <p className="text-on-surface-variant text-xs">
          Define the visual identity for your guest-facing booking engine.
        </p>
      </div>
      <form id="form-brand" onSubmit={(e) => e.preventDefault()}>
        <ConfigSection
          title="Brand Identity"
          description="Upload your logo, set brand colors, and choose typography for the booking experience."
          icon="palette"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <FormField label="Site Title" required className="col-span-2" hint="Appears in the browser tab and as the booking engine header.">
              <TextInput
                name="siteTitle"
                placeholder="The Grand Pavilion – Official Booking"
                defaultValue={prefill.siteTitle ?? ''}
                key={prefill.siteTitle}
              />
            </FormField>

            <FormField label="Primary Color" required>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="primaryColorPicker"
                  defaultValue={prefill.primaryColor ?? '#ffffff'}
                  key={`pc-${prefill.primaryColor}`}
                  className="h-10 w-12 rounded-lg border border-outline-variant cursor-pointer p-0.5 shrink-0"
                />
                <TextInput name="primaryColor" placeholder="#ffffff" defaultValue={prefill.primaryColor ?? '#ffffff'} key={prefill.primaryColor} />
              </div>
            </FormField>

            <FormField label="Secondary Color" required>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="secondaryColorPicker"
                  defaultValue={prefill.secondaryColor ?? '#ffffff'}
                  key={`sc-${prefill.secondaryColor}`}
                  className="h-10 w-12 rounded-lg border border-outline-variant cursor-pointer p-0.5 shrink-0"
                />
                <TextInput name="secondaryColor" placeholder="#ffffff" defaultValue={prefill.secondaryColor ?? '#ffffff'} key={prefill.secondaryColor} />
              </div>
            </FormField>

            <FormField label="Accent Color" required>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="accentColorPicker"
                  defaultValue={prefill.accentColor ?? '#ffffff'}
                  key={`ac-${prefill.accentColor}`}
                  className="h-10 w-12 rounded-lg border border-outline-variant cursor-pointer p-0.5 shrink-0"
                />
                <TextInput name="accentColor" placeholder="#ffffff" defaultValue={prefill.accentColor ?? '#ffffff'} key={prefill.accentColor} />
              </div>
            </FormField>

            <FormField label="Font Family" required>
              <SelectInput name="fontFamily" defaultValue={prefill.fontFamily ?? ''} key={prefill.fontFamily}>
                {fonts.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </SelectInput>
            </FormField>

            <FormField label="Button Style">
              <SelectInput name="buttonStyle" defaultValue={prefill.buttonStyle ?? ''} key={prefill.buttonStyle}>
                {buttonStyles.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </SelectInput>
            </FormField>

            <FormField label="Logo URL" required hint="Paste a public URL — SVG, PNG or JPG hosted anywhere (e.g. your CDN, S3, or website).">
              <TextInput
                name="logoUrl"
                type="url"
                placeholder="https://yourhotel.com/logo.svg"
                defaultValue={prefill.logoUrl ?? ''}
                key={prefill.logoUrl}
              />
            </FormField>

            <FormField label="Favicon URL" required hint="A square icon (32×32 px) ICO or PNG hosted publicly.">
              <TextInput
                name="faviconUrl"
                type="url"
                placeholder="https://yourhotel.com/favicon.ico"
                defaultValue={prefill.faviconUrl ?? ''}
                key={prefill.faviconUrl}
              />
            </FormField>
          </div>
        </ConfigSection>
      </form>
    </div>
  );
};
