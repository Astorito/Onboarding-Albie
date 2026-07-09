import { useState, useImperativeHandle, forwardRef, Fragment, type Dispatch, type SetStateAction } from 'react';
import { FormField, TextInput, TextareaInput, SelectInput } from '../../components/ui/primitives';
import { ConfigSection, ItemCard, AddItemButton, FormActions } from '../../components/ui/layout';

export type CancellationPolicy = {
  id: number;
  name: string;
  description: string;
  window: string;          // hours
  penaltyType: string;     // "No penalty" | "Value of First Night" | "Percentage of Total" | "Fixed Amount"
  penaltyValue: string;    // numeric string (empty when penaltyType doesn't need a value)
  notes: string;
  isDefault: boolean;
};

const EMPTY_FORM: Omit<CancellationPolicy, 'id'> = {
  name: '',
  description: '',
  window: '',
  penaltyType: 'No penalty',
  penaltyValue: '',
  notes: '',
  isDefault: false,
};

// Legacy support: keep `penalty` readable on old data
const penaltyLabel = (p: CancellationPolicy) => {
  if (!p.penaltyType || p.penaltyType === 'No penalty') return 'No penalty';
  if (p.penaltyType === 'Percentage of Total') return `${p.penaltyValue || '0'}% of total`;
  if (p.penaltyType === 'Fixed Amount') return `Fixed ${p.penaltyValue || '0'}`;
  return p.penaltyType;
};

interface Props {
  policies: CancellationPolicy[];
  setPolicies: Dispatch<SetStateAction<CancellationPolicy[]>>;
}

export interface CancellationPoliciesStepHandle {
  // See RoomInformationStepHandle.commitPending for rationale.
  commitPending: () => CancellationPolicy[] | null;
}

export const CancellationPoliciesStep = forwardRef<CancellationPoliciesStepHandle, Props>(({ policies, setPolicies }, ref) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const update = <K extends keyof typeof EMPTY_FORM>(k: K, v: (typeof EMPTY_FORM)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const startNew = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (p: CancellationPolicy) => {
    setForm({
      name: p.name,
      description: p.description ?? '',
      window: p.window,
      penaltyType: p.penaltyType ?? 'No penalty',
      penaltyValue: p.penaltyValue ?? '',
      notes: p.notes ?? '',
      isDefault: p.isDefault,
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const cancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
  };

  const commit = (): CancellationPolicy[] => {
    const next = editingId !== null
      ? policies.map((p) => (p.id === editingId ? { ...p, ...form } : p))
      : [...policies, { id: Date.now(), ...form }];
    setPolicies(next);
    cancel();
    return next;
  };

  const savePolicy = () => { commit(); };

  useImperativeHandle(ref, () => ({
    commitPending: () => {
      if (!showForm) return null;
      const hasData = form.name.trim() || form.description.trim() || form.window.trim();
      if (!hasData) return null;
      return commit();
    },
  }), [showForm, form, editingId, policies]);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
      <div className="mb-5 shrink-0">
        <h1 className="font-display-lg text-2xl text-primary font-bold">Cancellation Policies</h1>
        <p className="text-on-surface-variant text-sm mt-1">
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
                subtitle={`Window: ${p.window || '—'}h · Penalty: ${penaltyLabel(p)}`}
                onEdit={() => startEdit(p)}
                onDelete={() => setPolicies((prev) => prev.filter((x) => x.id !== p.id))}
              />
            </Fragment>
          ))}
          <AddItemButton label="Add Cancellation Policy" onClick={startNew} />
        </div>
      ) : (
        <ConfigSection
          title={editingId !== null ? 'Edit Policy' : 'New Policy'}
          description="Define when and how cancellation penalties apply to bookings under this policy."
          icon="gavel"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <FormField label="Policy Name" required className="col-span-2" hint='Example: "Flexible 48-hour cancellation"'>
              <TextInput
                placeholder="Flexible Policy"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
              />
            </FormField>

            <FormField label="Policy Description" required className="col-span-2" hint="What the guest sees on the booking page.">
              <TextareaInput
                rows={3}
                placeholder={`e.g. Guests can cancel free of charge up to 24 hours before arrival.\nLate cancellations will incur a charge of the first night's stay.`}
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
              />
            </FormField>

            <FormField label="Cancellation Window" required hint="Hours before arrival when free cancellation ends.">
              <div className="flex items-center gap-2">
                <TextInput
                  type="number"
                  placeholder="24"
                  className="flex-1"
                  value={form.window}
                  onChange={(e) => update('window', e.target.value)}
                />
                <span className="text-sm text-on-surface-variant font-bold shrink-0">hours</span>
              </div>
            </FormField>

            <FormField label="Penalty Applied" required hint="What's charged if the guest cancels after the window closes.">
              <SelectInput
                value={form.penaltyType}
                onChange={(e) => update('penaltyType', e.target.value)}
              >
                <option>No penalty</option>
                <option>Value of First Night</option>
                <option>Percentage of Total</option>
                <option>Fixed Amount</option>
              </SelectInput>
            </FormField>

            {(form.penaltyType === 'Percentage of Total' || form.penaltyType === 'Fixed Amount') && (
              <FormField
                label={`Value ${form.penaltyType === 'Percentage of Total' ? '(%)' : '(Amount)'}`}
                required
                hint={form.penaltyType === 'Percentage of Total' ? 'A number between 1 and 100.' : 'In your property currency.'}
              >
                <TextInput
                  type="number"
                  placeholder={form.penaltyType === 'Percentage of Total' ? '25' : '150.00'}
                  value={form.penaltyValue}
                  onChange={(e) => update('penaltyValue', e.target.value)}
                />
              </FormField>
            )}

            <FormField label="Additional Notes" className="col-span-2" hint="Optional internal notes — not shown to guests.">
              <TextareaInput
                rows={2}
                placeholder="Special rules, exceptions, or extra conditions..."
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
              />
            </FormField>

            <FormActions onCancel={cancel} onSave={savePolicy} saveLabel={editingId !== null ? 'Update' : 'Save'} />
          </div>
        </ConfigSection>
      )}
    </div>
  );
});
