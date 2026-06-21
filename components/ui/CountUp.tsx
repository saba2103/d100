"use client";

import React, { useEffect, useRef } from "react";
import { useMotionValue, useTransform, animate } from "framer-motion";

interface CountUpProps {
  value: number;
  duration?: number; // duration in seconds
  formatter?: (val: number) => string;
  className?: string;
}

export function CountUp({
  value,
  duration = 0.6,
  formatter = (x: number) => String(Math.round(x)),
  className,
}: CountUpProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => formatter(latest));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Animate count-up from 0 to target value on page mount
    const controls = animate(count, value, {
      duration,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [value, duration, count]);

  useEffect(() => {
    return rounded.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = String(latest);
      }
    });
  }, [rounded]);

  return <span ref={ref} className={className}>0</span>;
}
