import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, X } from 'lucide-react';
import { loginUser, forgotPassword, verifyOtp, resetPassword } from '../api/client';

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Pass
  const [forgotData, setForgotData] = useState({
    email: '',
    otp: '',
    newPassword: ''
  });
  const [forgotMsg, setForgotMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleForgotChange = (e) => {
    setForgotData({ ...forgotData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await loginUser({ email: formData.email, password: formData.password });
      localStorage.setItem('token', data.access_token);
      navigate('/dashboard');
    } catch (err) {
      try {
        const parsed = JSON.parse(err.message);
        setError(parsed.detail || 'An error occurred');
      } catch {
        setError(err.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotFlow = async (e) => {
    e.preventDefault();
    setLoading(true);
    setForgotMsg('');
    setError('');
    
    try {
      if (forgotStep === 1) {
        await forgotPassword(forgotData.email);
        setForgotMsg('If the email is registered, an OTP has been sent. Please check your logs.');
        setForgotStep(2);
      } else if (forgotStep === 2) {
        await verifyOtp(forgotData.email, forgotData.otp);
        setForgotStep(3);
      } else if (forgotStep === 3) {
        await resetPassword(forgotData.email, forgotData.otp, forgotData.newPassword);
        setForgotMsg('Password reset successfully! You can now login.');
        setTimeout(() => {
          setShowForgotModal(false);
          setForgotStep(1);
          setForgotMsg('');
        }, 2000);
      }
    } catch (err) {
      try {
        const parsed = JSON.parse(err.message);
        setError(parsed.detail || 'An error occurred');
      } catch {
        setError(err.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #F0F9FF 0%, #BAE6FD 100%)' }}>
      <div className="card slide-up" style={{ width: '100%', maxWidth: '450px', padding: '3rem', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ background: 'var(--primary)', color: 'white', padding: '1rem', borderRadius: '50%', display: 'inline-block', marginBottom: '1rem' }}>
            <BrainCircuit size={48} />
          </div>
          <h2 style={{ color: 'var(--primary)', margin: 0, fontSize: '2rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Sign in to continue</p>
        </div>

        {error && !showForgotModal && <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 500 }}>{error}</div>}

        <form onSubmit={handleLoginSubmit}>
          <div className="mb-4">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email Address</label>
            <input 
              required type="email" name="email" 
              className="input-field" 
              value={formData.email} onChange={handleChange}
              placeholder="you@example.com"
            />
          </div>
          
          <div className="mb-2">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Password</label>
            <input 
              required type="password" name="password" 
              className="input-field" 
              value={formData.password} onChange={handleChange}
              placeholder="••••••••"
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
            <button type="button" onClick={() => {setShowForgotModal(true); setError(''); setForgotMsg('');}} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}>Forgot Password?</button>
          </div>
          
          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ padding: '1rem', borderRadius: '50px', fontSize: '1.1rem' }}>
            {loading ? 'Processing...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', paddingTop: '1.5rem', borderTop: '1px solid #E5E7EB' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Don't have an account?{' '}
            <button 
              type="button" 
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700, padding: 0 }}
              onClick={() => navigate('/onboarding')}
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div className="card slide-up" style={{ width: '100%', maxWidth: '400px', padding: '2rem', borderRadius: '24px', position: 'relative' }}>
            <button onClick={() => setShowForgotModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <X size={24} />
            </button>
            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--primary)', fontSize: '1.5rem' }}>Reset Password</h3>
            
            {error && showForgotModal && <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
            {forgotMsg && <div style={{ background: '#D1FAE5', color: '#065F46', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>{forgotMsg}</div>}
            
            <form onSubmit={handleForgotFlow}>
              {forgotStep === 1 && (
                <div className="mb-4">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Enter your registered email</label>
                  <input required type="email" name="email" className="input-field" value={forgotData.email} onChange={handleForgotChange} placeholder="you@example.com" />
                </div>
              )}
              {forgotStep === 2 && (
                <div className="mb-4">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Enter the 6-digit OTP sent to {forgotData.email}</label>
                  <input required type="text" name="otp" className="input-field" value={forgotData.otp} onChange={handleForgotChange} placeholder="123456" maxLength={6} style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.5rem', fontWeight: 600 }} />
                </div>
              )}
              {forgotStep === 3 && (
                <div className="mb-4">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Enter your new password</label>
                  <input required type="password" name="newPassword" className="input-field" value={forgotData.newPassword} onChange={handleForgotChange} placeholder="Min 8 characters" minLength={8} />
                </div>
              )}
              <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ padding: '0.75rem' }}>
                {loading ? 'Processing...' : (forgotStep === 1 ? 'Send OTP' : forgotStep === 2 ? 'Verify OTP' : 'Reset Password')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;

