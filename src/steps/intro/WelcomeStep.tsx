import { Icon } from '../../components/ui/primitives';

export const WelcomeStep = ({ onNext }: { onNext: () => void }) => (
  <main className="h-full flex items-center justify-center overflow-hidden px-margin-mobile relative bg-white">
    {/* Logo — top left */}
    <div className="absolute top-5 left-6">
      <img
        src="/albie-logo-dark.svg"
        alt="Albie by TAG"
        style={{ width: '150px', height: '100px', objectFit: 'contain' }}
      />
    </div>
    <div className="max-w-container-max-width w-full grid md:grid-cols-12 gap-gutter items-center">
      <div className="md:col-span-6 flex flex-col items-start gap-6 py-4">
        <div className="flex flex-col gap-2">
          <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-lg font-label-md inline-block w-fit">
            ESTIMATED TIME: 8 MINUTES
          </span>
          <h1 className="font-display-lg text-4xl lg:text-6xl text-primary leading-tight">
            Welcome to ALBIE
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-lg">
            Let's set up your booking engine to start receiving reservations. Our architectural
            onboarding ensures precision in every detail of your operations.
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
          <button
            className="bg-transparent font-body-md px-10 py-4 rounded-lg transition-all active:scale-95 duration-200 cursor-pointer font-bold"
            style={{ border: '2px solid #2F6B6D', color: '#2F6B6D' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2F6B6D15')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Watch Demo
          </button>
        </div>
      </div>
      <div className="md:col-span-6 hidden md:grid grid-cols-2 grid-rows-2 gap-4 h-[450px]">
        <div className="col-span-1 row-span-2 rounded-2xl overflow-hidden border border-outline-variant shadow-lg">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000"
            alt="Hotel Exterior"
          />
        </div>
        <div className="col-span-1 row-span-1 border border-outline-variant rounded-2xl overflow-hidden shadow-md">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1000"
            alt="Hotel Lobby"
          />
        </div>
        <div className="col-span-1 row-span-1 rounded-2xl border border-outline-variant bg-secondary-container p-6 flex flex-col justify-center shadow-md">
          <Icon name="rocket_launch" className="text-secondary text-4xl mb-2" />
          <h3 className="font-headline-sm text-xl text-primary font-bold">Rapid Launch</h3>
          <p className="font-body-sm text-on-secondary-fixed-variant">Ready in 8 minutes.</p>
        </div>
      </div>
    </div>
  </main>
);
