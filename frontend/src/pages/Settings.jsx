import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getUserHistory } from '../api/client';
import { Bell, Moon, Shield, Key } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);

  // Mock settings state
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

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

  const Toggle = ({ checked, onChange }) => (
    <div 
      onClick={onChange}
      style={{ 
        width: '44px', height: '24px', 
        background: checked ? 'var(--primary)' : '#E5E7EB',
        borderRadius: '12px', position: 'relative', cursor: 'pointer',
        transition: 'background 0.3s'
      }}
    >
      <div style={{
        position: 'absolute', top: '2px', left: checked ? '22px' : '2px',
        width: '20px', height: '20px', background: 'white', borderRadius: '50%',
        transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }} />
    </div>
  );

  if (loading) return (
    <Layout userName="Loading..." onLogout={handleLogout}>
      <div style={{ display: 'flex', height: '50vh', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{color: 'var(--text-secondary)'}}>Loading settings...</p>
      </div>
    </Layout>
  );

  return (
    <Layout userName={profile.name || 'User'} onLogout={handleLogout}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Manage your account preferences and security.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '24px', maxWidth: '800px' }}>
        
        {/* Notifications */}
        <div className="card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Bell size={20} color="var(--primary)" />
            Notifications
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500 }}>Email Notifications</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Receive assessment reminders via email.</div>
              </div>
              <Toggle checked={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} />
            </div>
            <div style={{ height: '1px', background: 'var(--border)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500 }}>SMS Notifications</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Get text message alerts for new insights.</div>
              </div>
              <Toggle checked={smsNotifs} onChange={() => setSmsNotifs(!smsNotifs)} />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Moon size={20} color="var(--primary)" />
            Appearance
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Dark Mode</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Switch to a dark theme. (Coming Soon)</div>
            </div>
            <Toggle checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
          </div>
        </div>

        {/* Security */}
        <div className="card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Shield size={20} color="var(--primary)" />
            Security & Privacy
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content' }}>
              <Key size={16} /> Change Password
            </button>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Your data is encrypted and securely stored. Review our Privacy Policy for more information on how we protect your health data.
            </p>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Settings;

