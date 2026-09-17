import { FormField, TextInput, SelectInput } from '../components/ui/primitives';
import { ConfigSection, AddItemButton } from '../components/ui/layout';
import { emptyTax, type ActivityTax } from './types';

// Global tax list. Each activity later picks which of these apply to it, so a
// tax is defined once instead of being retyped on every activity.
//
// Edits are applied immediately by id (no draft form, no commitPending) — the
// parent's autosave always reads current state, which removes a whole class of
// "the last edit wasn't saved" bugs the hotel flow needs imperative refs for.

export const ActivityTaxesStep = ({
  taxes,
  setTaxes,
}: {
  taxes: ActivityTax[];
  setTaxes: (next: ActivityTax[]) => void;
}) => {
  const update = (id: number, patch: Partial<ActivityTax>) =>
    setTaxes(taxes.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const remove = (id: number) => setTaxes(taxes.filter((t) => t.id !== id));
  const add = () => setTaxes([...taxes, emptyTax(Date.now())]);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
      <div className="mb-4 shrink-0">
        <h1 className="font-display-lg text-xl text-primary font-bold">Taxes</h1>
        <p className="text-on-surface-variant text-xs">
          Define every tax once here. On the next step you choose which ones apply to each activity.
        </p>
      </div>

      <ConfigSection
        title="Tax List"
        description="Add each tax that can apply to your activities, and how it should be calculated."
        icon="payments"
      >
        <div className="flex flex-col gap-3">
          {taxes.length === 0 && (
            <p className="text-xs text-on-surface-variant italic">
              No taxes yet. If your activities are sold tax-free, you can leave this empty.
            </p>
          )}

          {taxes.map((t) => (
            <div key={t.id} className="relative border border-outline-variant rounded-xl p-4 bg-white">
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="absolute top-3 right-3 text-on-surface-variant hover:text-red-500 transition-colors cursor-pointer text-sm"
                title="Remove tax"
              >
                ✕
              </button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 pr-8">
                <FormField label="Tax Name" required>
                  <TextInput
                    value={t.name}
                    onChange={(e) => update(t.id, { name: e.target.value })}
                    placeholder="VAT"
                  />
                </FormField>

                <FormField label="How is it calculated?" required>
                  <SelectInput
                    value={t.calcType}
                    onChange={(e) => update(t.id, { calcType: e.target.value as ActivityTax['calcType'] })}
                  >
                    <option value="percentage">Percentage of the price</option>
                    <option value="per_person">Fixed amount per person</option>
                    <option value="per_item">Fixed amount per booking</option>
                  </SelectInput>
                </FormField>

                <FormField
                  label={t.calcType === 'percentage' ? 'Percentage' : 'Amount'}
                  required
                  hint={t.calcType === 'percentage' ? 'Just the number, e.g. 21' : 'In your property currency'}
                >
                  <TextInput
                    type="number"
                    value={t.value}
                    onChange={(e) => update(t.id, { value: e.target.value })}
                    placeholder={t.calcType === 'percentage' ? '21' : '10'}
                  />
                </FormField>
              </div>
            </div>
          ))}

          <AddItemButton label="Add Tax" onClick={add} />
        </div>
      </ConfigSection>
    </div>
  );
};
