import React, { useRef } from 'react';

const canHover = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches;

const ICONS: Record<string, React.ReactNode> = {
  paid: (
    <>
      <path d="M22 50v18a4 4 0 0 0 4 4h14l38 22V24L40 46H26a4 4 0 0 0-4 4z" />
      <path d="M44 72l6 22h13l-6-22" />
      <path d="M92 46c7 7 7 21 0 28" />
    </>
  ),
  social: (
    <>
      <path d="M20 26h80a8 8 0 0 1 8 8v44a8 8 0 0 1-8 8H54L34 104V86H20a8 8 0 0 1-8-8V34a8 8 0 0 1 8-8z" />
      <path d="M60 72C42 61 42 47 52 46c6 0 8 4 8 6 0-2 2-6 8-6 10 1 10 15-8 26z" />
    </>
  ),
  seo: (
    <>
      <circle cx="52" cy="52" r="32" />
      <path d="M76 76l28 28" />
      <path d="M38 62v-8M52 62V40M66 62V48" />
    </>
  ),
  email: (
    <>
      <rect x="12" y="26" width="96" height="68" rx="10" />
      <path d="M16 34l44 32 44-32" />
    </>
  ),
  video: (
    <>
      <rect x="12" y="26" width="96" height="68" rx="10" />
      <path d="M50 44l30 16-30 16z" />
    </>
  ),
  web: (
    <>
      <rect x="12" y="22" width="96" height="76" rx="10" />
      <path d="M12 42h96" />
      <path d="M44 62l-12 12 12 12M76 62l12 12-12 12M66 58l-12 32" />
    </>
  ),
};

export interface ServiceItem {
  title: string;
  icon: string;
  body: string;
}

interface ServiceCardProps {
  item: ServiceItem;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ item }) => {
  const cardRef = useRef<HTMLElement>(null);
  const TILT_MAX = 8;

  const handlePointerMove = (e: React.PointerEvent) => {
    const el = cardRef.current;
    if (!el || !canHover()) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    el.style.setProperty('--px', `${px * 100}%`);
    el.style.setProperty('--py', `${py * 100}%`);
    el.style.setProperty('--rx', `${(0.5 - py) * TILT_MAX * 2}deg`);
    el.style.setProperty('--ry', `${(px - 0.5) * TILT_MAX * 2}deg`);
  };

  const handlePointerLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    for (const prop of ['--px', '--py', '--rx', '--ry']) {
      el.style.removeProperty(prop);
    }
  };

  return (
    <div className="scard-stage">
      <article
        ref={cardRef}
        className="scard"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <div className="scard__glare" aria-hidden="true" />
        <div className="scard__img scard__glyph" aria-hidden="true">
          <svg
            viewBox="0 0 120 120"
            width="88"
            height="88"
            fill="none"
            stroke="#ffd04f"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {ICONS[item.icon]}
          </svg>
        </div>
        <h3 className="scard__title">{item.title}</h3>
        <p className="scard__body">{item.body}</p>
      </article>
    </div>
  );
};
