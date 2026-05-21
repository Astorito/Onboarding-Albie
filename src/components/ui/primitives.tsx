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
