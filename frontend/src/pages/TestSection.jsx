import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import { Activity, LogOut, ArrowRight, Calendar, Brain, Calculator, MessageSquare, Map, ListChecks, Sparkles } from 'lucide-react';

const TEST_ORDER = ["MMSE", "CDRSB", "TOTAL13"];

const TEST_INFO = {
  "MMSE": { title: "MMSE", subtitle: "Cognitive Status & Orientation", color: "#3B82F6", bg: "#EFF6FF" },
  "CDRSB": { title: "CDR-SB", subtitle: "Functional Impairment", color: "#8B5CF6", bg: "#F5F3FF" },
  "TOTAL13": { title: "TOTAL13", subtitle: "Delayed Recall Memory", color: "#10B981", bg: "#D1FAE5" }
};

const getIconForTest = (id) => {
  if (id.includes('orientation')) return <Calendar size={36} color="var(--primary)" />;
  if (id.includes('attention')) return <Calculator size={36} color="var(--primary)" />;
  if (id.includes('naming') || id.includes('commands')) return <MessageSquare size={36} color="var(--primary)" />;
  if (id.includes('visuospatial')) return <Map size={36} color="var(--primary)" />;
  if (id.includes('recall') || id.includes('registration') || id.includes('memory')) return <Brain size={36} color="var(--primary)" />;
  return <ListChecks size={36} color="var(--primary)" />;
};

