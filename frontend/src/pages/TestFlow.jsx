import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import AudioRecorder from '../components/AudioRecorder';
import LikertScale from '../components/LikertScale';
import { submitSpeech, submitCognitive, getPrediction } from '../api/client';

const TestFlow = () => {
  const navigate = useNavigate();
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [speechAnswers, setSpeechAnswers] = useState({ transcript: '', duration: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionTestFlow = localStorage.getItem('testFlow');
    if (!sessionTestFlow) {
      navigate('/auth');
      return;
    }
    const flow = JSON.parse(sessionTestFlow);
    setSteps(flow);
    setLoading(false);
  }, [navigate]);

  const handleNext = async () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      await finalizeTest();
    }
  };

  const finalizeTest = async () => {
    setLoading(true);
    const sessionId = localStorage.getItem('sessionId');
    try {
      // 1. Submit Speech
      await submitSpeech({
        session_id: sessionId,
        transcript: speechAnswers.transcript || "User provided audio description...",
        duration_seconds: speechAnswers.duration || 60
      });

      // 2. Submit Cognitive (we map all flat answers to total13/mmse/cdrsb backend models but we'll just send the raw ones and let backend score it or we just mock raw score anyway)
      // Since it's deduplicated, we'll just send everything in total13_answers bucket for simplicity on the backend
      await submitCognitive({
        session_id: sessionId,
        mmse_answers: answers,
        cdrsb_answers: answers,
        total13_answers: answers
      });

      await getPrediction(sessionId);
      navigate('/results');
    } catch (err) {
      console.error(err);
      alert('Error submitting test results.');
      setLoading(false);
    }
  };

  if (loading || steps.length === 0) {
    return <div className="container text-center"><p>Loading test environment...</p></div>;
  }

  const step = steps[currentStepIndex];

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
    switch (step.type) {
      case 'multiple_choice':
        return (
          <div className="fade-in">
            <div style={{ textTransform: 'uppercase', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', letterSpacing: '1px' }}>
              Test: {step.test_name}
            </div>
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>{step.title}</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>{step.prompt}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {step.options.map((opt, i) => (
                <button
                  key={i}
                  className="btn"
                  style={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    padding: '1.25rem',
                    background: answers[step.id] === opt ? 'var(--primary-light)' : 'white',
                    border: '2px solid',
                    borderColor: answers[step.id] === opt ? 'var(--primary)' : '#E5E7EB',
                    color: answers[step.id] === opt ? 'var(--primary)' : 'var(--text-primary)',
                    fontSize: '1.1rem',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => handleAnswerChange(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );

      case 'memorize':
        return (
          <div className="fade-in text-center">
            <div style={{ textTransform: 'uppercase', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', letterSpacing: '1px' }}>
              Test: {step.test_name}
            </div>
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>{step.title}</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>{step.prompt}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {step.data.map((word, i) => <span key={i} style={{ padding: '1rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)' }}>{word}</span>)}
            </div>
            <button className="btn btn-secondary" onClick={() => handleAnswerChange(true)}>
              I have memorized them
            </button>
            {answers[step.id] && <div style={{ marginTop: '1rem', color: '#16A34A' }}>Saved! Click Next.</div>}
          </div>
        );

      case 'speech':
        return (
          <div className="fade-in">
            <div style={{ textTransform: 'uppercase', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', letterSpacing: '1px' }}>
              Test: {step.test_name}
            </div>
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>{step.title}</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>{step.prompt}</p>
            <img src={step.image_url} alt="Cookie Theft" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', marginBottom: '2rem', border: '1px solid #E5E7EB', borderRadius: 'var(--radius-md)' }} />
            <AudioRecorder onRecordingComplete={(blob, duration) => {
              setSpeechAnswers({ transcript: 'Audio recorded successfully', duration });
            }} />
            <div style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>OR</div>
            <textarea 
              className="input-field mt-4" 
              rows="4" 
              placeholder="Type your description here..."
              value={speechAnswers.transcript}
              onChange={(e) => setSpeechAnswers({ ...speechAnswers, transcript: e.target.value })}
            ></textarea>
          </div>
        );

      default:
        return <div>Unknown Step Type</div>;
    }
  };

  const canProceed = () => {
    if (step.type === 'speech') return !!speechAnswers.transcript;
    if (step.type === 'multi_text') {
      const ans = answers[step.id] || {};
      return Object.keys(ans).length === step.data.length;
    }
    return answers[step.id] !== undefined && answers[step.id] !== '';
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
        <ProgressBar current={currentStepIndex + 1} total={steps.length} />
        
        <div style={{ flex: 1, padding: '1rem 0' }}>
          {renderStepContent()}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #E5E7EB' }}>
          <button 
            className="btn btn-primary" 
            onClick={handleNext}
            disabled={!canProceed()}
            style={{ minWidth: '120px' }}
          >
            {currentStepIndex === steps.length - 1 ? 'Submit Assessment' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestFlow;

