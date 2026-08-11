import React from 'react';

export const Icon = ({ name, className = '' }: { name: string; className?: string }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

export const inputCls =
  'w-full px-4 py-2.5 bg-white border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-sm';

export const TextInput = ({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`${inputCls} ${className}`} />
);

export const SelectInput = ({
  children,
  className = '',
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className={`${inputCls} appearance-none ${className}`}>
    {children}
  </select>
);

export const TextareaInput = ({
  rows = 3,
  className = '',
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea rows={rows} {...props} className={`${inputCls} resize-none ${className}`} />
);

export const FormField = ({
  label,
  required,
  className = '',
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    <label className="font-bold text-primary text-[11px] uppercase tracking-wider flex items-center gap-1">
      {label} {required && <span className="text-red-500 text-sm font-black">*</span>}
    </label>
    {children}
    {hint && <p className="text-[10px] text-on-surface-variant leading-relaxed italic">{hint}</p>}
  </div>
);

// Standalone guidance block for copy that's too long or too important for a
// FormField `hint` (which renders as a single 10px italic <p>, so it can't hold
// block-level children).
export const InfoNote = ({
  children,
  icon = 'info',
  id,
  className = '',
}: {
  children: React.ReactNode;
  icon?: string;
  id?: string;
  className?: string;
}) => (
  <div
    id={id}
    className={`flex gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-4 ${className}`}
  >
    <span aria-hidden="true" className="shrink-0 leading-none">
      <Icon name={icon} className="text-secondary text-lg" />
    </span>
    <div className="text-xs text-on-surface-variant leading-relaxed space-y-1.5 [&_strong]:font-bold [&_strong]:text-primary">
      {children}
    </div>
  </div>
);

// Shared guidance for the Room Code / Rate Code fields. Hotels were reading the
// example ("STD-KG-01") as a mandatory naming convention — this spells out that
// the code is free-form and should mirror whatever already exists in their CM/PMS.
export const SystemCodeNote = ({
  kind,
  id,
  className = '',
}: {
  kind: 'room' | 'rate';
  id?: string;
  className?: string;
}) => {
  const noun = kind === 'room' ? 'room' : 'rate';
  const subject = kind === 'room' ? 'room type' : 'rate';
  return (
    <InfoNote id={id} className={className}>
      <p>
        A unique code assigned to each {subject}. Please enter the{' '}
        <strong>same {noun} code currently configured in your Channel Manager or PMS</strong>. This
        code is required to ensure that {noun} information can be correctly mapped and transferred
        between systems.
      </p>
      <p>
        <strong>Important:</strong> the code does not need to follow a specific format. Use the
        existing code configured in your CM/PMS — any example shown here is only an illustration.
      </p>
      <p>
        If the property does not use a Channel Manager or PMS, we will create the corresponding
        codes for you during the onboarding process.
      </p>
    </InfoNote>
  );
};

export const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative shrink-0 w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none cursor-pointer ${
      checked ? 'bg-secondary' : 'bg-outline-variant'
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
        checked ? 'translate-x-6' : 'translate-x-0'
      }`}
    />
  </button>
);
