import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
}

export function Card({ title, value, icon, trend }: CardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <div className="text-gray-400">{icon}</div>
      </div>
      <div className="flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {trend && (
          <p
            className={`ml-2 flex items-baseline text-sm font-semibold ${
              trend.value >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.value >= 0 ? '+' : ''}
            {trend.value}%
            <span className="ml-1 text-gray-500">{trend.label}</span>
          </p>
        )}
      </div>
    </div>
  );
}