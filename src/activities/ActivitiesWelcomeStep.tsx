import { Icon } from '../components/ui/primitives';

export const ActivitiesWelcomeStep = ({
  onNext,
  propertyName,
}: {
  onNext: () => void;
  propertyName?: string | null;
}) => (
  <main className="h-full flex items-center justify-center overflow-hidden px-margin-mobile relative bg-white">
    <div className="absolute top-5 left-6">
      <img
        src="/albie-logo-dark.svg"
        alt="ALBIE by TAG"
        style={{ width: '150px', height: '100px', objectFit: 'contain' }}
      />
    </div>
    <div className="max-w-container-max-width w-full grid md:grid-cols-12 gap-gutter items-center">
      <div className="md:col-span-6 flex flex-col items-start gap-6 py-4">
        <div className="flex flex-col gap-2">
          <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-lg font-label-md inline-block w-fit">
            ESTIMATED TIME: 10 MINUTES
          </span>
          <h1 className="font-display-lg text-4xl lg:text-6xl text-primary leading-tight">
            Welcome to OnActivities
          </h1>
          {propertyName && (
            <p className="font-display-lg text-2xl lg:text-3xl text-secondary font-bold leading-tight">
              {propertyName}
            </p>
          )}
          <p className="font-body-md text-on-surface-variant max-w-lg">
            Let's set up your activities so guests can book them online. You'll tell us about each
            experience you sell — how long it runs, what it costs, how many people it takes, and
            when it's available.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
          <button
            onClick={onNext}
            className="font-body-md px-10 py-4 rounded-lg shadow-sm hover:opacity-90 transition-all active:scale-95 duration-200 cursor-pointer font-bold text-white"
            style={{ backgroundColor: '#2F6B6D' }}
          >
            Start Onboarding
          </button>
        </div>
      </div>
      <div className="md:col-span-6 hidden md:grid grid-cols-2 grid-rows-2 gap-4 h-[450px]">
        <div className="col-span-1 row-span-2 rounded-2xl overflow-hidden border border-outline-variant shadow-lg">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1533692328991-08159ff19fca?auto=format&fit=crop&q=80&w=1000"
            alt="Kayaking experience"
          />
        </div>
        <div className="col-span-1 row-span-1 border border-outline-variant rounded-2xl overflow-hidden shadow-md">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=1000"
            alt="Hiking tour"
          />
        </div>
        <div className="col-span-1 row-span-1 rounded-2xl border border-outline-variant bg-secondary-container p-6 flex flex-col justify-center shadow-md">
          <Icon name="local_activity" className="text-secondary text-4xl mb-2" />
          <h3 className="font-headline-sm text-xl text-primary font-bold">Built for experiences</h3>
          <p className="font-body-sm text-on-secondary-fixed-variant">No rooms, no nights.</p>
        </div>
      </div>
    </div>
  </main>
);
