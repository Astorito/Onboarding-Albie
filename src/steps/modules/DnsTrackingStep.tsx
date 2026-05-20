import { Icon, FormField, TextInput } from '../../components/ui/primitives';
import { ConfigSection } from '../../components/ui/layout';

export const DnsTrackingStep = () => (
  <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
    <div className="mb-4 shrink-0">
      <h1 className="font-display-lg text-xl text-primary font-bold">DNS & Tracking</h1>
      <p className="text-on-surface-variant text-xs">
        Configure your subdomain and connect analytics integrations.
      </p>
    </div>
    <form id="form-dns" onSubmit={(e) => e.preventDefault()}>
      <ConfigSection
        title="Domain & Analytics"
        description="Set your booking engine subdomain and connect third-party tracking tools."
        icon="dns"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormField label="Subdomain Name" required className="col-span-2">
            <div className="flex items-center">
              <TextInput name="subdomain" placeholder="reservations" className="rounded-r-none border-r-0" />
              <span className="px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-r-lg text-sm font-bold text-on-surface-variant whitespace-nowrap">
                .albie.com
              </span>
            </div>
          </FormField>

          <FormField label="Google Tag Manager ID">
            <TextInput name="gtmId" placeholder="GTM-XXXXXXX" />
          </FormField>

          <FormField label="Google Analytics 4 Measurement ID">
            <TextInput name="ga4Id" placeholder="G-XXXXXXXXXX" />
          </FormField>

          <FormField label="Google Map ID" className="col-span-2">
            <TextInput name="mapId" placeholder="Enter your Google Maps API key or Map ID" />
          </FormField>

          <div className="col-span-2 mt-2 p-4 bg-secondary-container/30 rounded-xl flex items-start gap-3">
            <Icon name="info" className="text-secondary text-lg shrink-0 mt-0.5" />
            <p className="text-xs text-on-surface-variant leading-relaxed">
              After saving, point your DNS CNAME record to{' '}
              <strong className="text-primary">booking.albie.com</strong>. Propagation may take up to
              48 hours.
            </p>
          </div>
        </div>
      </ConfigSection>
    </form>
  </div>
);
