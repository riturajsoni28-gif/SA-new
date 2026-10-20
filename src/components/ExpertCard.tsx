import React, { useRef } from 'react';
import { GoldButton } from './GoldButton';

const canHover = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches;

interface ExpertCardProps {
  name: string;
  role: string;
  image: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export const ExpertCard: React.FC<ExpertCardProps> = ({
  name,
  role,
  image,
  ctaLabel = 'Get in touch',
  ctaHref = '#contact',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const MAX_TILT = 9;

  const handlePointerMove = (e: React.PointerEvent) => {
    const el = cardRef.current;
    if (!el || !canHover()) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const edge = Math.min(1, Math.hypot(px - 0.5, py - 0.5) * 2);

    el.style.setProperty('--px', `${px * 100}%`);
    el.style.setProperty('--py', `${py * 100}%`);
    el.style.setProperty('--rx', `${(0.5 - py) * MAX_TILT * 2}deg`);
    el.style.setProperty('--ry', `${(px - 0.5) * MAX_TILT * 2}deg`);
    el.style.setProperty('--edge', `${edge}`);
  };

  const handlePointerLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    for (const prop of ['--px', '--py', '--rx', '--ry', '--edge']) {
      el.style.removeProperty(prop);
    }
  };

  return (
    <div
      ref={cardRef}
      className="pcard"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="pcard__halo" aria-hidden="true" />
      <article className="pcard__body">
        <div className="pcard__glare" aria-hidden="true" />
        <div className="pcard__rim" aria-hidden="true" />
        <div className="pcard__avatar">
          <img
            src={image}
            alt={`${name} - ${role} at Social Auctus`}
            width={310}
            height={310}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="pcard__text">
          <h3 className="pcard__name">{name}</h3>
          <p className="pcard__role">{role}</p>
        </div>
        <GoldButton className="pcard__cta" href={ctaHref}>
          {ctaLabel}
        </GoldButton>
      </article>
    </div>
  );
};
