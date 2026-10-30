import React from 'react';

const LikertScale = ({ question, name, value, onChange }) => {
  const options = [
    { value: 0, label: 'Never' },
    { value: 1, label: 'Rarely' },
    { value: 2, label: 'Sometimes' },
    { value: 3, label: 'Often' },
    { value: 4, label: 'Always' },
  ];

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 500 }}>{question}</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        {options.map((opt) => (
          <label 
            key={opt.value}
            style={{ 
              flex: 1, 
              minWidth: '100px',
              textAlign: 'center', 
              padding: '1rem 0.5rem', 
              border: '2px solid',
              borderColor: value === opt.value ? 'var(--primary)' : '#E5E7EB',
              background: value === opt.value ? 'var(--primary-light)' : 'white',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <input 
              type="radio" 
              name={name} 
              value={opt.value} 
              checked={value === opt.value}
              onChange={() => onChange(name, opt.value)}
              style={{ display: 'none' }}
            />
            <div style={{ fontSize: '1.2rem', fontWeight: value === opt.value ? 700 : 400, color: value === opt.value ? 'var(--primary)' : 'var(--text-primary)' }}>
              {opt.label}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default LikertScale;
