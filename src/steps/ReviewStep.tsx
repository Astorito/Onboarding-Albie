import { Icon } from '../components/ui/primitives';
import { ALL_MODULES } from '../constants';

export const ReviewStep = ({
  clientModules,
  onEdit,
  verified,
  onToggleVerify,
}: {
  clientModules: string[];
  onEdit: (moduleId: string) => void;
  verified: Set<string>;
  onToggleVerify: (id: string) => void;
}) => {
  const activeModules = ALL_MODULES.filter((m) => clientModules.includes(m.id));
  const allVerified = activeModules.every((m) => verified.has(m.id));

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col py-4">
      <div className="mb-6 shrink-0 flex items-end justify-between">
        <div>
          <h1 className="font-display-lg text-xl text-primary font-bold">Review Configuration</h1>
          <p className="text-on-surface-variant text-xs">
            Click the checkmark on each module to confirm it's ready.
          </p>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
          allVerified
            ? 'bg-green-100 text-green-700'
            : 'bg-surface-container-highest text-on-surface-variant'
        }`}>
          {verified.size} / {activeModules.length} verified
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-28">
        {activeModules.map((m) => {
          const isVerified = verified.has(m.id);
          return (
            <div
              key={m.id}
              className={`bg-white border-2 rounded-2xl overflow-hidden shadow-sm flex flex-col transition-all duration-300 ${
                isVerified ? 'border-green-400' : 'border-outline-variant'
              }`}
            >
              <div className="bg-surface-container-low/30 px-5 py-4 border-b border-outline-variant flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Icon name={m.icon} className="text-primary text-lg" />
                  <h2 className="font-bold text-primary text-xs uppercase tracking-wider">
                    {m.title}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onEdit(m.id)}
                    className="text-[10px] font-bold text-primary underline underline-offset-4 hover:text-secondary transition-colors cursor-pointer"
                  >
                    EDIT
                  </button>
                  {/* Verify checkmark button */}
                  <button
                    onClick={() => onToggleVerify(m.id)}
                    title={isVerified ? 'Mark as unverified' : 'Mark as verified'}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                      isVerified
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-white border-outline-variant text-transparent hover:border-primary'
                    }`}
                  >
                    <Icon name="check" className="text-sm" />
                  </button>
                </div>
              </div>
              <div className="p-5 flex-grow flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  isVerified ? 'bg-green-100' : 'bg-surface-container-low'
                }`}>
                  <Icon name={isVerified ? 'check_circle' : m.icon} className={`text-base ${isVerified ? 'text-green-500' : 'text-primary/30'}`} />
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">{m.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
