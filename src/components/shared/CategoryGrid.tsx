import React from 'react';
import { cn } from '@/lib/utils';

interface CategoryGridProps {
  categories: Array<{
    id: string;
    name: string;
    icon: React.ReactNode;
    count?: number;
    image?: string;
  }>;
  onCategoryClick?: (id: string) => void;
  columns?: 2 | 3 | 4 | 5 | 6;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  onCategoryClick,
  columns = 4,
}) => {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  };

  return (
    <div className={cn('grid gap-4 md:gap-6', gridCols[columns])}>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryClick?.(category.id)}
          className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 aspect-square flex flex-col items-center justify-center text-center cursor-pointer"
        >
          {/* Background Image */}
          {category.image && (
            <div
              className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-300"
              style={{ backgroundImage: `url(${category.image})` }}
            >
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
            </div>
          )}

          {/* Content */}
          <div className={cn(
            'relative z-10 flex flex-col items-center justify-center gap-2 p-4',
            category.image && 'text-white'
          )}>
            <div className="text-4xl md:text-5xl">{category.icon}</div>
            <h3 className="font-semibold text-sm md:text-base">{category.name}</h3>
            {category.count && (
              <p className="text-xs opacity-75">{category.count} items</p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export default CategoryGrid;
