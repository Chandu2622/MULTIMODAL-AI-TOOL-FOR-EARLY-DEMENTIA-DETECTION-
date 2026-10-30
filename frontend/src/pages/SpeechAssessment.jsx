import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AudioRecorder from '../components/AudioRecorder';
import { submitSpeech, submitCognitive, getPrediction } from '../api/client';
import { Activity, LogOut, CheckCircle, Mic, Sparkles } from 'lucide-react';

const SpeechAssessment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(null);
  const [speechAnswers, setSpeechAnswers] = useState({ transcript: '', duration: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sessionTestFlow = localStorage.getItem('testFlow');
    if (!sessionTestFlow) {
      navigate('/auth');
      return;
    }
    const fullFlow = JSON.parse(sessionTestFlow);
    const speechStep = fullFlow.find(s => s.type === 'speech');
    setStep(speechStep);
  }, [navigate]);

  const finalizeTest = async () => {
    setLoading(true);
    const sessionId = localStorage.getItem('sessionId');
    const cognitiveAnswers = JSON.parse(localStorage.getItem('testAnswers') || '{}');
    
    try {
      const formData = new FormData();
      formData.append("session_id", sessionId);
      formData.append("transcript", speechAnswers.transcript || "User provided audio description...");
      formData.append("duration_seconds", speechAnswers.duration || 60);
      if (speechAnswers.blob) {
        formData.append("audio_file", speechAnswers.blob, "recording.webm");
      }

      await submitSpeech(formData);

      await submitCognitive({
        session_id: sessionId,
        mmse_answers: cognitiveAnswers,
        cdrsb_answers: cognitiveAnswers,
        total13_answers: cognitiveAnswers
      });

      await getPrediction(sessionId);
      navigate('/results');
    } catch (err) {
      console.error(err);
      alert('Error submitting test results.');
      setLoading(false);
    }
  };

  const exitTest = () => {
    if(window.confirm('Are you sure you want to exit? Your progress will be saved.')) {
      navigate('/dashboard');
    }
  };

  if (!step) return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}><p style={{fontSize: '1.2rem', color: 'var(--text-secondary)'}}>Loading...</p></div>;

  const canProceed = () => !!speechAnswers.transcript;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #F0F9FF 0%, var(--primary-light) 50%, #BAE6FD 100%)', 
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' 
    }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .slide-up {
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Decorative Background Blobs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(40px)', animation: 'float 8s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '-15%', right: '-5%', width: '45vw', height: '45vw', background: 'radial-gradient(circle, rgba(186,230,253,0.6) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(40px)', animation: 'float 10s ease-in-out infinite reverse' }} />

      {/* Sticky Navbar */}
      <nav style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', padding: '1rem 2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.5px' }}>
          <Activity size={24} />
          <span>Early Dementia Detection Platform</span>
        </div>
        <button onClick={exitTest} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '50px', padding: '0.5rem 1.25rem', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} onMouseOver={e => {e.currentTarget.style.color='var(--text-primary)'; e.currentTarget.style.borderColor='#CBD5E1'}} onMouseOut={e => {e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.borderColor='#E5E7EB'}}>
          <LogOut size={16} /> Save & Exit
        </button>
      </nav>

      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '3rem 1rem', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: '850px' }}>
          
          <div style={{ marginBottom: '2.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.9)', color: 'var(--primary)', padding: '0.75rem 1.5rem', borderRadius: '50px', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '1.5px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <Sparkles size={18} color="var(--primary)" />
            FINAL MODULE: SPEECH
          </div>

          <div className="slide-up" style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)', padding: '3.5rem', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255,255,255,0.5) inset', marginBottom: '2.5rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--primary-light)', padding: '1rem', borderRadius: '20px', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 4px 6px rgba(0,0,0,0.05)' }}>
                <Mic size={36} color="var(--primary)" />
              </div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>{step.title}</h2>
            </div>
            
            <p style={{ fontSize: '1.3rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6 }}>{step.prompt}</p>
            
            <div style={{ padding: '1.5rem', background: '#F8FAFC', borderRadius: '24px', marginBottom: '2.5rem', display: 'flex', justifyContent: 'center', border: '1px solid #E2E8F0', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
              <img src={step.image_url} alt="Cookie Theft" style={{ width: '100%', maxWidth: '550px', maxHeight: '400px', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
            </div>

            <AudioRecorder onRecordingComplete={(blob, duration) => {
              setSpeechAnswers({ transcript: 'Audio recorded successfully', duration, blob });
            }} />

            <div style={{ display: 'flex', alignItems: 'center', margin: '3rem 0', color: '#9CA3AF' }}>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, #CBD5E1)' }}></div>
              <span style={{ padding: '0 1.5rem', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Or Type Description</span>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, #CBD5E1, transparent)' }}></div>
            </div>

            <textarea 
              style={{ width: '100%', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.7)', border: '2px solid rgba(229, 231, 235, 0.8)', borderRadius: '16px', fontSize: '1.15rem', fontFamily: 'var(--font-family)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', resize: 'vertical', minHeight: '150px' }}
              placeholder="Type your detailed description here..."
              value={speechAnswers.transcript}
              onChange={(e) => setSpeechAnswers({ ...speechAnswers, transcript: e.target.value })}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'white'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(26, 111, 168, 0.1)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(229, 231, 235, 0.8)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)'; e.currentTarget.style.boxShadow = 'none'; }}
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={finalizeTest}
              disabled={!canProceed() || loading}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                background: canProceed() ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : '#CBD5E1', 
                color: 'white', 
                padding: '1.25rem 3rem', 
                borderRadius: '50px', 
                border: 'none', 
                fontSize: '1.2rem', 
                fontWeight: 700, 
                cursor: canProceed() ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: canProceed() ? '0 10px 25px -5px rgba(16, 185, 129, 0.5)' : 'none',
                transform: canProceed() && !loading ? 'scale(1.05)' : 'scale(1)'
              }}
              onMouseOver={e => { if(canProceed() && !loading) e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)' }}
              onMouseOut={e => { if(canProceed() && !loading) e.currentTarget.style.transform = 'scale(1)' }}
            >
              {loading ? 'Analyzing Results...' : 'Finish Assessment'}
              {!loading && <CheckCircle size={22} />}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SpeechAssessment;

