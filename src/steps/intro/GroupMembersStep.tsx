import { useState } from 'react';
import { Icon, TextInput, FormField } from '../../components/ui/primitives';
import { GroupMember } from '../../types';

export const GroupMembersStep = ({
  members,
  setMembers,
  onContinue,
}: {
  members: GroupMember[];
  setMembers: React.Dispatch<React.SetStateAction<GroupMember[]>>;
  onContinue: () => void;
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  const addMember = () => {
    if (!name.trim()) return;
    setMembers((prev) => [...prev, { id: Date.now(), name: name.trim(), url: url.trim() }]);
    setName('');
    setUrl('');
    setShowWarning(false);
  };

  return (
    <main className="h-full flex flex-col items-center justify-center px-margin-mobile py-8">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center">
              <Icon name="domain" className="text-secondary text-xl" />
            </div>
            <h2 className="font-display-lg text-2xl md:text-3xl text-primary font-bold">Group Properties</h2>
          </div>
          <p className="text-on-surface-variant text-sm">
            Add the independent properties that belong to this group. You can always add more later.
          </p>
        </div>

        {/* Member list */}
        <div className="space-y-3 mb-5">
          {members.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-outline-variant rounded-2xl text-on-surface-variant text-sm">
              No properties added yet. Add at least one below.
            </div>
          )}
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-4 p-4 bg-white border border-outline-variant rounded-2xl shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                <Icon name="hotel" className="text-secondary text-lg" />
              </div>
              <div className="flex-grow min-w-0">
                <p className="font-bold text-primary text-sm">{m.name}</p>
                {m.url && <p className="text-[11px] text-on-surface-variant truncate">{m.url}</p>}
              </div>
              <button
                onClick={() => setMembers((prev) => prev.filter((x) => x.id !== m.id))}
                className="p-2 text-primary/30 hover:text-red-500 transition-colors cursor-pointer"
              >
                <Icon name="delete" className="text-sm" />
              </button>
            </div>
          ))}
        </div>

        {/* Add form */}
        <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm space-y-3">
          <p className="font-bold text-primary text-xs uppercase tracking-wider">Add a property</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Property Name" required>
              <TextInput
                placeholder="Hotel Montserrat"
                value={name}
                onChange={(e) => setName((e.target as HTMLInputElement).value)}
              />
            </FormField>
            <FormField label="Website URL">
              <TextInput
                type="url"
                placeholder="https://www.hotelmontserrat.com"
                value={url}
                onChange={(e) => setUrl((e.target as HTMLInputElement).value)}
              />
            </FormField>
          </div>
          <button
            onClick={addMember}
            disabled={!name.trim()}
            className="w-full py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="add_circle" className="text-base" />
            Add Property
          </button>
        </div>

        {showWarning && (
          <p className="mt-3 text-xs text-amber-600 font-bold flex items-center gap-1">
            <Icon name="warning" className="text-base" />
            Please add at least one property before continuing.
          </p>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => {
              if (members.length === 0) { setShowWarning(true); return; }
              onContinue();
            }}
            className="group flex items-center gap-2 bg-secondary text-on-secondary rounded-xl px-10 py-4 font-bold hover:opacity-95 transition-all active:scale-95 duration-200 cursor-pointer shadow-xl shadow-secondary/20"
          >
            Continue
            <Icon name="arrow_forward" className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </main>
  );
};
