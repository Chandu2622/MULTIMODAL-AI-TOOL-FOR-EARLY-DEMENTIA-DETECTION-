import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Shield, Phone, HeartPulse, ArrowRight, ArrowLeft } from 'lucide-react';
import { registerUser, updateProfile, getMe } from '../api/client';

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Check if already logged in (skip step 1)
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await getMe();
          setStep(2);
        } catch (err) {
          localStorage.removeItem('token');
          setStep(1);
        }
      }
    };
    checkToken();
  }, []);
  
  const [formData, setFormData] = useState({
    // Step 1: Credentials
    email: '',
    password: '',
    confirmPassword: '',
    // Step 2: Personal & Health
    name: '',
    age: '',
    gender: 'prefer-not-to-say',
    education: 'high-school',
    language: 'English',
    memoryConcerns: 'none',
    // Step 3: Emergency
    emergencyName: '',
    emergencyContact: '',
    // Step 4: Consent
    consent: false
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleNext = async () => {
    setError('');
    
    if (step === 1) {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }
      setLoading(true);
      try {
        const data = await registerUser({ email: formData.email, password: formData.password });
        localStorage.setItem('token', data.access_token);
        setStep(2);
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
      return;
    }
    
    if (step === 2) {
      if (!formData.name || !formData.age) {
        setError("Please fill out all required fields.");
        return;
      }
    }
    
    setStep(prev => prev + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.consent) {
      setError('You must acknowledge the consent form to proceed.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await updateProfile({
        name: formData.name,
        age: parseInt(formData.age, 10),
        gender: formData.gender,
        education: formData.education,
        language: formData.language,
        memory_concerns: formData.memoryConcerns,
        emergency_name: formData.emergencyName,
        emergency_contact: formData.emergencyContact,
        consent: formData.consent
      });
      window.location.href = '/dashboard';
    } catch (err) {
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.detail === "Could not validate credentials") {
          localStorage.removeItem('token');
          setError('Session expired. Redirecting to login...');
          setTimeout(() => navigate('/auth'), 2000);
        } else {
          setError(parsed.detail || 'An error occurred during onboarding');
        }
      } catch {
        setError(err.message || 'An error occurred during onboarding');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #F0F9FF 0%, #BAE6FD 100%)' }}>
      
      {/* Progress Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {[1, 2, 3, 4].map(s => (
          <div key={s} style={{ 
            width: '60px', height: '6px', borderRadius: '3px',
            background: s <= step ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
            transition: 'all 0.3s'
          }} />
        ))}
      </div>

      <div className="card slide-up" style={{ width: '100%', maxWidth: '650px', padding: '3rem', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
        
        {error && <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 500 }}>{error}</div>}

        {step === 1 && (
          <div className="fade-in">
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ background: 'var(--primary-light)', padding: '1.5rem', borderRadius: '50%', display: 'inline-block', marginBottom: '1rem' }}>
                <Shield size={40} color="var(--primary)" />
              </div>
              <h2 style={{ color: 'var(--primary)', fontSize: '2rem', margin: 0 }}>Create Account</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Step 1: Secure your profile</p>
            </div>
            
            <div className="mb-4">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email Address</label>
              <input required type="email" name="email" className="input-field" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
            </div>
            <div className="mb-4">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Password</label>
              <input required type="password" name="password" className="input-field" value={formData.password} onChange={handleChange} placeholder="Min 8 characters" />
            </div>
            <div className="mb-8">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Confirm Password</label>
              <input required type="password" name="confirmPassword" className="input-field" value={formData.confirmPassword} onChange={handleChange} placeholder="Retype password" />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => navigate('/auth')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500 }}>Login instead</button>
              <button onClick={handleNext} disabled={loading} className="btn btn-primary" style={{ padding: '1rem 2.5rem', borderRadius: '50px' }}>
                {loading ? 'Processing...' : 'Continue'} <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fade-in">
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ background: 'var(--primary-light)', padding: '1.5rem', borderRadius: '50%', display: 'inline-block', marginBottom: '1rem' }}>
                <UserCheck size={40} color="var(--primary)" />
              </div>
              <h2 style={{ color: 'var(--primary)', fontSize: '2rem', margin: 0 }}>Personal & Health Info</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Step 2: Tell us about yourself</p>
            </div>
            
            <div className="mb-4">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Full Name *</label>
              <input required type="text" name="name" className="input-field" value={formData.name} onChange={handleChange} placeholder="John Doe" />
            </div>
            
            <div className="mb-4" style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Age *</label>
                <input required type="number" name="age" min="18" max="120" className="input-field" value={formData.age} onChange={handleChange} placeholder="65" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Gender</label>
                <select name="gender" className="input-field" value={formData.gender} onChange={handleChange}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>
            
            <div className="mb-4" style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Education Level</label>
                <select name="education" className="input-field" value={formData.education} onChange={handleChange}>
                  <option value="high-school">High school or lower</option>
                  <option value="bachelors">Bachelor's Degree</option>
                  <option value="masters">Master's or higher</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Native Language</label>
                <input type="text" name="language" className="input-field" value={formData.language} onChange={handleChange} placeholder="English" />
              </div>
            </div>

            <div className="mb-8">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Existing Memory Concerns</label>
              <select name="memoryConcerns" className="input-field" value={formData.memoryConcerns} onChange={handleChange}>
                <option value="none">None</option>
                <option value="mild">Mild (Occasional forgetfulness)</option>
                <option value="moderate">Moderate (Affecting daily life)</option>
                <option value="severe">Severe</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleNext} className="btn btn-primary" style={{ padding: '1rem 2.5rem', borderRadius: '50px' }}>
                Continue <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="fade-in">
             <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ background: 'var(--primary-light)', padding: '1.5rem', borderRadius: '50%', display: 'inline-block', marginBottom: '1rem' }}>
                <Phone size={40} color="var(--primary)" />
              </div>
              <h2 style={{ color: 'var(--primary)', fontSize: '2rem', margin: 0 }}>Emergency Contact</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Step 3: Optional but recommended</p>
            </div>

            <div className="mb-4">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Contact Name (Optional)</label>
              <input type="text" name="emergencyName" className="input-field" value={formData.emergencyName} onChange={handleChange} placeholder="Jane Doe" />
            </div>
            
            <div className="mb-8">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Contact Number (Optional)</label>
              <input type="tel" name="emergencyContact" className="input-field" value={formData.emergencyContact} onChange={handleChange} placeholder="+1 234 567 8900" />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ArrowLeft size={18}/> Back</button>
              <button onClick={handleNext} className="btn btn-primary" style={{ padding: '1rem 2.5rem', borderRadius: '50px' }}>
                Continue <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="fade-in">
             <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ background: 'var(--primary-light)', padding: '1.5rem', borderRadius: '50%', display: 'inline-block', marginBottom: '1rem' }}>
                <HeartPulse size={40} color="var(--primary)" />
              </div>
              <h2 style={{ color: 'var(--primary)', fontSize: '2rem', margin: 0 }}>Medical Consent</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Step 4: Final acknowledgment</p>
            </div>

            <div className="mb-8" style={{ background: '#F8FAFC', padding: '2rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  style={{ marginTop: '0.25rem', transform: 'scale(1.5)' }}
                />
                <span style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  <strong>I understand this platform is for early dementia screening and does not provide a medical diagnosis.</strong> I agree to participate and understand my data will be securely processed.
                </span>
              </label>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => setStep(3)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ArrowLeft size={18}/> Back</button>
              <button onClick={handleSubmit} disabled={loading} className="btn btn-primary" style={{ padding: '1rem 3rem', borderRadius: '50px', fontSize: '1.1rem' }}>
                {loading ? 'Saving...' : 'Complete & Start'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Onboarding;

