'use client';

import { useEffect, useRef } from 'react';

/**
 * Reveals [data-reveal] blocks as they enter the screen, draws the page progress line
 * and gives the header its edge. The page is complete without any of this.
 */
export function ScrollEffects() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.fxReady = '1';

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }),
      { threshold: 0.14, rootMargin: '0px 0px -6% 0px' }
    );
    document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));

    let frame = 0;
    const update = () => {
      frame = 0;
      const height = root.scrollHeight - window.innerHeight;
      bar.current?.style.setProperty('transform', `scaleX(${height > 0 ? window.scrollY / height : 0})`);
      root.toggleAttribute('data-scrolled', window.scrollY > 12);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <div className="scroll-progress" ref={bar} aria-hidden="true" />;
}
