import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  primaryCTA?: {
    text: string;
    onClick: () => void;
  };
  secondaryCTA?: {
    text: string;
    onClick: () => void;
  };
}

const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  backgroundImage,
  primaryCTA,
  secondaryCTA,
}) => {
  return (
    <div
      className="relative w-full h-screen md:h-[80vh] bg-gradient-to-br from-neutral-900 to-neutral-800 overflow-hidden flex items-center justify-center"
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 text-center text-white">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 leading-tight animate-fade-in">
          {title}
        </h1>
        
        {subtitle && (
          <p className="text-lg md:text-2xl text-neutral-200 mb-8 md:mb-12 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {primaryCTA && (
            <Button
              onClick={primaryCTA.onClick}
              variant="default"
              size="lg"
              className="bg-white text-neutral-900 hover:bg-neutral-100"
            >
              {primaryCTA.text}
              <ArrowRight size={20} className="ml-2" />
            </Button>
          )}
          
          {secondaryCTA && (
            <Button
              onClick={secondaryCTA.onClick}
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10"
            >
              {secondaryCTA.text}
            </Button>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default Hero;
