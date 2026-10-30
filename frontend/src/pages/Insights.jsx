import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getUserHistory } from '../api/client';
import { TrendingUp, Activity, Brain, Clock } from 'lucide-react';

const Insights = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/auth');
      return;
    }

    const fetchHistory = async () => {
      try {
        const historyRes = await getUserHistory(userId);
        setProfile(historyRes.profile || {});
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
        <p style={{color: 'var(--text-secondary)'}}>Loading insights...</p>
      </div>
    </Layout>
  );

  return (
    <Layout userName={profile.name || 'User'} onLogout={handleLogout}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Insights & Trends
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Track your cognitive health over time.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '24px' }}>
        
        {/* Mock Chart Area */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <TrendingUp size={20} color="var(--primary)" />
              Risk Score Trend
            </h2>
            <select style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <option>Past 6 Months</option>
              <option>Past Year</option>
            </select>
          </div>
          
          <div style={{ height: '300px', background: 'var(--bg)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border)' }}>
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Activity size={40} color="var(--border)" style={{ marginBottom: '16px' }} />
              <p>Not enough data to display trend.</p>
              <p style={{ fontSize: '0.85rem' }}>Complete at least two assessments over time.</p>
            </div>
          </div>
        </div>

        {/* Highlighted Insights */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          <div className="card" style={{ display: 'flex', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'var(--primary-light)', borderRadius: '12px', height: 'fit-content' }}>
              <Brain size={24} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>Memory Recall</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Your delayed recall scores are stable. Keep practicing mental exercises.</p>
            </div>
          </div>
          
          <div className="card" style={{ display: 'flex', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'var(--risk-low-bg)', borderRadius: '12px', height: 'fit-content' }}>
              <Clock size={24} color="var(--accent-green)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>Speech Efficiency</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Your speech pattern is fluid. Your pause ratio is well within healthy ranges.</p>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Insights;

