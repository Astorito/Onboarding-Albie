import { useEffect, useState } from 'react';
import { Icon } from '../components/ui/primitives';

interface EngagementResponse {
  engagementSlug: string;
  engagementName: string | null;
  products: {
    albie: { enabled: boolean; slug: string | null };
    webDesign: { enabled: boolean };
    marketing: { enabled: boolean };
  };
}

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
      className={`w-full border rounded-2xl p-6 flex items-center gap-4 transition-all ${
        clickable
          ? 'border-outline-variant bg-white hover:border-primary/40 hover:shadow-md cursor-pointer'
          : 'border-outline-variant/50 bg-surface-container-low/50'
      }`}
    >
      <div
        className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${
          clickable ? 'bg-secondary/15 text-secondary' : 'bg-surface-container-highest text-on-surface-variant/40'
        }`}
      >
        <Icon name={icon} className="text-2xl" />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className={`font-bold ${clickable ? 'text-primary' : 'text-on-surface-variant'}`}>{title}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>
      </div>
      {clickable ? (
        <Icon name="arrow_forward" className="text-primary text-xl shrink-0" />
      ) : (
        <span className="text-[10px] font-bold uppercase tracking-wide bg-surface-container-highest text-on-surface-variant/60 px-2 py-1 rounded-full shrink-0">
          Coming soon
        </span>
      )}
    </div>
  );

  return clickable ? (
    <a href={href} className="block">
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

  return (
    <main className="min-h-screen flex items-center justify-center px-margin-mobile bg-white py-12">
      <div className="max-w-xl w-full flex flex-col items-center gap-8">
        <img src="/albie-logo-dark.svg" alt="TAG" style={{ width: '150px', height: '100px', objectFit: 'contain' }} />
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

        <div className="w-full flex flex-col gap-3">
          {products.albie.enabled && (
            <ProductCard
              title="Albie — Booking Engine"
              description="Set up your property's booking engine."
              icon="apartment"
              href={products.albie.slug ? `/o/${products.albie.slug}?engagement=${engagementSlug}` : undefined}
            />
          )}
          {products.webDesign.enabled && (
            <ProductCard
              title="Web Design"
              description="Your website onboarding."
              icon="palette"
            />
          )}
          {products.marketing.enabled && (
            <ProductCard
              title="Marketing"
              description="Your digital advertising onboarding."
              icon="campaign"
            />
          )}
        </div>
      </div>
    </main>
  );
}
