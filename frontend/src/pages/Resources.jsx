import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getUserHistory } from '../api/client';
import { BookOpen, ExternalLink, HeartPulse, Shield, Lightbulb } from 'lucide-react';

const Resources = () => {
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
        <p style={{color: 'var(--text-secondary)'}}>Loading resources...</p>
      </div>
    </Layout>
  );

  return (
    <Layout userName={profile.name || 'User'} onLogout={handleLogout}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Resources & Education
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Learn more about brain health, early detection, and healthy habits.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        <div className="card">
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <HeartPulse size={24} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Brain-Healthy Diet</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.5' }}>
            Discover how the MIND diet and proper nutrition can help protect your brain against cognitive decline.
          </p>
          <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Read Article <ExternalLink size={14} />
          </a>
        </div>

        <div className="card">
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Lightbulb size={24} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Mental Exercises</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.5' }}>
            Engaging your brain with puzzles, reading, and learning new skills helps build cognitive reserve.
          </p>
          <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Learn More <ExternalLink size={14} />
          </a>
        </div>

        <div className="card">
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Shield size={24} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Understanding Early Signs</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.5' }}>
            What is the difference between normal aging and early signs of dementia? Learn what to look for.
          </p>
          <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View Guide <ExternalLink size={14} />
          </a>
        </div>

      </div>

      <div className="card" style={{ marginTop: '32px', background: 'var(--primary)', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <BookOpen size={32} />
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Clinical Resources</h2>
        </div>
        <p style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '24px', opacity: 0.9 }}>
          If you are concerned about your memory or assessment results, we strongly recommend consulting with a healthcare professional. 
          Early diagnosis opens the door to future care and treatment options.
        </p>
        <button className="btn" style={{ background: 'white', color: 'var(--primary)', border: 'none' }}>
          Find a Specialist
        </button>
      </div>

    </Layout>
  );
};

export default Resources;

