import React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  headingAlignment?: 'left' | 'center';
}

const Section: React.FC<SectionProps> = ({
  title,
  subtitle,
  children,
  className,
  containerClassName,
  headingAlignment = 'center',
}) => {
  return (
    <section className={cn('py-12 md:py-16 lg:py-20', className)}>
      <div className={cn('max-w-7xl mx-auto px-4 md:px-8', containerClassName)}>
        {(title || subtitle) && (
          <div className={cn('mb-12 md:mb-16', headingAlignment === 'center' ? 'text-center' : '')}>
            {title && (
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-3 md:mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export default Section;
