import { FormField } from '../components/ui/primitives';
import { ConfigSection } from '../components/ui/layout';
import { SelectableCard } from './SelectableCard';

export type HotelGatePrefill = Record<string, string | null | undefined>;

export const HotelGateStep = ({ prefill = {} }: { prefill?: HotelGatePrefill }) => (
  <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
    <div className="mb-4 shrink-0">
      <h1 className="font-display-lg text-xl text-primary font-bold">Hotel / Hospitality</h1>
      <p className="text-on-surface-variant text-xs">
        Please indicate if your project is related to hospitality.
      </p>
    </div>
    <form id="form-hotelGate" onSubmit={(e) => e.preventDefault()}>
      <ConfigSection
        title="Hospitality Check"
        description="A couple of extra questions apply only to hotel/hospitality projects."
        icon="hotel"
        panelColor="#1d1e1f"
        panelBorderColor="#000000"
        dotColor="#e6007e"
      >
        <FormField label="Could you please confirm whether your project is related to the hotel or hospitality sector?" required>
          <div className="flex flex-col sm:flex-row gap-2">
            <SelectableCard name="isHotelProject" value="yes" defaultChecked={prefill.isHotelProject === 'yes'} required>
              Yes
            </SelectableCard>
            <SelectableCard name="isHotelProject" value="no" defaultChecked={prefill.isHotelProject === 'no'} required>
              No
            </SelectableCard>
          </div>
        </FormField>
      </ConfigSection>
    </form>
  </div>
);
