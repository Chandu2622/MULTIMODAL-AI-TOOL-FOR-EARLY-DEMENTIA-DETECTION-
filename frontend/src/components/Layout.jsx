import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Brain, Home, ClipboardList, BarChart2, History as HistoryIcon, 
  Lightbulb, BookOpen, User, Settings, Headphones, Bell, ChevronDown 
} from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: ClipboardList, label: 'Assessments', path: '/assessments' },
  { icon: BarChart2, label: 'Results', path: '/results' },
  { icon: HistoryIcon, label: 'History', path: '/history' },
  { icon: Lightbulb, label: 'Insights', path: '/insights' },
  { icon: BookOpen, label: 'Resources', path: '/resources' },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Settings, label: 'Settings', path: '/settings' }
];

const Layout = ({ children, userName = "Chandu", onLogout }) => {
  const [showNotif, setShowNotif] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const userInitials = userName ? userName.charAt(0).toUpperCase() : 'U';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-family)' }}>
      {/* Sidebar */}
      <div style={{ 
        width: '260px', 
        position: 'fixed', 
        left: 0, 
        top: 0, 
        bottom: 0, 
        background: 'white', 
        borderRight: `1px solid var(--border)`,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100
      }}>
        <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Brain size={32} color="var(--primary)" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Early Dementia Detection Platform</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Early Detection. Better Tomorrow.</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active' : ''}`
              }
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 500,
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                transition: 'all 0.2s'
              })}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '20px' }}>
          <div style={{ 
            background: 'var(--primary-light)', 
            borderRadius: '12px', 
            padding: '16px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            textAlign: 'center',
            gap: '12px'
          }}>
            <div style={{ background: 'white', padding: '8px', borderRadius: '50%' }}>
              <Headphones size={20} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.9rem' }}>Need Help?</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>We're here for you.</div>
            </div>
            <button className="btn btn-secondary" style={{ width: '100%', padding: '8px', fontSize: '0.85rem' }}>
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <header style={{ 
          height: '70px', 
          background: 'white', 
          borderBottom: `1px solid var(--border)`,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 90
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotif(!showNotif)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative' }}
              >
                <Bell size={20} color="var(--text-secondary)" />
                <span style={{ 
                  position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', 
                  background: 'var(--risk-high-text)', borderRadius: '50%' 
                }}></span>
              </button>
              {showNotif && (
                <div style={{ position: 'absolute', top: '100%', right: '-10px', marginTop: '12px', width: '250px', background: 'white', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', zIndex: 100, padding: '16px' }}>
                  <h4 style={{ margin: 0, marginBottom: '8px', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Notifications</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>You're all caught up! No new notifications.</p>
                </div>
              )}
            </div>
            <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>
            
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
              >
                <div style={{ 
                  width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', 
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600
                }}>
                  {userInitials}
                </div>
                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{userName}</div>
                <ChevronDown size={16} color="var(--text-secondary)" />
              </div>

              {showProfileMenu && (
                <div style={{ 
                  position: 'absolute', top: '100%', right: '0', marginTop: '12px', width: '200px', 
                  background: 'white', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', 
                  zIndex: 100, padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px'
                }}>
                  <NavLink to="/profile" style={{ textDecoration: 'none', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }} className="profile-menu-item">
                    <User size={16} /> My Profile
                  </NavLink>
                  <button 
                    onClick={onLogout}
                    style={{ background: 'transparent', border: 'none', color: 'var(--risk-high-text)', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: '1rem', transition: 'background 0.2s' }}
                    className="profile-menu-item"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '32px' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
