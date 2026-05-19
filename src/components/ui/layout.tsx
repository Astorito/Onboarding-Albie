import React from 'react';
import { motion } from 'motion/react';
import { Icon } from './primitives';

export const Header = () => (
  <header className="fixed top-0 w-full bg-surface border-b border-outline-variant flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 z-50">
    <img
      src="https://albiebytag.com/wp-content/uploads/2024/09/Albie-logo.svg"
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
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  icon?: string;
}) => (
  <div className="w-full bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row">
    <div className="w-full md:w-1/3 bg-surface-container-low/20 p-6 border-b md:border-b-0 md:border-r border-outline-variant flex flex-col gap-4">
      <div className="flex items-start gap-3 text-primary">
        <div className="w-2 h-2 rounded-full bg-secondary mt-2 shrink-0" />
        <div>
          <h3 className="font-bold text-base leading-tight mb-1">{title}</h3>
          <p className="text-on-surface-variant text-xs leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="mt-auto hidden md:block">
        <Icon name={icon} className="text-3xl text-primary/10" />
      </div>
    </div>
    <div className="w-full md:w-2/3 p-6 bg-white">
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
  <div className="bg-white border border-outline-variant rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
        <Icon name={icon} className="text-secondary text-xl" />
      </div>
      <div>
        <p className="font-bold text-primary text-sm">{title}</p>
        <p className="text-[11px] text-on-surface-variant">{subtitle}</p>
      </div>
    </div>
    <div className="flex items-center gap-1">
      {onEdit && (
        <button onClick={onEdit} className="p-2 text-primary/30 hover:text-primary transition-colors cursor-pointer">
          <Icon name="edit" className="text-sm" />
        </button>
      )}
      {onDelete && (
        <button onClick={onDelete} className="p-2 text-primary/30 hover:text-red-500 transition-colors cursor-pointer">
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
    className="w-full py-4 border-2 border-dashed border-outline-variant rounded-2xl text-primary/40 hover:text-primary hover:border-primary font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
  >
    <Icon name="add_circle" className="text-xl" />
    {label}
  </button>
);

export const FormActions = ({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: () => void;
}) => (
  <div className="col-span-2 flex justify-end gap-3 pt-2 border-t border-outline-variant/50">
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
      className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
    >
      Save
    </button>
  </div>
);
