import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getUserHistory, createSession } from '../api/client';
import { ClipboardList, Play, Clock, Sparkles } from 'lucide-react';

const Assessments = () => {
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

  const handleTakeTest = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const sessionRes = await createSession({
        user_id: userId,
        age: profile.age || 60,
        education: profile.education || 'high-school'
      });
      localStorage.setItem('sessionId', sessionRes.session_id);
      localStorage.setItem('testFlow', JSON.stringify(sessionRes.test_flow));
      localStorage.removeItem('testAnswers');
      navigate('/test/MMSE');
    } catch (err) {
      console.error(err);
      alert('Error starting session. Make sure backend is running.');
    }
  };

  if (loading) return (
    <Layout userName="Loading..." onLogout={handleLogout}>
      <div style={{ display: 'flex', height: '50vh', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{color: 'var(--text-secondary)'}}>Loading assessments...</p>
      </div>
    </Layout>
  );

  return (
    <Layout userName={profile.name || 'User'} onLogout={handleLogout}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Assessments
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Explore available cognitive and speech testing modules.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Full Battery */}
        <div className="card" style={{ border: '2px solid var(--primary)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-12px', right: '24px', background: 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={14} /> Recommended
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <ClipboardList size={24} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Comprehensive Battery</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.5' }}>
            A complete evaluation combining MMSE, CDR-SB, TOTAL13, and a speech assessment. This provides the most accurate overall risk score.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
            <Clock size={16} /> ~10-15 minutes
          </div>
          <button className="btn btn-primary" onClick={handleTakeTest} style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            <Play size={18} fill="white" />
            Start Full Assessment
          </button>
        </div>

        {/* Cognitive Only (Mock) */}
        <div className="card" style={{ opacity: 0.8 }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <ClipboardList size={24} color="var(--text-secondary)" />
          </div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Cognitive Only</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.5' }}>
            Standard questionnaire covering memory, orientation, and functional abilities. No audio recording required.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
            <Clock size={16} /> ~5-8 minutes
          </div>
          <button className="btn btn-secondary" disabled style={{ width: '100%' }}>
            Coming Soon
          </button>
        </div>

        {/* Speech Only (Mock) */}
        <div className="card" style={{ opacity: 0.8 }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <ClipboardList size={24} color="var(--text-secondary)" />
          </div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Speech Biomarkers</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.5' }}>
            Quick voice analysis focusing entirely on vocal biomarkers like pauses and speech efficiency.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
            <Clock size={16} /> ~2 minutes
          </div>
          <button className="btn btn-secondary" disabled style={{ width: '100%' }}>
            Coming Soon
          </button>
        </div>

      </div>
    </Layout>
  );
};

export default Assessments;

