import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GoldButton } from './GoldButton';

interface CarouselProps {
  slides: React.ReactNode[];
  label: string;
  className?: string;
}

export const Carousel: React.FC<CarouselProps> = ({ slides, label, className = '' }) => {
  const containerRef = useRef<HTMLUListElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [maxIdx, setMaxIdx] = useState(slides.length);

  const calculatePagination = useCallback(() => {
    const list = containerRef.current;
    const firstChild = list?.firstElementChild as HTMLElement | null;
    if (!list || !firstChild) return;

    const childWidth = firstChild.offsetWidth;
    const visibleCount = Math.max(1, Math.round(list.clientWidth / childWidth));
    const totalSlides = Math.max(1, slides.length - visibleCount + 1);
    setMaxIdx(totalSlides);
    setActiveIdx(Math.max(0, Math.min(Math.round(list.scrollLeft / childWidth), slides.length - visibleCount)));
  }, [slides.length]);

  useEffect(() => {
    calculatePagination();
    const list = containerRef.current;
    if (!list) return;
    const ro = new ResizeObserver(calculatePagination);
    ro.observe(list);
    return () => ro.disconnect();
  }, [calculatePagination]);

  const scrollToSlide = (index: number) => {
    const list = containerRef.current;
    const firstChild = list?.firstElementChild as HTMLElement | null;
    if (!list || !firstChild) return;
    const bounded = Math.max(0, Math.min(index, maxIdx - 1));
    list.scrollTo({
      left: bounded * firstChild.offsetWidth,
      behavior: 'smooth',
    });
  };

  return (
    <div
      className={`relative ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <ul
        ref={containerRef}
        className="scarousel"
        tabIndex={0}
        onScroll={calculatePagination}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') scrollToSlide(activeIdx + 1);
          if (e.key === 'ArrowLeft') scrollToSlide(activeIdx - 1);
        }}
        aria-live="polite"
      >
        {slides.map((slide, idx) => (
          <li key={idx} className="scarousel__slide">
            {slide}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-center gap-5">
        <GoldButton
          type="button"
          className="scarousel__arrow"
          onClick={() => scrollToSlide(activeIdx - 1)}
          disabled={activeIdx <= 0}
          aria-label={`Previous ${label}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M15 5l-7 7 7 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </GoldButton>

        <div className="flex gap-2">
          {Array.from({ length: maxIdx }, (_, idx) => (
            <button
              key={idx}
              type="button"
              className="scarousel__dot"
              data-active={idx === activeIdx}
              onClick={() => scrollToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={idx === activeIdx}
            />
          ))}
        </div>

        <GoldButton
          type="button"
          className="scarousel__arrow"
          onClick={() => scrollToSlide(activeIdx + 1)}
          disabled={activeIdx >= maxIdx - 1}
          aria-label={`Next ${label}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 5l7 7-7 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </GoldButton>
      </div>
    </div>
  );
};
