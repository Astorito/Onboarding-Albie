import { FormField, TextInput } from '../components/ui/primitives';
import { ConfigSection } from '../components/ui/layout';
import { SelectableCard } from './SelectableCard';
import { OtherReveal } from './OtherReveal';

export type HotelTechnicalPrefill = Record<string, string | null | undefined>;

const BOOKING_ENGINES = [
  { value: 'albie', label: 'Albie' },
  { value: 'cloudbeds', label: 'Cloudbeds' },
  { value: 'siteminder', label: 'SiteMinder' },
];

export const HotelTechnicalInfoStep = ({ prefill = {} }: { prefill?: HotelTechnicalPrefill }) => (
  <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
    <div className="mb-4 shrink-0">
      <h1 className="font-display-lg text-xl text-primary font-bold">Hotel / Hospitality — Technical Information</h1>
      <p className="text-on-surface-variant text-xs">
        Booking engine, PMS, and channel manager details.
      </p>
    </div>
    <form id="form-hotelTechnical" onSubmit={(e) => e.preventDefault()}>
      <ConfigSection
        title="Reservation Systems"
        description="What's already in place for handling bookings?"
        icon="dns"
        panelColor="#1d1e1f"
        panelBorderColor="#000000"
        dotColor="#e6007e"
      >
        <div className="grid grid-cols-1 gap-y-4">
          <FormField label="Do you have an active booking engine system?">
            <div className="flex flex-col sm:flex-row gap-2">
              <SelectableCard name="hasActiveBookingEngine" value="yes" defaultChecked={prefill.hasActiveBookingEngine === 'yes'}>
                Yes
              </SelectableCard>
              <SelectableCard name="hasActiveBookingEngine" value="no" defaultChecked={prefill.hasActiveBookingEngine === 'no'}>
                No
              </SelectableCard>
            </div>
          </FormField>

          <FormField label="Which booking engine system are you planning to use?">
            <div className="flex flex-col gap-2 group/other">
              {BOOKING_ENGINES.map(b => (
                <SelectableCard key={b.value} name="bookingEngine" value={b.value} defaultChecked={prefill.bookingEngine === b.value}>
                  {b.label}
                </SelectableCard>
              ))}
              <SelectableCard name="bookingEngine" value="other" defaultChecked={prefill.bookingEngine === 'other'}>
                Other
              </SelectableCard>
              <OtherReveal name="bookingEngineOther" defaultValue={prefill.bookingEngineOther ?? ''} />
            </div>
          </FormField>

          <FormField label="PMS">
            <TextInput name="pms" defaultValue={prefill.pms ?? ''} key={prefill.pms} />
          </FormField>

          <FormField label="Channel Manager">
            <TextInput name="channelManager" defaultValue={prefill.channelManager ?? ''} key={prefill.channelManager} />
          </FormField>
        </div>
      </ConfigSection>
    </form>
  </div>
);
