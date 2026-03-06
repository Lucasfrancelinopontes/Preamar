"use client";

export default function StatsCards({ items = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {items.map((it, idx) => (
        <div key={idx} className="bg-white p-4 sm:p-6 rounded-xl shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500">{it.label}</div>
              <div className={`mt-3 text-2xl sm:text-3xl font-bold ${it.color || 'text-slate-900'}`}>{it.value}</div>
            </div>
            {it.icon && (
              <div className="p-2 sm:p-3 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center" style={{ background: it.iconBg || 'transparent' }}>
                {it.icon}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
