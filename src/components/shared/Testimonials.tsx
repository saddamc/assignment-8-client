import React from 'react';
import { Star, Quote } from 'lucide-react';
import Image from 'next/image';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  content: string;
  rating: number;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
}

const Testimonials: React.FC<TestimonialsProps> = ({ testimonials }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {testimonials.map((testimonial) => (
        <div
          key={testimonial.id}
          className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
        >
          {/* Rating */}
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}
              />
            ))}
          </div>

          {/* Quote */}
          <div className="relative mb-6 flex-1">
            <Quote size={24} className="text-indigo-200 mb-2" />
            <p className="text-neutral-700 text-sm md:text-base leading-relaxed">
              {testimonial.content}
            </p>
          </div>

          {/* Author */}
          <div className="flex items-center gap-3 pt-4 border-t border-neutral-200">
            {testimonial.avatar && (
              <Image
                src={testimonial.avatar}
                alt={testimonial.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div>
              <p className="font-semibold text-neutral-900 text-sm">{testimonial.name}</p>
              <p className="text-neutral-500 text-xs">{testimonial.role}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Testimonials;
