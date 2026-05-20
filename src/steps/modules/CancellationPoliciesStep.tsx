import { useState, Fragment, type Dispatch, type SetStateAction } from 'react';
import { FormField, TextInput, TextareaInput, SelectInput } from '../../components/ui/primitives';
import { ConfigSection, ItemCard, AddItemButton, FormActions } from '../../components/ui/layout';

export type CancellationPolicy = {
  id: number;
  name: string;
  window: string;
  penalty: string;
  isDefault: boolean;
};

interface Props {
  policies: CancellationPolicy[];
  setPolicies: Dispatch<SetStateAction<CancellationPolicy[]>>;
}

export const CancellationPoliciesStep = ({ policies, setPolicies }: Props) => {
  const [showForm, setShowForm] = useState(false);
  const [penaltyType, setPenaltyType] = useState('No penalty');

  const savePolicy = () => {
    setPolicies((prev) => [
      ...prev,
      { id: Date.now(), name: 'New Policy', window: '48', penalty: penaltyType, isDefault: false },
    ]);
    setShowForm(false);
    setPenaltyType('No penalty');
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
      <div className="mb-4 shrink-0">
        <h1 className="font-display-lg text-xl text-primary font-bold">Cancellation Policies</h1>
        <p className="text-on-surface-variant text-xs">
          Define refund windows and penalty conditions for your reservations.
        </p>
      </div>

      {!showForm ? (
        <div className="space-y-3">
          {policies.map((p) => (
            <Fragment key={p.id}>
              <ItemCard
                icon="gavel"
                title={p.name + (p.isDefault ? ' · Default' : '')}
                subtitle={`Cancellation window: ${p.window}h · Penalty: ${p.penalty}`}
                onEdit={() => {}}
                onDelete={() => setPolicies((prev) => prev.filter((x) => x.id !== p.id))}
              />
            </Fragment>
          ))}
          <AddItemButton label="Add Cancellation Policy" onClick={() => setShowForm(true)} />
        </div>
      ) : (
        <ConfigSection
          title="New Policy"
          description="Define the conditions and penalty structure for this cancellation policy."
          icon="gavel"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <FormField label="Policy Name" required className="col-span-2">
              <TextInput placeholder="Flexible Policy" />
            </FormField>

            <FormField label="Policy Description" required className="col-span-2">
              <TextareaInput
                rows={3}
                placeholder={`e.g. Guests can cancel free of charge up to 24 hours before arrival.\nLate cancellations will incur a charge of the first night's stay.`}
              />
            </FormField>

            <FormField label="Cancellation Window" required>
              <div className="flex items-center gap-2">
                <TextInput type="number" placeholder="24" className="flex-1" />
                <span className="text-sm text-on-surface-variant font-bold shrink-0">hours</span>
              </div>
            </FormField>

            <FormField label="Penalty Applied" required>
              <SelectInput
                value={penaltyType}
                onChange={(e) => setPenaltyType(e.target.value)}
              >
                <option>No penalty</option>
                <option>Value of First Night</option>
                <option>Percentage of Total</option>
                <option>Fixed Amount</option>
              </SelectInput>
            </FormField>

            {(penaltyType === 'Percentage of Total' || penaltyType === 'Fixed Amount') && (
              <FormField
                label={`Value ${penaltyType === 'Percentage of Total' ? '(%)' : '(Amount)'}`}
                required
              >
                <TextInput
                  type="number"
                  placeholder={penaltyType === 'Percentage of Total' ? '25' : '150.00'}
                />
              </FormField>
            )}

            <FormField label="Additional Notes" className="col-span-2">
              <TextareaInput
                rows={2}
                placeholder="Please include any special rules, exceptions, or additional cancellation conditions..."
              />
            </FormField>

            <FormActions onCancel={() => setShowForm(false)} onSave={savePolicy} />
          </div>
        </ConfigSection>
      )}
    </div>
  );
};
