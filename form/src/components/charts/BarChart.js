"use client";

export default function BarChart({ labels = [], values = [], height = 200, color = '#0f172a' }) {
  const max = Math.max(...values, 1);
  const barWidth = labels.length > 0 ? Math.floor(100 / labels.length) : 20;

  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full h-48">
      {values.map((v, i) => {
        const h = (v / max) * (height - 20);
        const x = i * barWidth + 2;
        const y = height - h - 20;
        return (
          <g key={i}>
            <rect x={`${x}%`} y={y} width={`${barWidth - 4}%`} height={h} rx="6" fill={color} />
            <text x={`${x + (barWidth - 4) / 2}%`} y={height - 4} fontSize="3" fill="#334155" textAnchor="middle">{labels[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}
