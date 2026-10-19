import React, { useEffect, useRef, useState } from 'react';

const formatNumber = (num: number, decimals: number) =>
  num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

interface StatCounterProps {
  to: number;
  decimals?: number;
  suffix?: string;
  cycle?: number;
  duration?: number;
  className?: string;
}

export const StatCounter: React.FC<StatCounterProps> = ({
  to,
  decimals = 0,
  suffix = '',
  cycle = 5000,
  duration = 1800,
  className,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(to);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let rafId = 0;
    let startTime = 0;
    let isIntersecting = false;

    const animate = (now: number) => {
      const elapsed = (now - startTime) % cycle;
      const progress = 1 - Math.pow(1 - Math.min(1, elapsed / duration), 3);
      setVal(to * progress);
      rafId = requestAnimationFrame(animate);
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting !== isIntersecting) {
        isIntersecting = entry.isIntersecting;
        cancelAnimationFrame(rafId);
        if (isIntersecting) {
          startTime = performance.now();
          rafId = requestAnimationFrame(animate);
        }
      }
    });

    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [to, cycle, duration]);

  const rounded = decimals
    ? Math.round(val * Math.pow(10, decimals)) / Math.pow(10, decimals)
    : Math.round(val);

  return (
    <span ref={ref} className={className} aria-label={`${formatNumber(to, decimals)}${suffix}`}>
      <span aria-hidden="true" className="tabular-nums">
        {formatNumber(rounded, decimals)}
        {suffix}
      </span>
    </span>
  );
};
