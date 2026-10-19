import React, { useEffect, useRef } from 'react';

interface ActiveButton {
  el: HTMLElement;
  proximity: number;
}

const activeButtons = new Set<ActiveButton>();
let isListening = false;
let mousePos = { x: 0, y: 0 };
let rafId = 0;

const updateButtons = () => {
  rafId = 0;
  for (const item of activeButtons) {
    const { el, proximity } = item;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.hypot(mousePos.x - cx, mousePos.y - cy);
    const maxDist = Math.max(rect.width, rect.height) / 2 + proximity;
    const shine = Math.max(0, 1 - dist / maxDist);

    if (dist > maxDist + 60) {
      el.style.setProperty('--shine', '0');
      continue;
    }

    const angle = (Math.atan2(mousePos.x - cx, cy - mousePos.y) * 180) / Math.PI;
    el.style.setProperty('--angle', `${angle - 20}deg`);
    el.style.setProperty('--shine', shine.toFixed(3));

    const mx = Math.min(100, Math.max(0, ((mousePos.x - rect.left) / rect.width) * 100));
    const my = Math.min(100, Math.max(0, ((mousePos.y - rect.top) / rect.height) * 100));
    el.style.setProperty('--mx', `${mx}%`);
    el.style.setProperty('--my', `${my}%`);
  }
};

const handlePointerMove = (e: PointerEvent) => {
  mousePos = { x: e.clientX, y: e.clientY };
  if (!rafId) rafId = requestAnimationFrame(updateButtons);
};

const registerButton = (btn: ActiveButton) => {
  activeButtons.add(btn);
  if (!isListening) {
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    isListening = true;
  }
  return () => {
    activeButtons.delete(btn);
    if (activeButtons.size === 0) {
      window.removeEventListener('pointermove', handlePointerMove);
      isListening = false;
    }
  };
};

export interface GoldButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  proximity?: number;
  className?: string;
  target?: string;
  rel?: string;
}

export const GoldButton: React.FC<GoldButtonProps> = ({
  children,
  href,
  className = '',
  proximity = 220,
  target,
  rel,
  ...props
}) => {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) {
      return registerButton({ el, proximity });
    }
  }, [proximity]);

  const cls = `sbtn ${className}`;
  const content = <span className="sbtn__label">{children}</span>;

  if (href) {
    return (
      <a ref={ref} href={href} className={cls} target={target} rel={rel}>
        {content}
      </a>
    );
  }

  return (
    <button ref={ref} type={props.type ?? 'button'} className={cls} {...props}>
      {content}
    </button>
  );
};
