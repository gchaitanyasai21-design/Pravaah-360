// src/components/AnimatedCounter.tsx
// PRAVAH 360 - Animated statistic counter
// Counts up to its target when it scrolls into view (respects reduced motion)

"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  /** Final value to count up to. */
  value: number;
  /** Decimal places to display. */
  decimals?: number;
  /** Animation length in milliseconds. */
  duration?: number;
  /** Optional suffix, e.g. "%". */
  suffix?: string;
  /** Optional prefix, e.g. "+". */
  prefix?: string;
  /** Extra classes for the number itself. */
  className?: string;
  /** Accessible label describing the metric. */
  ariaLabel?: string;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function AnimatedCounter({
  value,
  decimals = 0,
  duration = 1400,
  suffix = "",
  prefix = "",
  className = "",
  ariaLabel,
}: AnimatedCounterProps) {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(0);
  const startedRef = useRef(false);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const run = () => {
      if (startedRef.current) return;
      startedRef.current = true;

      if (prefersReducedMotion()) {
        setDisplay(value);
        return;
      }

      const start = performance.now();

      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(value * eased);
        if (progress < 1) {
          frameRef.current = requestAnimationFrame(tick);
        } else {
          setDisplay(value);
        }
      };

      frameRef.current = requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === "undefined") {
      frameRef.current = requestAnimationFrame(() => run());
      return () => {
        if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            run();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(node);

    // Safety net: if the element is jumped past (anchor links, instant
    // scrolling) the observer may never fire — animate anyway.
    const fallback = window.setTimeout(() => {
      run();
      observer.disconnect();
    }, 1200);

    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration]);

  const formatted = display.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span
      ref={containerRef}
      className={className}
      aria-label={ariaLabel ?? `${prefix}${value}${suffix}`}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
