import { Icon, FormField, TextInput, SelectInput } from '../../components/ui/primitives';
import { ConfigSection } from '../../components/ui/layout';
import { PrefillData } from '../../types';

export const WebsiteBrandStep = ({ prefill = {} }: { prefill?: Partial<PrefillData> }) => {
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
      <ConfigSection
        title="Brand Identity"
        description="Upload your logo, set brand colors, and choose typography for the booking experience."
        icon="palette"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormField label="Site Title" required className="col-span-2">
            <TextInput
              placeholder="The Grand Pavilion – Official Booking"
              defaultValue={prefill.siteTitle ?? ''}
              key={prefill.siteTitle}
            />
          </FormField>

          <FormField label="Primary Color" required>
            <div className="flex items-center gap-3">
              <input
                type="color"
                defaultValue="#5b6300"
                className="h-10 w-12 rounded-lg border border-outline-variant cursor-pointer p-0.5 shrink-0"
              />
              <TextInput placeholder="#5b6300" />
            </div>
          </FormField>

          <FormField label="Secondary Color" required>
            <div className="flex items-center gap-3">
              <input
                type="color"
                defaultValue="#dfec60"
                className="h-10 w-12 rounded-lg border border-outline-variant cursor-pointer p-0.5 shrink-0"
              />
              <TextInput placeholder="#dfec60" />
            </div>
          </FormField>

          <FormField label="Accent Color" required>
            <div className="flex items-center gap-3">
              <input
                type="color"
                defaultValue="#00191a"
                className="h-10 w-12 rounded-lg border border-outline-variant cursor-pointer p-0.5 shrink-0"
              />
              <TextInput placeholder="#00191a" />
            </div>
          </FormField>

          <FormField label="Font Family" required>
            <SelectInput>
              {fonts.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </SelectInput>
          </FormField>

          <FormField label="Button Style">
            <SelectInput>
              {buttonStyles.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </SelectInput>
          </FormField>

          <FormField label="Logo Upload" required>
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-outline-variant rounded-xl cursor-pointer hover:border-primary transition-colors group">
              <Icon name="upload" className="text-2xl text-primary/40 group-hover:text-primary mb-1" />
              <span className="text-xs text-on-surface-variant font-bold">Click to upload</span>
              <span className="text-[10px] text-on-surface-variant">SVG, PNG or JPG (max 2MB)</span>
              <input type="file" className="hidden" accept=".svg,.png,.jpg,.jpeg" />
            </label>
          </FormField>

          <FormField label="Favicon Upload" required>
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-outline-variant rounded-xl cursor-pointer hover:border-primary transition-colors group">
              <Icon name="upload" className="text-2xl text-primary/40 group-hover:text-primary mb-1" />
              <span className="text-xs text-on-surface-variant font-bold">Click to upload</span>
              <span className="text-[10px] text-on-surface-variant">ICO or PNG 32×32px</span>
              <input type="file" className="hidden" accept=".ico,.png" />
            </label>
          </FormField>
        </div>
      </ConfigSection>
    </div>
  );
};
