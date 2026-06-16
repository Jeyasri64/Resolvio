import { stats } from '../data/landingData.js';
import { useEffect, useRef, useState } from 'react';

const animationDuration = 1300;

function getAnimatedValue(value, progress) {
  const match = value.match(/^(\d+)(.*)$/);

  if (!match) {
    return value;
  }

  const [, number, suffix] = match;
  const currentValue = Math.round(Number(number) * progress);

  return `${currentValue}${suffix}`;
}

function Statistics() {
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (shouldReduceMotion) {
      setProgress(1);
      return undefined;
    }

    const section = sectionRef.current;
    let animationFrame;

    const animate = () => {
      cancelAnimationFrame(animationFrame);
      setProgress(0);

      const startTime = performance.now();

      const tick = (time) => {
        const elapsed = time - startTime;
        const nextProgress = Math.min(elapsed / animationDuration, 1);
        const easedProgress = 1 - Math.pow(1 - nextProgress, 3);

        setProgress(easedProgress);

        if (nextProgress < 1) {
          animationFrame = requestAnimationFrame(tick);
        }
      };

      animationFrame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
        } else {
          cancelAnimationFrame(animationFrame);
          setProgress(0);
        }
      },
      { threshold: 0.35 },
    );

    if (section) {
      observer.observe(section);
    }

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <section className="stats-band" id="stats" ref={sectionRef}>
      {stats.map((stat, index) => (
        <div className="stat-item reveal" style={{ animationDelay: `${index * 80}ms` }} key={stat.label}>
          <strong>{getAnimatedValue(stat.value, progress)}</strong>
          <span>{stat.label}</span>
        </div>
      ))}
    </section>
  );
}

export default Statistics;
