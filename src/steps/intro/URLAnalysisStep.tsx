import { useState, type KeyboardEvent } from 'react';
import { motion } from 'motion/react';
import { Icon, TextInput } from '../../components/ui/primitives';
import { PrefillData } from '../../types';

export const URLAnalysisStep = ({
  onComplete,
  onSkip,
}: {
  onComplete: (data: PrefillData) => void;
  onSkip: () => void;
}) => {
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [done, setDone] = useState(false);
  const [foundName, setFoundName] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setAnalyzing(true);
    setApiError(null);
    try {
      const res = await fetch('/api/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setFoundName(data.propertyName ?? url);
      setDone(true);
      onComplete(data as PrefillData);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <main className="h-full flex items-center justify-center overflow-hidden px-margin-mobile md:px-margin-desktop relative">
      <img
        src="https://albiebytag.com/wp-content/uploads/2024/09/Albie-logo.svg"
        alt="Albie by TAG"
        className="absolute top-6 right-6 h-8 w-auto"
        style={{ filter: 'brightness(0) saturate(100%)' }}
      />
      <div className="w-full max-w-container-max-width grid md:grid-cols-12 gap-gutter items-center">

        {/* Left: content */}
        <div className="md:col-span-6 flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-3">
            <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-lg font-label-md inline-block w-fit text-xs font-bold tracking-wider uppercase">
              Step 2 of 2
            </span>
            <h2 className="font-display-lg text-4xl lg:text-5xl text-primary font-bold leading-tight">
              Let Albie read<br />your website
            </h2>
            <p className="font-body-md text-on-surface-variant max-w-md leading-relaxed">
              Paste your property's URL and Albie will automatically extract and pre-fill your onboarding details — saving you time.
            </p>
          </div>

          {/* Input + button */}
          <div className="flex gap-3">
            <TextInput
              type="url"
              placeholder="https://www.yourhotel.com"
              value={url}
              onChange={(e) => setUrl((e.target as HTMLInputElement).value)}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleAnalyze()}
              className={`flex-1 ${done ? 'border-secondary bg-secondary-container/30' : ''}`}
            />
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !url.trim() || done}
              className={`shrink-0 px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
                done
                  ? 'bg-secondary text-on-secondary cursor-default'
                  : analyzing
                  ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed'
                  : 'bg-primary text-on-primary hover:opacity-90 active:scale-95 shadow-md shadow-primary/20'
              }`}
            >
              {done ? (
                <><Icon name="check" className="text-base" /> Done</>
              ) : analyzing ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <Icon name="sync" className="text-base" />
                  </motion.div>
                  Analyzing…
                </>
              ) : (
                <><Icon name="auto_awesome" className="text-base" /> Analyze</>
              )}
            </button>
          </div>

          {/* Status: analyzing */}
          {analyzing && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-surface-container-low border border-outline-variant rounded-2xl"
            >
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
                <Icon name="travel_explore" className="text-secondary text-2xl" />
              </motion.div>
              <div>
                <p className="font-bold text-primary text-sm">Reading your website…</p>
                <p className="text-on-surface-variant text-xs">Extracting property details, contact info, and description.</p>
              </div>
            </motion.div>
          )}

          {/* Status: done */}
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 bg-secondary-container border border-secondary/30 rounded-2xl"
            >
              <Icon name="check_circle" className="text-secondary text-2xl shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-primary text-sm">Data extracted successfully</p>
                <p className="text-on-surface-variant text-xs mt-0.5">
                  We found <strong>{foundName}</strong>. Your fields have been pre-filled — review and edit them as needed.
                </p>
              </div>
            </motion.div>
          )}

          {/* Status: error */}
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl"
            >
              <Icon name="error" className="text-red-500 text-2xl shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-700 text-sm">Could not analyze the URL</p>
                <p className="text-red-600 text-xs mt-0.5">{apiError}</p>
              </div>
            </motion.div>
          )}

          {/* Skip */}
          <div className="flex items-center gap-3">
            <button
              onClick={onSkip}
              className="font-bold text-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5 group"
            >
              Skip for now
              <Icon name="arrow_forward" className="text-sm group-hover:translate-x-1 transition-transform" />
            </button>
            <span className="text-outline-variant text-xs">— you can fill in the details manually</span>
          </div>
        </div>

        {/* Right: visual card */}
        <div className="md:col-span-6 hidden md:flex flex-col gap-4">
          <div className="bg-secondary-container rounded-3xl p-8 flex flex-col gap-5 shadow-inner">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Icon name="auto_awesome" className="text-on-primary text-xl" />
              </div>
              <div>
                <p className="font-bold text-primary text-sm">AI-powered extraction</p>
                <p className="text-on-surface-variant text-xs">Fields pre-filled from your site</p>
              </div>
            </div>
            {[
              { label: 'Property Name', value: 'The Grand Pavilion Hotel', icon: 'apartment' },
              { label: 'City', value: 'Copenhagen, Denmark', icon: 'location_on' },
              { label: 'Phone', value: '+45 33 00 00 00', icon: 'call' },
              { label: 'Email', value: 'reservations@grandpavilion.com', icon: 'mail' },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3 bg-white/60 rounded-xl px-4 py-3 border border-white/80">
                <Icon name={row.icon} className="text-primary/50 text-base shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{row.label}</p>
                  <p className="text-primary text-sm font-semibold truncate">{row.value}</p>
                </div>
                <Icon name="check_circle" className="text-secondary text-base ml-auto shrink-0" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
};
