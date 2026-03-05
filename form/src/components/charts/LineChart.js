"use client";

export default function LineChart({ labels = [], values = [], height = 200, color = '#059669' }) {
  const max = Math.max(...values, 1);
  const stepX = labels.length > 1 ? 100 / (labels.length - 1) : 100;

  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v / max) * (height - 20)) - 20;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full h-48">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => {
        const x = i * stepX;
        const y = height - ((v / max) * (height - 20)) - 20;
        return <circle key={i} cx={`${x}%`} cy={y} r="1.8" fill={color} />;
      })}
      {labels.map((lab, i) => (
        <text key={i} x={`${i * stepX}%`} y={height - 4} fontSize="3" fill="#334155" textAnchor="middle">{lab}</text>
      ))}
    </svg>
  );
}
