import React, { useState, useRef } from 'react';
import { Mic, Square, RefreshCw } from 'lucide-react';

const AudioRecorder = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const startTimeRef = useRef(0);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      startTimeRef.current = Date.now();
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecordingComplete(audioBlob, duration);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Could not access microphone. Please ensure you have granted permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div style={{ padding: '2rem', background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
      
      {!isRecording && !audioUrl && (
        <>
          <div style={{ background: '#F0F9FF', padding: '1.5rem', borderRadius: '50%', color: 'var(--primary)' }}>
            <Mic size={48} />
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Click below to begin recording your description.</p>
          <button 
            onClick={startRecording} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--primary)', color: 'white', padding: '1rem 2.5rem', borderRadius: '50px', border: 'none', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 6px -1px rgba(26, 111, 168, 0.3)' }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Mic size={20} /> Start Recording
          </button>
        </>
      )}
      
      {isRecording && (
        <>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ position: 'absolute', width: '100px', height: '100px', borderRadius: '50%', background: '#DC2626', opacity: 0.2, animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
            <div style={{ background: '#DC2626', padding: '1.5rem', borderRadius: '50%', color: 'white', zIndex: 1 }}>
              <Mic size={48} />
            </div>
          </div>
          <p style={{ color: '#DC2626', fontWeight: 600, fontSize: '1.1rem', margin: 0, animation: 'pulse 2s infinite' }}>Recording in progress...</p>
          <button 
            onClick={stopRecording} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'white', color: '#DC2626', border: '2px solid #DC2626', padding: '1rem 2.5rem', borderRadius: '50px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background = '#FEE2E2'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'white'; }}
          >
            <Square size={20} /> Stop Recording
          </button>
        </>
      )}
      
      {audioUrl && !isRecording && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '100%', padding: '1rem', background: '#F9FAFB', borderRadius: '12px' }}>
            <audio src={audioUrl} controls style={{ width: '100%', outline: 'none' }} />
          </div>
          <button 
            onClick={startRecording} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: 'var(--text-secondary)', border: 'none', fontSize: '1rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            <RefreshCw size={16} /> Re-record Audio
          </button>
        </div>
      )}
      
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default AudioRecorder;
