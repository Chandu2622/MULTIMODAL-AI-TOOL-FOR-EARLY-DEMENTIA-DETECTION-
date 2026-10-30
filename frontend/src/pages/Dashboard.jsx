import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserHistory, createSession, getMe } from '../api/client';
import Layout from '../components/Layout';
import { RiskBadge, ProgressRing, AssessmentStatusBadge } from '../components/UI';
import { 
  Play, VolumeX, User as UserIcon, Battery, Wifi, 
  Shield, TrendingUp, Lock, Calendar, ChevronRight, Puzzle, Mic, Brain
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }

    const fetchHistory = async () => {
      try {
        const me = await getMe();
        const historyRes = await getUserHistory(me.user_id);
        setProfile(historyRes.profile || {});
        localStorage.setItem('userId', me.user_id);
        
        // Sort newest first for the list
        const sorted = [...historyRes.sessions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setSessions(sorted);
      } catch (err) {
        console.error(err);
        if (err.message && err.message.includes('401')) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  const handleTakeTest = async () => {
    try {
      const me = await getMe();
      const sessionRes = await createSession({
        user_id: me.user_id,
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('token'); localStorage.removeItem('userId');
    navigate('/auth');
  };

  if (loading) return (
    <Layout userName="Loading..." onLogout={handleLogout}>
      <div style={{ display: 'flex', height: '50vh', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{color: 'var(--text-secondary)'}}>Loading your dashboard...</p>
      </div>
    </Layout>
  );

  const firstName = profile.name?.split(' ')[0] || 'User';
  const recentSessions = sessions.slice(0, 3);
  
  const latestSession = sessions[0];
  const isCompleted = latestSession && latestSession.scores;
  const activeFlow = localStorage.getItem('testFlow');
  const activeAnswers = JSON.parse(localStorage.getItem('testAnswers') || '{}');
  const hasAnswers = Object.keys(activeAnswers).length > 0;
  
  let cogStatus = 'Not Started';
  let speechStatus = 'Not Started';
  let progressPercent = 0;
  
  if (isCompleted) {
    cogStatus = 'Completed';
    speechStatus = 'Completed';
    progressPercent = 100;
  }

  return (
    <Layout userName={profile.name || 'User'} onLogout={handleLogout}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Hello, {firstName}! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Let's take a step towards better brain health.
        </p>
      </div>

      <div className="dashboard-grid">
        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Your Assessment Card */}
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Your Assessment</h2>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '32px', position: 'relative' }}>
              {/* Card 1 */}
              <div style={{ flex: 1, border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', position: 'relative' }}>
                <div style={{ 
                  position: 'absolute', top: '16px', left: '16px', width: '24px', height: '24px', 
                  background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' 
                }}>1</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '16px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <Puzzle size={32} color="var(--primary)" />
                  </div>
                  <h3 style={{ color: 'var(--primary)', marginBottom: '8px', fontSize: '1.1rem' }}>Cognitive Tasks</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: '1.4' }}>
                    Short activities to test memory, attention, problem solving and more.
                  </p>
                  <AssessmentStatusBadge status={cogStatus} />
                </div>
              </div>

              {/* Dashed Connector */}
              <div style={{ width: '40px', borderTop: '2px dashed var(--border)', position: 'relative' }}>
                <div style={{ position: 'absolute', right: '-4px', top: '-5px', width: '0', height: '0', borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: '6px solid var(--border)' }}></div>
              </div>

              {/* Card 2 */}
              <div style={{ flex: 1, border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', position: 'relative' }}>
                <div style={{ 
                  position: 'absolute', top: '16px', left: '16px', width: '24px', height: '24px', 
                  background: 'var(--accent-green)', color: 'white', borderRadius: '50%', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' 
                }}>2</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '16px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--risk-low-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <Mic size={32} color="var(--accent-green)" />
                  </div>
                  <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '1.1rem' }}>Speech Assessment</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: '1.4' }}>
                    Speak naturally while we analyze your speech patterns.
                  </p>
                  <AssessmentStatusBadge status={speechStatus} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <button className="btn btn-primary" onClick={handleTakeTest} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
                <Play size={18} fill="white" />
                Start Assessment
              </button>
              <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem' }}>
                Learn more about the assessment →
              </a>
            </div>
          </div>

          {/* Middle Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Your Progress */}
            <div className="card">
              <h2 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Your Progress</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>Complete both parts to get your results</p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <ProgressRing percent={progressPercent} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', background: 'var(--bg)', borderRadius: '8px' }}>
                      <Puzzle size={16} color="var(--primary)" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Cognitive Tasks</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{cogStatus}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', background: 'var(--bg)', borderRadius: '8px' }}>
                      <Mic size={16} color="var(--accent-green)" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Speech Assessment</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{speechStatus}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: '24px', padding: '12px', background: 'var(--bg)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.1rem' }}>ℹ️</span> You can pause and resume the assessment anytime.
              </div>
            </div>

            {/* Summary */}
            <div className="card">
              <h2 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Summary</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>Understand your brain health in simple terms.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ padding: '8px', background: 'var(--risk-low-bg)', borderRadius: '8px', height: 'fit-content' }}>
                    <Shield size={18} color="var(--accent-green)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '2px' }}>Early Detection</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Helps identify potential signs early when intervention is most effective.</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ padding: '8px', background: 'var(--primary-light)', borderRadius: '8px', height: 'fit-content' }}>
                    <TrendingUp size={18} color="var(--primary)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '2px' }}>Science-backed</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Built on validated research and clinical guidelines.</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ padding: '8px', background: '#F3F4F6', borderRadius: '8px', height: 'fit-content' }}>
                    <Lock size={18} color="#6B7280" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '2px' }}>Private & Secure</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Your data is encrypted and never shared without your consent.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Before You Begin Panel */}
          <div className="card">
            <h2 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Before You Begin</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>To get the most accurate results, please ensure:</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <VolumeX size={20} color="var(--text-secondary)" />
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Find a quiet place</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Minimize background noise</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <UserIcon size={20} color="var(--text-secondary)" />
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Sit in a comfortable position</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Keep your device steady</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Battery size={20} color="var(--text-secondary)" />
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Good battery</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Ensure your device has sufficient charge</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Wifi size={20} color="var(--text-secondary)" />
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Stable internet connection</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Required for accurate analysis</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Assessments Panel */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.1rem' }}>Recent Assessments</h2>
              <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>View all</a>
            </div>
            
            {recentSessions.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>No recent assessments</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recentSessions.map(session => (
                  <div key={session.session_id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Calendar size={20} color="var(--primary)" style={{ marginTop: '2px' }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>
                          {new Date(session.timestamp).toLocaleDateString()} {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '2px', fontWeight: 500 }}>Overall Risk</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Cognitive: {session.scores?.risk_label || 'N/A'} Risk • Speech: {session.scores?.speech_risk_label || 'N/A'} Risk
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                      <RiskBadge risk={session.scores ? `${session.scores.risk_label} Risk` : 'Incomplete'} />
                      <ChevronRight size={16} color="var(--text-secondary)" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>View Full History →</a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div style={{ marginTop: '32px', background: 'var(--primary-light)', borderRadius: '12px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Brain size={40} color="var(--primary)" />
            <Mic size={40} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '4px' }}>
              Early Dementia Detection Platform is designed to support early detection of cognitive decline.
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              It is not a diagnostic tool. Results are for informational purposes only and should not replace professional medical advice.
            </div>
          </div>
        </div>
        <button className="btn btn-secondary" style={{ whiteSpace: 'nowrap', borderColor: 'var(--primary)', color: 'var(--primary)', background: 'white' }}>
          Learn More
        </button>
      </div>

    </Layout>
  );
};

export default Dashboard;