const TestSection = () => {
  const navigate = useNavigate();
  const { testName } = useParams();
  
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [animateQuestion, setAnimateQuestion] = useState(false);

  useEffect(() => {
    if (!TEST_ORDER.includes(testName?.toUpperCase())) {
      navigate('/dashboard');
      return;
    }

    const sessionTestFlow = localStorage.getItem('testFlow');
    if (!sessionTestFlow) {
      navigate('/auth');
      return;
    }

    const fullFlow = JSON.parse(sessionTestFlow);
    const sectionSteps = fullFlow.filter(s => s.test_name === testName.toUpperCase());
    
    const savedAnswers = JSON.parse(localStorage.getItem('testAnswers') || '{}');
    setAnswers(savedAnswers);
    
    setSteps(sectionSteps);
    setCurrentStepIndex(0);
    setLoading(false);
  }, [testName, navigate]);

  const [feedbackMsg, setFeedbackMsg] = useState("");
  const FEEDBACK_MESSAGES = ["Great job! 🎉", "Keep going! 👍", "You're doing great! ⭐", "Excellent! 🌟", "Awesome! 🚀"];

  const handleNext = () => {
    const savedAnswers = JSON.parse(localStorage.getItem('testAnswers') || '{}');
    localStorage.setItem('testAnswers', JSON.stringify({ ...savedAnswers, ...answers }));

    if (currentStepIndex < steps.length - 1) {
      setAnimateQuestion(true);
      
      // Show random feedback
      if (Math.random() > 0.3) {
        setFeedbackMsg(FEEDBACK_MESSAGES[Math.floor(Math.random() * FEEDBACK_MESSAGES.length)]);
        setTimeout(() => setFeedbackMsg(""), 2000);
      }

      setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
        setAnimateQuestion(false);
      }, 300);
    } else {
      setFeedbackMsg("Section complete! ⭐");
      setTimeout(() => {
        const currentIndex = TEST_ORDER.indexOf(testName.toUpperCase());
        if (currentIndex < TEST_ORDER.length - 1) {
          navigate(`/test/${TEST_ORDER[currentIndex + 1]}`);
        } else {
          navigate(`/test/speech`);
        }
      }, 1000);
    }
  };

  const exitTest = () => {
    if(window.confirm('Are you sure you want to exit? Your progress will be saved.')) {
      navigate('/dashboard');
    }
  };

  if (loading || steps.length === 0) return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}><p style={{fontSize: '1.2rem', color: 'var(--text-secondary)'}}>Loading test environment...</p></div>;

  const step = steps[currentStepIndex];
  const isAnswered = answers[step.id] !== undefined && answers[step.id] !== '';

  const handleAnswerChange = (val, subKey = null) => {
    if (subKey) {
      setAnswers(prev => ({
        ...prev,
        [step.id]: { ...(prev[step.id] || {}), [subKey]: val }
      }));
    } else {
      setAnswers(prev => ({ ...prev, [step.id]: val }));
    }
  };

  const renderStepContent = () => {
    if (step.type === 'multiple_choice') {
      return (
        <div className={`slide-up ${animateQuestion ? 'fade-out' : ''}`} key={step.id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--primary-light)', padding: '1rem', borderRadius: '20px', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 4px 6px rgba(0,0,0,0.05)' }}>
              {getIconForTest(step.id)}
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>{step.title}</h2>
          </div>
          
          <p style={{ fontSize: '1.3rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6 }}>{step.prompt}</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {step.options.map((opt, i) => {
              const isSelected = answers[step.id] === opt;
              return (
                <button
                  key={i}
                  className="btn option-btn"
                  style={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    padding: '1.5rem',
                    background: isSelected ? 'linear-gradient(135deg, #F0F9FF 0%, var(--primary-light) 100%)' : 'rgba(255, 255, 255, 0.7)',
                    border: `2px solid ${isSelected ? 'var(--primary)' : 'rgba(229, 231, 235, 0.8)'}`,
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isSelected ? '0 10px 15px -3px rgba(26, 111, 168, 0.15)' : '0 4px 6px -1px rgba(0,0,0,0.02)',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                  }}
                  onClick={() => handleAnswerChange(opt)}
                >
                  <span style={{ flex: 1, fontSize: '1.15rem', color: isSelected ? 'var(--primary)' : '#334155', fontWeight: isSelected ? 700 : 500 }}>{opt}</span>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: `3px solid ${isSelected ? 'var(--primary)' : '#CBD5E1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isSelected ? 'var(--primary)' : 'white', transition: 'all 0.3s', flexShrink: 0, marginLeft: '1rem' }}>
                    {isSelected && <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'white', animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }
    
    if (step.type === 'memorize') {
      return (
        <div className={`slide-up text-center ${animateQuestion ? 'fade-out' : ''}`} key={step.id}>
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--primary-light)', padding: '1rem', borderRadius: '20px', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 4px 6px rgba(0,0,0,0.05)' }}>
              {getIconForTest(step.id)}
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>{step.title}</h2>
          </div>
          <p style={{ fontSize: '1.3rem', color: 'var(--text-secondary)', marginBottom: '3rem' }}>{step.prompt}</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '4rem', flexWrap: 'wrap' }}>
            {step.data.map((word, i) => (
              <div key={i} style={{ 
                padding: '2.5rem 2rem', width: '220px', 
                background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(249,250,251,1) 100%)', 
                borderRadius: '24px', 
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', 
                border: '1px solid rgba(255,255,255,0.8)', 
                borderTop: '6px solid var(--primary)',
                animation: `float 6s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`
              }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '2px' }}>{word}</span>
              </div>
            ))}
          </div>
          
          <button 
            className="btn btn-secondary" 
            onClick={() => handleAnswerChange(true)}
            style={{ 
              padding: '1.25rem 4rem', fontSize: '1.2rem', borderRadius: '50px', 
              background: answers[step.id] ? 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)' : 'white', 
              borderColor: answers[step.id] ? '#10B981' : 'var(--primary)', 
              color: answers[step.id] ? '#065F46' : 'var(--primary)',
              boxShadow: answers[step.id] ? '0 10px 15px -3px rgba(16, 185, 129, 0.2)' : '0 4px 6px -1px rgba(0,0,0,0.05)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {answers[step.id] ? 'Awesome! Click Next.' : 'I have memorized them'}
          </button>
        </div>
      );
    }

    return <div>Unsupported step type</div>;
  };

  const canProceed = () => answers[step.id] !== undefined && answers[step.id] !== '';

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
        @keyframes popIn {
          0% { transform: scale(0); }
          80% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes slideDownFade {
          0% { opacity: 0; transform: translate(-50%, -20px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
        .slide-up {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-out {
          opacity: 0;
          transform: translateY(-20px);
          transition: all 0.3s ease;
        }
        .option-btn:hover {
          border-color: #93C5FD !important;
          background: rgba(255, 255, 255, 0.9) !important;
        }
      `}</style>

      {/* Decorative Background Blobs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(40px)', animation: 'float 8s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '-15%', right: '-5%', width: '45vw', height: '45vw', background: 'radial-gradient(circle, rgba(186,230,253,0.6) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 0, filter: 'blur(40px)', animation: 'float 10s ease-in-out infinite reverse' }} />

      {/* Sticky Navbar */}
      {feedbackMsg && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
          padding: '1rem 2.5rem', borderRadius: '50px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '2px solid var(--primary)',
          color: 'var(--primary)', fontWeight: '800', fontSize: '1.2rem',
          zIndex: 100, animation: 'slideDownFade 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          {feedbackMsg}
        </div>
      )}
      
      <nav style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', padding: '1rem 2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.5px' }}>
          <Activity size={24} />
          <span>Early Dementia Detection Platform</span>
        </div>
        <button onClick={exitTest} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '50px', padding: '0.5rem 1.25rem', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} onMouseOver={e => {e.currentTarget.style.color='var(--text-primary)'; e.currentTarget.style.borderColor='#CBD5E1'}} onMouseOut={e => {e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.borderColor='#E5E7EB'}}>
          <LogOut size={16} /> Save & Exit
        </button>
      </nav>

      {/* Main Testing Container */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '3rem 1rem', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: '850px' }}>
          
          <div style={{ marginBottom: '2.5rem', display: 'inline-flex', alignItems: 'center', gap: '1rem', background: TEST_INFO[testName.toUpperCase()]?.bg || 'var(--primary-light)', color: TEST_INFO[testName.toUpperCase()]?.color || 'var(--primary)', padding: '0.75rem 1.5rem', borderRadius: '50px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <Sparkles size={18} color={TEST_INFO[testName.toUpperCase()]?.color || 'var(--primary)'} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '1.5px' }}>MODULE: {TEST_INFO[testName.toUpperCase()]?.title || testName.toUpperCase()}</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 600, letterSpacing: '0.5px' }}>{TEST_INFO[testName.toUpperCase()]?.subtitle || "Assessment"}</span>
            </div>
          </div>

          <ProgressBar current={currentStepIndex + 1} total={steps.length} />
          
          {/* Glassmorphism Card */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.85)', 
            backdropFilter: 'blur(20px)', 
            padding: '3.5rem', 
            borderRadius: '32px', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255,255,255,0.5) inset', 
            marginBottom: '2.5rem', 
            minHeight: '400px' 
          }}>
            {renderStepContent()}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={handleNext}
              disabled={!canProceed()}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                background: canProceed() ? 'linear-gradient(135deg, #0284C7 0%, var(--primary) 100%)' : '#CBD5E1', 
                color: 'white', 
                padding: '1.25rem 3rem', 
                borderRadius: '50px', 
                border: 'none', 
                fontSize: '1.2rem', 
                fontWeight: 700, 
                cursor: canProceed() ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: canProceed() ? '0 10px 25px -5px rgba(2, 132, 199, 0.5)' : 'none',
                transform: canProceed() && isAnswered ? 'scale(1.05)' : 'scale(1)',
                animation: canProceed() && isAnswered ? 'pulse 2s infinite' : 'none'
              }}
              onMouseOver={e => { if(canProceed()) e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)' }}
              onMouseOut={e => { if(canProceed()) e.currentTarget.style.transform = 'scale(1)' }}
            >
              {currentStepIndex === steps.length - 1 ? 'Continue to Next Section' : 'Next Question'}
              <ArrowRight size={22} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TestSection;

