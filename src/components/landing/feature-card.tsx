'use client';

import { type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  visual: ReactNode;
  className?: string;
  badge?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  visual,
  className = '',
  badge,
}: FeatureCardProps) {
  const prefersReducedMotion = useReducedMotion();

  const Wrapper = prefersReducedMotion ? 'div' : motion.div;
  const wrapperProps = prefersReducedMotion
    ? {}
    : {
        whileHover: { y: -4 },
        transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
      };

  return (
    <Wrapper
      className={`rounded-2xl border bg-card overflow-hidden group cursor-default ${className}`}
      {...wrapperProps}
    >
      {/* Visual area */}
      <div className="relative h-40 bg-muted/50 flex items-center justify-center overflow-hidden">
        {visual}
        {badge && (
          <span className="absolute top-3 right-3 text-[10px] font-mono font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>

      {/* Content area */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <h3 className="font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </Wrapper>
  );
}
