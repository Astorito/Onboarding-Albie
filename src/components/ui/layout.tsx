import React from 'react';
import { motion } from 'motion/react';
import { Icon } from './primitives';

export const Header = () => (
  <header className="fixed top-0 w-full bg-surface border-b border-outline-variant flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 z-50">
    <img
      src="/albie-logo-dark.svg"
      alt="Albie by TAG"
      className="h-8 w-auto"
    />
    <div className="flex items-center gap-stack-md">
      <button className="flex items-center justify-center p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full">
        <Icon name="help" />
      </button>
      <button className="flex items-center justify-center p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full">
        <Icon name="account_circle" />
      </button>
    </div>
  </header>
);

export const ProgressBar = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => {
  const percentage = Math.round((currentStep / (totalSteps - 1)) * 100);
  return (
    <div className="mb-2 w-full max-w-[600px] mx-auto">
      <div className="flex justify-between items-end mb-2">
        <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-[10px]">
          Step {currentStep} of {totalSteps - 1}
        </span>
        <span className="font-label-md text-label-md text-primary font-bold text-[10px]">
          {percentage}% Complete
        </span>
      </div>
      <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className="h-full bg-secondary transition-all duration-500"
        />
      </div>
    </div>
  );
};

export const ConfigSection = ({
  title,
  description,
  children,
  icon = 'info',
  panelColor = '#2F6B6D',
  panelBorderColor = '#245557',
  dotColor = '#F2EA5F',
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  icon?: string;
  panelColor?: string;
  panelBorderColor?: string;
  dotColor?: string;
}) => (
  <div className="w-full bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row mb-4">
    <div className="w-full md:w-1/3 p-7 border-b md:border-b-0 md:border-r flex flex-col gap-4" style={{ backgroundColor: panelColor, borderColor: panelBorderColor }}>
      <div className="flex items-start gap-3">
        <div className="w-2.5 h-2.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: dotColor }} />
        <div>
          <h3 className="font-bold text-lg leading-tight mb-1.5 text-white">{title}</h3>
          <p className="text-white/70 text-xs leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="mt-auto hidden md:block">
        <Icon name={icon} className="text-4xl text-white/20" />
      </div>
    </div>
    <div className="w-full md:w-2/3 p-7 bg-white">
      {children}
    </div>
  </div>
);

// Reusable card list + add-new pattern for modules with multiple entries
export const ItemCard = ({
  icon,
  title,
  subtitle,
  onEdit,
  onDelete,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onEdit?: () => void;
  onDelete?: () => void;
}) => (
  <div className="bg-white border border-outline-variant rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm hover:border-primary/30 hover:shadow-md transition-all">
    <div className="flex items-center gap-4 min-w-0">
      <div className="w-11 h-11 rounded-xl bg-secondary/15 flex items-center justify-center shrink-0">
        <Icon name={icon} className="text-secondary text-xl" />
      </div>
      <div className="min-w-0">
        <p className="font-bold text-primary text-sm truncate">{title}</p>
        <p className="text-[11px] text-on-surface-variant truncate">{subtitle}</p>
      </div>
    </div>
    <div className="flex items-center gap-1 shrink-0">
      {onEdit && (
        <button
          onClick={onEdit}
          aria-label="Edit"
          className="px-3 py-2 text-primary hover:bg-secondary-container/50 transition-all rounded-lg cursor-pointer flex items-center gap-1.5 text-xs font-bold"
        >
          <Icon name="edit" className="text-sm" />
          Edit
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          aria-label="Delete"
          className="px-3 py-2 text-on-surface-variant hover:bg-red-50 hover:text-red-600 transition-all rounded-lg cursor-pointer"
        >
          <Icon name="delete" className="text-sm" />
        </button>
      )}
    </div>
  </div>
);

export const AddItemButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full py-5 border-2 border-dashed border-outline-variant rounded-2xl text-primary/50 hover:text-primary hover:border-primary hover:bg-secondary-container/20 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
  >
    <Icon name="add_circle" className="text-xl" />
    {label}
  </button>
);

export const FormActions = ({
  onCancel,
  onSave,
  saveLabel = 'Save',
}: {
  onCancel: () => void;
  onSave: () => void;
  saveLabel?: string;
}) => (
  <div className="col-span-2 flex justify-end gap-3 pt-4 mt-2 border-t border-outline-variant/50">
    <button
      type="button"
      onClick={onCancel}
      className="px-6 py-2.5 border border-outline-variant rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container-low transition-all cursor-pointer"
    >
      Cancel
    </button>
    <button
      type="button"
      onClick={onSave}
      className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
    >
      <Icon name="check" className="text-sm" />
      {saveLabel}
    </button>
  </div>
);
