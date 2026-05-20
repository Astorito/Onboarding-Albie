import { useState, Fragment } from 'react';
import { FormField, TextInput, TextareaInput, SelectInput } from '../../components/ui/primitives';
import { ConfigSection, ItemCard, AddItemButton, FormActions } from '../../components/ui/layout';

export const ExperiencesStep = () => {
  const [experiences, setExperiences] = useState([
    { id: 1, group: 'Wellness', description: 'Spa & Relaxation Package' },
  ]);
  const [showForm, setShowForm] = useState(false);

  const saveExperience = () => {
    setExperiences((prev) => [
      ...prev,
      { id: Date.now(), group: 'New Group', description: 'New Experience' },
    ]);
    setShowForm(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
      <div className="mb-4 shrink-0">
        <h1 className="font-display-lg text-xl text-primary font-bold">Experiences</h1>
        <p className="text-on-surface-variant text-xs">
          Add activities, tours, and curated experiences for your guests.
        </p>
      </div>

      {!showForm ? (
        <div className="space-y-3">
          {experiences.map((e) => (
            <Fragment key={e.id}>
              <ItemCard
                icon="local_activity"
                title={e.description}
                subtitle={`Group: ${e.group}`}
                onEdit={() => {}}
                onDelete={() => setExperiences((prev) => prev.filter((x) => x.id !== e.id))}
              />
            </Fragment>
          ))}
          <AddItemButton label="Add Experience" onClick={() => setShowForm(true)} />
        </div>
      ) : (
        <ConfigSection
          title="New Experience"
          description="Add details about this activity or experience for your guests."
          icon="local_activity"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <FormField label="Experience Group">
              <TextInput placeholder="Wellness, Adventure, Dining..." />
            </FormField>

            <FormField label="Availability">
              <SelectInput>
                <option>Daily</option>
                <option>Weekdays Only</option>
                <option>Weekends Only</option>
                <option>On Request</option>
                <option>Seasonal</option>
              </SelectInput>
            </FormField>

            <FormField label="Description" className="col-span-2">
              <TextareaInput rows={3} placeholder="Describe this experience..." />
            </FormField>

            <FormField label="Terms & Conditions" className="col-span-2">
              <TextareaInput rows={2} placeholder="Cancellation terms, age restrictions, etc." />
            </FormField>

            <FormField label="Max Attendees">
              <TextInput type="number" min={1} placeholder="10" />
            </FormField>

            <FormField label="Price per Person">
              <div className="flex items-center">
                <span className="px-3 py-2.5 bg-surface-container-low border border-outline-variant border-r-0 rounded-l-lg text-sm font-bold text-on-surface-variant">
                  €
                </span>
                <TextInput type="number" placeholder="75.00" className="rounded-l-none border-l-0" />
              </div>
            </FormField>

            <FormField label="Set Max Quantity" className="col-span-2">
              <TextInput type="number" min={1} placeholder="5" />
            </FormField>

            <FormActions onCancel={() => setShowForm(false)} onSave={saveExperience} />
          </div>
        </ConfigSection>
      )}
    </div>
  );
};
