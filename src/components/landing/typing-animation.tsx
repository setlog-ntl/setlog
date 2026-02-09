'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

interface TypingAnimationProps {
  lines: string[];
  typingSpeed?: number;
  lineDelay?: number;
  className?: string;
}

export function TypingAnimation({
  lines,
  typingSpeed = 30,
  lineDelay = 500,
  className,
}: TypingAnimationProps) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [currentCharIdx, setCurrentCharIdx] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setHasStarted(true);
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    if (prefersReducedMotion) {
      setDisplayedLines(lines);
      return;
    }

    if (currentLineIdx >= lines.length) return;

    const currentLine = lines[currentLineIdx];

    if (currentCharIdx < currentLine.length) {
      const timer = setTimeout(() => {
        setDisplayedLines((prev) => {
          const updated = [...prev];
          updated[currentLineIdx] = currentLine.slice(0, currentCharIdx + 1);
          return updated;
        });
        setCurrentCharIdx((c) => c + 1);
      }, typingSpeed);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setCurrentLineIdx((l) => l + 1);
        setCurrentCharIdx(0);
        setDisplayedLines((prev) => [...prev, '']);
      }, lineDelay);
      return () => clearTimeout(timer);
    }
  }, [hasStarted, currentLineIdx, currentCharIdx, lines, typingSpeed, lineDelay, prefersReducedMotion]);

  return (
    <div ref={ref} className={className}>
      {displayedLines.map((line, i) => (
        <div key={i} className="flex">
          <span>{line}</span>
          {i === currentLineIdx && currentLineIdx < lines.length && (
            <span className="animate-pulse ml-0.5">▋</span>
          )}
        </div>
      ))}
    </div>
  );
}
