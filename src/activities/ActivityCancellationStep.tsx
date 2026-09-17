import { FormField, TextInput, TextareaInput, SelectInput } from '../components/ui/primitives';
import { ConfigSection, AddItemButton } from '../components/ui/layout';
import { emptyPolicy, type ActivityCancellationPolicy } from './types';

// Global cancellation-policy list. Each activity picks which policy applies to
// it on the Activities step — so "free cancellation up to 24h before" is defined
// once and reused, and a single activity can still have a stricter one.
//
// Same immediate-patch model as the taxes step: no draft form, no commitPending.

export const ActivityCancellationStep = ({
  policies,
  setPolicies,
}: {
  policies: ActivityCancellationPolicy[];
  setPolicies: (next: ActivityCancellationPolicy[]) => void;
}) => {
  const update = (id: number, patch: Partial<ActivityCancellationPolicy>) =>
    setPolicies(policies.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const remove = (id: number) => setPolicies(policies.filter((p) => p.id !== id));
  const add = () => setPolicies([...policies, emptyPolicy(Date.now())]);

  // Only one policy can be the default — marking one unmarks the rest.
  const setDefault = (id: number, isDefault: boolean) =>
    setPolicies(policies.map((p) => ({ ...p, isDefault: p.id === id ? isDefault : isDefault ? false : p.isDefault })));

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
      <div className="mb-4 shrink-0">
        <h1 className="font-display-lg text-xl text-primary font-bold">Cancellation Policies</h1>
        <p className="text-on-surface-variant text-xs">
          Define your policies here. On the next step you choose which one applies to each activity.
        </p>
      </div>

      <ConfigSection
        title="Policy List"
        description="How far in advance guests can cancel, and what they're charged if they cancel later."
        icon="gavel"
      >
        <div className="flex flex-col gap-3">
          {policies.length === 0 && (
            <p className="text-xs text-on-surface-variant italic">
              No policies yet. Add at least one so your activities can reference it.
            </p>
          )}

          {policies.map((p) => (
            <div key={p.id} className="relative border border-outline-variant rounded-xl p-4 bg-white">
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="absolute top-3 right-3 text-on-surface-variant hover:text-red-500 transition-colors cursor-pointer text-sm"
                title="Remove policy"
              >
                ✕
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pr-8">
                <FormField label="Policy Name" required className="col-span-2">
                  <TextInput
                    value={p.name}
                    onChange={(e) => update(p.id, { name: e.target.value })}
                    placeholder="Flexible"
                  />
                </FormField>

                <FormField label="Free cancellation up to" required hint="How long before the activity starts">
                  <div className="flex gap-2">
                    <TextInput
                      type="number"
                      value={p.window}
                      onChange={(e) => update(p.id, { window: e.target.value })}
                      placeholder="24"
                    />
                    <SelectInput
                      value={p.windowUnit}
                      onChange={(e) => update(p.id, { windowUnit: e.target.value as ActivityCancellationPolicy['windowUnit'] })}
                    >
                      <option value="hours">hours before</option>
                      <option value="days">days before</option>
                    </SelectInput>
                  </div>
                </FormField>

                <FormField label="Charge for later cancellations" required>
                  <SelectInput
                    value={p.penaltyType}
                    onChange={(e) => update(p.id, { penaltyType: e.target.value as ActivityCancellationPolicy['penaltyType'] })}
                  >
                    <option value="none">No charge</option>
                    <option value="percentage">Percentage of the total</option>
                    <option value="fixed">Fixed amount</option>
                  </SelectInput>
                </FormField>

                {p.penaltyType !== 'none' && (
                  <FormField
                    label={p.penaltyType === 'percentage' ? 'Percentage charged' : 'Amount charged'}
                    required
                    hint={p.penaltyType === 'percentage' ? 'Just the number, e.g. 50' : 'In your property currency'}
                  >
                    <TextInput
                      type="number"
                      value={p.penaltyValue}
                      onChange={(e) => update(p.id, { penaltyValue: e.target.value })}
                      placeholder={p.penaltyType === 'percentage' ? '50' : '25'}
                    />
                  </FormField>
                )}

                <FormField label="Notes" className="col-span-2" hint="Anything else guests should know about this policy.">
                  <TextareaInput
                    rows={2}
                    value={p.notes}
                    onChange={(e) => update(p.id, { notes: e.target.value })}
                    placeholder="No-shows are charged in full."
                  />
                </FormField>

                <label className="col-span-2 flex items-center gap-2.5 text-sm text-on-surface cursor-pointer">
                  <input
                    type="checkbox"
                    checked={p.isDefault}
                    onChange={(e) => setDefault(p.id, e.target.checked)}
                    className="accent-primary w-4 h-4"
                  />
                  Use this as the default policy for new activities
                </label>
              </div>
            </div>
          ))}

          <AddItemButton label="Add Policy" onClick={add} />
        </div>
      </ConfigSection>
    </div>
  );
};
