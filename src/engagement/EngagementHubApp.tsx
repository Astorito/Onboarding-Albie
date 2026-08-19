import { Fragment, useEffect, useState } from 'react';
import { Icon } from '../components/ui/primitives';

interface EngagementResponse {
  engagementSlug: string;
  engagementName: string | null;
  products: {
    albie: { enabled: boolean; slug: string | null };
    webDesign: { enabled: boolean; slug: string | null };
    marketing: { enabled: boolean; slug: string | null };
  };
}

// Tailwind needs literal class names (no `grid-cols-${n}` interpolation), and
// there are at most 3 products, so a small lookup covers every case.
const GRID_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
};

const ProductCard = ({
  title,
  description,
  icon,
  href,
}: {
  title: string;
  description: string;
  icon: string;
  href?: string;
}) => {
  const clickable = !!href;
  const body = (
    <div
      className={`h-full flex flex-col items-center text-center gap-2.5 border rounded-2xl p-5 transition-all ${
        clickable
          ? 'border-outline-variant bg-white hover:border-primary/40 hover:shadow-md cursor-pointer'
          : 'border-outline-variant/50 bg-surface-container-low/50'
      }`}
    >
      <div
        className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${
          clickable ? 'bg-secondary/15 text-secondary' : 'bg-surface-container-highest text-on-surface-variant/40'
        }`}
      >
        <Icon name={icon} className="text-2xl" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-bold text-sm ${clickable ? 'text-primary' : 'text-on-surface-variant'}`}>{title}</p>
        <p className="text-xs text-on-surface-variant mt-1">{description}</p>
      </div>
      {clickable ? (
        <Icon name="arrow_forward" className="text-primary text-lg" />
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

  const { products, engagementName, engagementSlug } = data;
  const cardData = [
    {
      id: 'albie', enabled: products.albie.enabled,
      title: 'Albie — Booking Engine', description: "Set up your property's booking engine.", icon: 'apartment',
      href: products.albie.slug ? `/o/${products.albie.slug}?engagement=${engagementSlug}` : undefined,
    },
    {
      id: 'webDesign', enabled: products.webDesign.enabled,
      title: 'Web Design', description: 'Your website onboarding.', icon: 'palette',
      href: products.webDesign.slug ? `/website/o/${products.webDesign.slug}?engagement=${engagementSlug}` : undefined,
    },
    {
      id: 'marketing', enabled: products.marketing.enabled,
      title: 'Marketing', description: 'Your digital advertising onboarding.', icon: 'campaign',
      href: products.marketing.slug ? `/marketing/o/${products.marketing.slug}?engagement=${engagementSlug}` : undefined,
    },
  ].filter((c) => c.enabled);

  return (
    <main className="h-screen overflow-hidden flex items-center justify-center px-margin-mobile bg-white">
      <div className="max-w-2xl w-full flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="font-display-lg text-4xl text-primary leading-tight">Welcome to TAG</h1>
          {engagementName && (
            <p className="font-display-lg text-xl text-secondary font-bold mt-2">{engagementName}</p>
          )}
          <p className="font-body-md text-on-surface-variant mt-3 max-w-md mx-auto">
            Complete each onboarding below at your own pace — you can always come back here to
            continue with the rest.
          </p>
        </div>

        <div className={`w-full grid ${GRID_COLS[cardData.length] ?? GRID_COLS[3]} gap-4`}>
          {cardData.map((c) => (
            <Fragment key={c.id}>
              <ProductCard title={c.title} description={c.description} icon={c.icon} href={c.href} />
            </Fragment>
          ))}
        </div>
      </div>
    </main>
  );
}
