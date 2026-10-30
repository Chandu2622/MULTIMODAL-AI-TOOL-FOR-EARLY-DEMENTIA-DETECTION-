import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getUserHistory } from '../api/client';
import { User, Mail, GraduationCap, Calendar as CalendarIcon } from 'lucide-react';

const Profile = () => {
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
        <p style={{color: 'var(--text-secondary)'}}>Loading profile...</p>
      </div>
    </Layout>
  );

  return (
    <Layout userName={profile.name || 'User'} onLogout={handleLogout}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Your Profile
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Manage your personal information and preferences.
        </p>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 600 }}>
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-primary)' }}>{profile.name || 'Unknown User'}</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Patient Profile</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ padding: '10px', background: 'var(--primary-light)', borderRadius: '10px' }}>
              <User size={20} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Full Name</div>
              <div style={{ fontSize: '1rem', fontWeight: 500 }}>{profile.name || 'Not provided'}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ padding: '10px', background: 'var(--primary-light)', borderRadius: '10px' }}>
              <CalendarIcon size={20} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Age</div>
              <div style={{ fontSize: '1rem', fontWeight: 500 }}>{profile.age ? `${profile.age} years old` : 'Not provided'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ padding: '10px', background: 'var(--primary-light)', borderRadius: '10px' }}>
              <GraduationCap size={20} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Education Level</div>
              <div style={{ fontSize: '1rem', fontWeight: 500, textTransform: 'capitalize' }}>{profile.education || 'Not provided'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ padding: '10px', background: 'var(--primary-light)', borderRadius: '10px' }}>
              <User size={20} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Gender</div>
              <div style={{ fontSize: '1rem', fontWeight: 500, textTransform: 'capitalize' }}>{profile.gender || 'Not provided'}</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" disabled>Edit Profile (Coming Soon)</button>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;

