import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RiskGauge from '../components/RiskGauge';
import { getUserHistory } from '../api/client';
import Layout from '../components/Layout';
import { ArrowLeft, Award } from 'lucide-react';

const Results = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const sessionId = localStorage.getItem('sessionId');
    
    if (!userId || !sessionId) {
      navigate('/');
      return;
    }

    const fetchResult = async () => {
      try {
        const historyRes = await getUserHistory(userId);
        setProfile(historyRes.profile || {});
        const session = historyRes.sessions.find(s => s.session_id === sessionId);
        if (session && session.scores) {
          setResult(session.scores);
        } else {
          alert("Scores not found for this session.");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('userId');
    navigate('/auth');
  };

  if (loading) return (
    <Layout userName="Loading..." onLogout={handleLogout}>
      <div style={{ display: 'flex', height: '50vh', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{color: 'var(--text-secondary)'}}>Loading your results...</p>
      </div>
    </Layout>
  );

  if (!result) return (
    <Layout userName={profile.name || 'User'} onLogout={handleLogout}>
      <div style={{ display: 'flex', height: '50vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>Could not load results.</p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
      </div>
    </Layout>
  );

  return (
    <Layout userName={profile.name || 'User'} onLogout={handleLogout}>
      <div style={{ marginBottom: '24px' }}>
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: 0, fontSize: '0.9rem', fontWeight: 500 }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>
      
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #FDE047 0%, #F59E0B 100%)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.3)', animation: 'popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
            <Award size={40} color="white" />
          </div>
          <h2 style={{ textAlign: 'center', color: 'var(--text-primary)', margin: 0, fontSize: '2rem', fontWeight: 800 }}>Assessment Complete!</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Thank you for completing the Early Dementia Detection Platform evaluation.</p>
        </div>
        
        <RiskGauge score={result.combined_risk} />
        
        <div style={{ background: 'var(--primary-light)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Cognitive Domain Breakdown</h3>
          
          {Object.entries(result.domain_breakdown).map(([domain, score]) => (
            <div key={domain} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 500, textTransform: 'capitalize' }}>
                <span>{domain}</span>
                <span>{Math.round(score * 100)}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#E5E7EB', borderRadius: 'var(--radius-full)' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${score * 100}%`, 
                    backgroundColor: score > 0.6 ? '#16A34A' : (score > 0.4 ? '#CA8A04' : '#DC2626'),
                    borderRadius: 'var(--radius-full)'
                  }} 
                />
              </div>
            </div>
          ))}
        </div>

        {result.speech_domain_breakdown && Object.keys(result.speech_domain_breakdown).length > 0 && (
          <div style={{ background: 'var(--risk-low-bg)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-green)' }}>Speech Domain Breakdown</h3>
            
            {Object.entries(result.speech_domain_breakdown).map(([domain, score]) => (
              <div key={domain} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 500, textTransform: 'capitalize' }}>
                  <span>{domain}</span>
                  <span>{Math.round(score * 100)}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#E5E7EB', borderRadius: 'var(--radius-full)' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${score * 100}%`, 
                      backgroundColor: score > 0.6 ? '#16A34A' : (score > 0.4 ? '#CA8A04' : '#DC2626'),
                      borderRadius: 'var(--radius-full)'
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: '1rem', borderLeft: '4px solid #CA8A04', background: '#FEF3C7', color: '#92400E', borderRadius: 'var(--radius-md)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          <strong>Disclaimer:</strong> This is a screening tool based on mock models and is not a clinical diagnosis. Please consult a medical professional for accurate medical advice.
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/history')}>
            View History
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Take Test Again
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Results;

