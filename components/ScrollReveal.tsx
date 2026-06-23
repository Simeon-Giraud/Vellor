"use client";

import { useEffect } from "react";

/**
 * ScrollReveal — lightweight IntersectionObserver watcher.
 * Adds `is-visible` class to any element with a reveal class
 * (.bento-card, .pricing-card, .geo-reveal) when it enters the viewport.
 * Must be rendered once in the page. No props required.
 */
export function ScrollReveal() {
  useEffect(() => {
    const selectors = [".bento-card", ".pricing-card", ".geo-reveal"];
    const elements = document.querySelectorAll<HTMLElement>(selectors.join(","));

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // Apply stagger based on sibling index within the parent
            const siblings = entry.target.parentElement
              ? Array.from(entry.target.parentElement.children)
              : [];
            const index = siblings.indexOf(entry.target);
            (entry.target as HTMLElement).style.transitionDelay = `${index * 80}ms`;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target); // fire once only
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}
