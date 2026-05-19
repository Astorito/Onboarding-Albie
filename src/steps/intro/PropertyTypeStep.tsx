import { Icon } from '../../components/ui/primitives';

export const PropertyTypeStep = ({ onSelect }: { onSelect: (type: 'independent' | 'group') => void }) => (
  <main className="h-full flex items-center justify-center overflow-hidden px-margin-mobile md:px-margin-desktop">
    <div className="w-full max-w-container-max-width grid md:grid-cols-12 gap-gutter items-center">

      {/* Left: heading */}
      <div className="md:col-span-5 flex flex-col gap-4 py-4">
        <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-lg font-label-md inline-block w-fit text-xs font-bold tracking-wider uppercase">
          Step 1 of 2
        </span>
        <h2 className="font-display-lg text-4xl lg:text-5xl text-primary font-bold leading-tight">
          What type of property are you?
        </h2>
        <p className="font-body-md text-on-surface-variant max-w-sm leading-relaxed">
          Select the option that best describes your accommodation setup to personalise your onboarding.
        </p>
      </div>

      {/* Right: cards */}
      <div className="md:col-span-7 grid sm:grid-cols-2 gap-5">
        {/* Independent */}
        <button
          onClick={() => onSelect('independent')}
          className="group relative flex flex-col p-8 bg-white border-2 border-outline-variant rounded-3xl hover:border-secondary transition-all duration-200 shadow-sm hover:shadow-xl active:scale-[0.98] text-left cursor-pointer overflow-hidden"
        >
          <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/5 rounded-3xl transition-colors duration-200" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="w-14 h-14 bg-secondary-container rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200">
              <Icon name="hotel" className="text-3xl text-secondary" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">Independent</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed flex-1">
              A single property with its own identity, operating on its own.
            </p>
            <div className="mt-6 flex items-center gap-1.5 text-primary font-bold text-sm group-hover:gap-3 transition-all duration-200">
              Select <Icon name="arrow_forward" className="text-base" />
            </div>
          </div>
        </button>

        {/* Group */}
        <button
          onClick={() => onSelect('group')}
          className="group relative flex flex-col p-8 bg-white border-2 border-outline-variant rounded-3xl hover:border-secondary transition-all duration-200 shadow-sm hover:shadow-xl active:scale-[0.98] text-left cursor-pointer overflow-hidden"
        >
          <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/5 rounded-3xl transition-colors duration-200" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="w-14 h-14 bg-secondary-container rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200">
              <Icon name="domain" className="text-3xl text-secondary" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">Group</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed flex-1">
              Multiple properties managed together under a single group account.
            </p>
            <div className="mt-6 flex items-center gap-1.5 text-primary font-bold text-sm group-hover:gap-3 transition-all duration-200">
              Select <Icon name="arrow_forward" className="text-base" />
            </div>
          </div>
        </button>
      </div>

    </div>
  </main>
);
