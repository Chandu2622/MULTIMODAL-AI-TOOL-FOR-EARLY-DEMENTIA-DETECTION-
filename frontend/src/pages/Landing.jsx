import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, ShieldCheck, Clock } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="container fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
      <div style={{ background: 'var(--primary)', color: 'white', padding: '1rem', borderRadius: '50%', marginBottom: '2rem' }}>
        <BrainCircuit size={64} />
      </div>
      
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
        Cognitive Health Assessment
      </h1>
      
      <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '3rem' }}>
        A self-administered early detection platform. Complete our interactive screening to receive insights into your cognitive well-being.
      </p>

      <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div className="card" style={{ padding: '1.5rem', width: '250px' }}>
          <Clock size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h3>10-15 Minutes</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Quick and easy to complete at your own pace.</p>
        </div>
        <div className="card" style={{ padding: '1.5rem', width: '250px' }}>
          <ShieldCheck size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h3>Private & Secure</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Your results are stored locally and confidentially.</p>
        </div>
      </div>

      <button className="btn btn-primary" style={{ fontSize: '1.25rem', padding: '1rem 3rem' }} onClick={() => navigate('/auth')}>
        Login or Sign Up
      </button>
    </div>
  );
};

export default Landing;

