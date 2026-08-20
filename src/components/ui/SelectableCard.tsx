import type { ReactNode } from 'react';
import { Icon } from './primitives';

// Radio/checkbox-backed card selector (Stripe/Linear/Notion-style): the native
// input stays functional (still collected via FormData) but is visually
// hidden — hover/selected states are pure CSS via :has()/peer, no JS state.
export const SelectableCard = ({
  type = 'radio',
  name,
  value,
  defaultChecked,
  required,
  children,
}: {
  type?: 'radio' | 'checkbox';
  name: string;
  value?: string;
  defaultChecked?: boolean;
  required?: boolean;
  children: ReactNode;
  key?: string;
}) => (
  <label className="relative flex items-start gap-3 rounded-xl border-2 border-outline-variant bg-white p-4 cursor-pointer transition-all hover:border-secondary/50 hover:bg-secondary-container/40 has-[:checked]:border-secondary has-[:checked]:bg-secondary-container has-[:checked]:shadow-sm">
    <input
      type={type}
      name={name}
      value={value}
      defaultChecked={defaultChecked}
      required={required}
      className="peer sr-only"
    />
    <div className="flex-1 text-xs text-on-surface leading-snug">{children}</div>
    <div
      className={`w-5 h-5 border-2 border-outline-variant peer-checked:border-secondary peer-checked:bg-secondary flex items-center justify-center shrink-0 mt-0.5 transition-colors text-transparent peer-checked:text-white ${
        type === 'checkbox' ? 'rounded-md' : 'rounded-full'
      }`}
    >
      <Icon name="check" className="text-sm leading-none" />
    </div>
  </label>
);
