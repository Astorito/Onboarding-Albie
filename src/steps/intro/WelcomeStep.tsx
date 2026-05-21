import { Icon } from '../../components/ui/primitives';

export const WelcomeStep = ({ onNext }: { onNext: () => void }) => (
  <main className="h-full flex items-center justify-center overflow-hidden px-margin-mobile">
    <div className="max-w-container-max-width w-full grid md:grid-cols-12 gap-gutter items-center">
      <div className="md:col-span-6 flex flex-col items-start gap-6 py-4">
        <div className="flex flex-col gap-2">
          <img
            src="https://albiebytag.com/wp-content/uploads/2024/09/Albie-logo.svg"
            alt="Albie by TAG"
            className="h-16 w-auto mb-4"
          />
          <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-lg font-label-md inline-block w-fit">
            ESTIMATE TIME: 8 MINUTES
          </span>
          <h1 className="font-display-lg text-4xl lg:text-6xl text-primary leading-tight">
            Welcome to Albie
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-lg">
            Let's set up your booking engine to start receiving reservations. Our architectural
            onboarding ensures precision in every detail of your operations.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
          <button
            onClick={onNext}
            className="bg-primary text-on-primary font-body-md px-10 py-4 rounded-lg shadow-sm hover:opacity-90 transition-all active:scale-95 duration-200 cursor-pointer font-bold"
          >
            Start Onboarding
          </button>
          <button className="bg-transparent border border-primary text-primary font-body-md px-10 py-4 rounded-lg hover:bg-surface-container-low transition-all active:scale-95 duration-200 cursor-pointer font-bold">
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
