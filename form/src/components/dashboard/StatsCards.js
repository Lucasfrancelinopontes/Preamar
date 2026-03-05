"use client";

export default function StatsCards({ items = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
      {items.map((it, idx) => (
        <div key={idx} className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500">{it.label}</div>
              <div className={`mt-3 text-2xl font-bold ${it.color || 'text-slate-900'}`}>{it.value}</div>
            </div>
            {it.icon && (
              <div className="p-3 rounded-lg" style={{ background: it.iconBg || 'transparent' }}>
                {it.icon}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
