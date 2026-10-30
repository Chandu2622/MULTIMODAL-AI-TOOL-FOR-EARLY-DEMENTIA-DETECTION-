import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserHistory } from '../api/client';
import Layout from '../components/Layout';
import { Calendar, Activity, ArrowLeft } from 'lucide-react';

const History = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/');
      return;
    }

    const fetchHistory = async () => {
      try {
        const historyRes = await getUserHistory(userId);
        setProfile(historyRes.profile || {});
        // Sort newest first
        const sorted = historyRes.sessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setSessions(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('userId');
    navigate('/auth');
  };

  if (loading) return (
    <Layout userName="Loading..." onLogout={handleLogout}>
      <div style={{ display: 'flex', height: '50vh', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{color: 'var(--text-secondary)'}}>Loading history...</p>
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
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: 0 }}>Assessment History</h1>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>New Assessment</button>
      </div>
      
      {sessions.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No past assessments found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sessions.map(session => (
            <div key={session.session_id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  <Calendar size={18} color="var(--primary)" />
                  {new Date(session.timestamp).toLocaleDateString()} at {new Date(session.timestamp).toLocaleTimeString()}
                </div>
                {session.scores && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <Activity size={16} />
                    Combined Risk Score: {Math.round(session.scores.combined_risk * 100)} ({session.scores.risk_label})
                  </div>
                )}
                {!session.scores && (
                  <div style={{ fontSize: '0.9rem', color: '#CA8A04' }}>
                    Incomplete assessment
                  </div>
                )}
              </div>
              
              {session.scores && (
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    localStorage.setItem('sessionId', session.session_id);
                    navigate('/results');
                  }}
                >
                  View Details
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default History;

