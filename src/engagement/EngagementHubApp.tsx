import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { Icon } from '../components/ui/primitives';

interface EngagementResponse {
  engagementSlug: string;
  engagementName: string | null;
  products: {
    albie: { enabled: boolean; slug: string | null };
    webDesign: { enabled: boolean; slug: string | null };
    marketing: { enabled: boolean; slug: string | null };
    social: { enabled: boolean; slug: string | null };
  };
}

// Tailwind needs literal class names (no `grid-cols-${n}` interpolation), and
// there are at most 4 products, so a small lookup covers every case.
const GRID_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2',
};

// Near-black used throughout the other onboarding flows' dark panels
// (ConfigSection's panelColor="#1d1e1f") — reused here for the same "ink"
// tone, since this screen isn't wrapped in any theme and can't rely on a
// design-token default.
const INK = '#1d1e1f';

const ProductCard = ({
  title,
  description,
  icon,
  accentColor,
  href,
}: {
  title: string;
  description: ReactNode;
  icon: string;
  accentColor: string;
  href?: string;
}) => {
  const clickable = !!href;
  const body = (
    <div
      className={`h-full flex flex-col items-center text-center gap-2 sm:gap-3 border rounded-2xl p-5 sm:p-7 transition-all ${
        clickable
          ? 'border-outline-variant bg-white hover:shadow-md'
          : 'border-outline-variant/50 bg-surface-container-low/50'
      }`}
    >
      <div
        className="w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: clickable && !icon.startsWith('img:') ? accentColor : undefined }}
      >
        {icon === 'albie-mark' ? (
          <img src="/favicon.png" alt="" className={`w-7 h-7 object-contain ${clickable ? 'brightness-0 invert' : 'opacity-40'}`} />
        ) : icon.startsWith('img:') ? (
          <img
            src={icon.slice(4)}
            alt=""
            className={`w-full h-full object-cover ${clickable ? '' : 'opacity-40 grayscale'}`}
          />
        ) : (
          <Icon
            name={icon}
            className={`text-3xl ${clickable ? 'text-white' : 'text-on-surface-variant/40'}`}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-hanken font-bold text-base" style={{ color: clickable ? accentColor : undefined }}>
          {title}
        </p>
        {/* Spec calls for Roobert on this line — not in the repo yet, same as
            PP Monument above — falls back to TAG Helvetica for now. */}
        <p className="font-hanken text-sm text-on-surface-variant mt-1.5 leading-snug">{description}</p>
      </div>
      {clickable ? (
        <Icon name="arrow_forward" className="text-lg text-[#1d1e1f]" />
      ) : (
        <span className="text-[10px] font-bold uppercase tracking-wide bg-surface-container-highest text-on-surface-variant/60 px-2 py-1 rounded-full">
          Coming soon
        </span>
      )}
    </div>
  );

  return clickable ? (
    <a href={href} className="block h-full">
      {body}
    </a>
  ) : (
    body
  );
};

export default function EngagementHubApp() {
  const [data, setData] = useState<EngagementResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const match = window.location.pathname.match(/^\/e\/(.+)$/);
    const slug = match ? decodeURIComponent(match[1]) : null;
    if (!slug) { setError(true); return; }

    fetch(`/api/engagement?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!json) { setError(true); return; }
        setData(json);
      })
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <main className="h-screen flex items-center justify-center bg-white">
        <p className="text-on-surface-variant text-sm">This link isn't valid or has expired.</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="h-screen flex items-center justify-center bg-white">
        <p className="text-on-surface-variant text-sm">Loading…</p>
      </main>
    );
  }

  const { products, engagementSlug } = data;

  // Booking Engine keeps Albie's own teal; Web Design and Marketing share the
  // TAG Digital Marketing pink — this page isn't wrapped in .marketing-theme,
  // so these are explicit hex values rather than theme tokens.
  const ALBIE_TEAL = '#0D3A39';
  const TAG_PINK = '#e6007e';

  const cardData = [
    {
      id: 'albie', enabled: products.albie.enabled, accentColor: ALBIE_TEAL,
      title: 'Booking Engine', icon: 'albie-mark',
      description: <>Set up your property's <strong style={{ color: ALBIE_TEAL }}>Booking Engine</strong></>,
      shortLabel: 'ALBIE',
      href: products.albie.slug ? `/o/${products.albie.slug}?engagement=${engagementSlug}` : undefined,
    },
    {
      id: 'webDesign', enabled: products.webDesign.enabled, accentColor: TAG_PINK,
      title: 'Web Design', icon: 'play_arrow',
      description: <>Let's begin your <strong style={{ color: TAG_PINK }}>website</strong> onboarding</>,
      shortLabel: 'WEBSITE',
      href: products.webDesign.slug ? `/website/o/${products.webDesign.slug}?engagement=${engagementSlug}` : undefined,
    },
    {
      id: 'marketing', enabled: products.marketing.enabled, accentColor: TAG_PINK,
      title: 'Paid Media', icon: 'img:/paid-media-icon.jpg',
      description: <>Let's begin your <strong style={{ color: TAG_PINK }}>Paid Media</strong> onboarding</>,
      shortLabel: 'PAID MEDIA',
      href: products.marketing.slug ? `/marketing/o/${products.marketing.slug}?engagement=${engagementSlug}` : undefined,
    },
    {
      id: 'social', enabled: products.social.enabled, accentColor: TAG_PINK,
      title: 'Social Media', icon: 'img:/social-media-icon.jpg',
      description: <>Let's begin your <strong style={{ color: TAG_PINK }}>social media</strong> onboarding</>,
      shortLabel: 'SOCIAL MEDIA',
      href: products.social.slug ? `/social/o/${products.social.slug}?engagement=${engagementSlug}` : undefined,
    },
  ].filter((c) => c.enabled);

  // Computed from which products are actually enabled, rather than shown
  // from the record's free-text name — guarantees consistent, correctly-cased
  // output ("ALBIE + WEBSITE + DIGITAL MARKETING") for every engagement,
  // regardless of what an admin typed when creating it.
  const subtitle = cardData.map((c) => c.shortLabel).join(' + ');

  return (
    <main className="marketing-theme h-screen overflow-hidden flex items-center justify-center px-margin-mobile bg-white">
      <div className="max-w-3xl w-full flex flex-col items-center gap-5 sm:gap-8">
        <div className="text-center">
          <h1
            className="uppercase font-black text-4xl sm:text-5xl md:text-6xl leading-none tracking-tight"
            style={{ color: INK, fontFamily: 'var(--font-monument)' }}
          >
            Welcome to TAG
          </h1>
          {subtitle && (
            <p className="font-hanken uppercase font-bold text-[#A6A6A6] text-base sm:text-lg md:text-xl tracking-wide mt-2 sm:mt-3">
              {subtitle}
            </p>
          )}
          <p className="font-body-md text-on-surface-variant mt-3 sm:mt-4 max-w-md mx-auto">
            Complete each onboarding below at your own pace — you can always come back here to
            continue with the rest.
          </p>
        </div>

        <div className={`w-full grid ${GRID_COLS[cardData.length] ?? GRID_COLS[3]} gap-3 sm:gap-5`}>
          {cardData.map((c) => (
            <Fragment key={c.id}>
              <ProductCard
                title={c.title}
                description={c.description}
                icon={c.icon}
                accentColor={c.accentColor}
                href={c.href}
              />
            </Fragment>
          ))}
        </div>
      </div>
    </main>
  );
}
