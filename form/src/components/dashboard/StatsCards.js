"use client";

import { Anchor, TrendingUp, Fish, Ship, Users, DollarSign } from 'lucide-react';

const iconMap = {
  '📊': Anchor,
  '💰': DollarSign,
  '⚖️': Fish,
  '👥': Users,
  '🚢': Ship,
  '📈': TrendingUp,
};

const colorMap = {
  '📊': '#0B3B60',
  '💰': '#00A896',
  '⚖️': '#FF6B35',
  '👥': '#28A745',
  '🚢': '#5A7A92',
  '📈': '#DC3545',
};

export default function StatsCards({ items = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {items.map((item, index) => {
        const IconComponent = iconMap[item.icon] || Anchor;
        const color = item.color || colorMap[item.icon] || '#0B3B60';

        return (
          <div key={index} className="bg-white rounded-xl border shadow-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <IconComponent className="w-6 h-6" style={{ color }} />
                </div>
              </div>
              <p className="text-sm text-[#5A7A92] mb-1">{item.label}</p>
              <h2 className="text-[#0B3B60] text-2xl font-semibold">{item.value}</h2>
            </div>
          </div>
        );
      })}
    </div>
  );
}
