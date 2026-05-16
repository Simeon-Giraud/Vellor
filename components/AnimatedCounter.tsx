"use client";

import { useEffect, useRef, useState } from "react";

/* Emil skill: animate counting up from 0 to target value.
 * Duration 600ms with ease-out (cubic-bezier(0.23, 1, 0.32, 1)).
 * No spring physics needed — this is a simple decorative number reveal. */

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  duration?: number;
}

export default function AnimatedCounter({
  value,
  suffix = "",
  duration = 600,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = performance.now();
    const isDecimal = value % 1 !== 0;

    function tick(now: number) {
      const elapsed = now - startTime;
      // Custom ease-out curve
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = eased * value;

      setDisplay(isDecimal ? Math.round(current * 10) / 10 : Math.round(current));

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    }

    requestAnimationFrame(tick);
  }, [value, duration]);

  const formatted = typeof display === "number" && display >= 1000
    ? display.toLocaleString()
    : display;

  return (
    <span ref={ref}>
      {formatted}{suffix}
    </span>
  );
}
