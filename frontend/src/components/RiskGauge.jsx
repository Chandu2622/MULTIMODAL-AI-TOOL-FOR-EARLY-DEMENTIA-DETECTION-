import React from 'react';

const RiskGauge = ({ score }) => {
  // Score is 0 to 1, map to 0 to 100
  const percentage = Math.round(score * 100);
  
  let color = '#16A34A'; // Low risk
  let label = 'Low Risk';
  if (score > 0.33) {
    color = '#CA8A04'; // Moderate
    label = 'Moderate Risk';
  }
  if (score > 0.66) {
    color = '#DC2626'; // High
    label = 'High Risk';
  }

  // SVG Circular progress arc
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score * circumference);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '2rem 0' }}>
      <div style={{ position: 'relative', width: '200px', height: '200px' }}>
        <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle 
            cx="100" cy="100" r={radius} 
            fill="transparent" 
            stroke="#E5E7EB" 
            strokeWidth="16" 
          />
          {/* Progress circle */}
          <circle 
            cx="100" cy="100" r={radius} 
            fill="transparent" 
            stroke={color} 
            strokeWidth="16" 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{percentage}</span>
        </div>
      </div>
      <div style={{ marginTop: '1rem', fontSize: '1.5rem', fontWeight: 600, color }}>
        {label}
      </div>
    </div>
  );
};

export default RiskGauge;
