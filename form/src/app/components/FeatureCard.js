use client

export default function FeatureCard({ title, subtitle, onClick, icon }) {
  return (
    <button onClick={onClick} className="card hover:shadow-2xl transition-all group cursor-pointer border-l-4 border-brand-light p-4 rounded-md bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand/10 rounded-lg group-hover:bg-brand/20 transition-all">
            {icon ? icon : (
              <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
            )}
          </div>
          <div className="text-left">
            <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        <svg className="w-6 h-6 text-gray-400 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </div>
    </button>
  );
}
