import React from 'react';
import { TrendingUp, TrendingDown, Package, DollarSign, Users, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  color?: 'indigo' | 'green' | 'blue' | 'purple' | 'orange' | 'red';
}

const colorClasses = {
  indigo: 'bg-indigo-50 text-indigo-600',
  green: 'bg-green-50 text-green-600',
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
  red: 'bg-red-50 text-red-600',
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  color = 'indigo',
}) => {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-neutral-600">{title}</h3>
        <div className={cn('p-3 rounded-lg', colorClasses[color])}>
          {icon}
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl md:text-3xl font-bold text-neutral-900">{value}</p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              {change.isPositive ? (
                <>
                  <TrendingUp size={14} className="text-green-600" />
                  <span className="text-xs text-green-600 font-semibold">
                    +{change.value}%
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown size={14} className="text-red-600" />
                  <span className="text-xs text-red-600 font-semibold">
                    -{change.value}%
                  </span>
                </>
              )}
              <span className="text-xs text-neutral-500">vs last month</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const dashboardStats = {
  user: [
    {
      title: 'Total Orders',
      value: 24,
      icon: <ShoppingCart size={20} />,
      color: 'indigo' as const,
      change: { value: 12, isPositive: true },
    },
    {
      title: 'Total Spent',
      value: '$2,456.00',
      icon: <DollarSign size={20} />,
      color: 'green' as const,
      change: { value: 8, isPositive: true },
    },
  ],
  seller: [
    {
      title: 'Products',
      value: 156,
      icon: <Package size={20} />,
      color: 'blue' as const,
      change: { value: 5, isPositive: true },
    },
    {
      title: 'Total Revenue',
      value: '$54,230',
      icon: <DollarSign size={20} />,
      color: 'green' as const,
      change: { value: 24, isPositive: true },
    },
    {
      title: 'Orders',
      value: 892,
      icon: <ShoppingCart size={20} />,
      color: 'purple' as const,
      change: { value: 15, isPositive: true },
    },
  ],
  admin: [
    {
      title: 'Total Users',
      value: '12,546',
      icon: <Users size={20} />,
      color: 'indigo' as const,
      change: { value: 22, isPositive: true },
    },
    {
      title: 'Total Revenue',
      value: '$456,890',
      icon: <DollarSign size={20} />,
      color: 'green' as const,
      change: { value: 18, isPositive: true },
    },
    {
      title: 'Active Orders',
      value: '3,456',
      icon: <ShoppingCart size={20} />,
      color: 'orange' as const,
      change: { value: 5, isPositive: false },
    },
    {
      title: 'Total Products',
      value: '8,234',
      icon: <Package size={20} />,
      color: 'purple' as const,
      change: { value: 32, isPositive: true },
    },
  ],
};

interface DashboardStatsProps {
  role: 'user' | 'seller' | 'admin';
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ role }) => {
  const stats = dashboardStats[role];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          change={stat.change}
        />
      ))}
    </div>
  );
};

export { StatCard, DashboardStats };
