"use client";

export default function StatsCards({ items = [], temaEscuro = false }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {items.map((it, idx) => (
        <div key={idx} className={`p-6 rounded-xl shadow-lg border backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-105 ${temaEscuro ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50' : 'bg-white/70 border-white/50 hover:bg-white/90'}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-sm font-medium ${temaEscuro ? 'text-slate-400' : 'text-slate-600'}`}>{it.label}</div>
              <div className={`mt-2 text-2xl font-bold ${it.color || (temaEscuro ? 'text-white' : 'text-slate-900')}`}>{it.value}</div>
            </div>
            {it.icon && (
              <div className={`p-3 rounded-lg ${temaEscuro ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                <span className="text-2xl">{it.icon}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
