import React from 'react';

const ProgressBar = ({ current, total }) => {
  const percentage = Math.round((current / total) * 100);
  
  return (
    <div style={{ marginBottom: '2.5rem', padding: '0 3.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Question {current} of {total}
        </span>
        <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>
          {percentage}% Completed
        </span>
      </div>
      <div style={{ width: '100%', height: '10px', backgroundColor: '#F3F4F6', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
        <div 
          style={{ 
            height: '100%', 
            width: `${percentage}%`, 
            background: 'linear-gradient(90deg, var(--primary) 0%, var(--primary) 100%)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
          }} 
        />
      </div>
    </div>
  );
};

export default ProgressBar;
