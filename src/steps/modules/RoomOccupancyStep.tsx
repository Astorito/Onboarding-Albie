import { FormField, TextInput } from '../../components/ui/primitives';
import { ConfigSection } from '../../components/ui/layout';

export const RoomOccupancyStep = () => (
  <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
    <div className="mb-4 shrink-0">
      <h1 className="font-display-lg text-xl text-primary font-bold">Room Occupancy & Capacity</h1>
      <p className="text-on-surface-variant text-xs">
        Set occupancy limits for adults, children, and total guests per room.
      </p>
    </div>
    <ConfigSection
      title="Capacity Settings"
      description="Define the minimum and maximum occupancy rules that apply across your room inventory."
      icon="group"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <FormField label="Minimum Adults" required>
          <TextInput type="number" min={1} placeholder="1" />
        </FormField>

        <FormField label="Maximum Adults" required>
          <TextInput type="number" min={1} placeholder="2" />
        </FormField>

        <FormField label="Maximum Total Occupants" required>
          <TextInput type="number" min={1} placeholder="3" />
        </FormField>

        <FormField label="Children Capacity" required>
          <TextInput type="number" min={0} placeholder="1" />
        </FormField>

        <FormField
          label="Included Occupancy"
          className="col-span-2"
          hint="Number of guests included in the base rate without additional charges."
        >
          <TextInput type="number" min={1} placeholder="2" />
        </FormField>
      </div>
    </ConfigSection>
  </div>
);
