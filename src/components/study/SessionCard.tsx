import React, { useState } from 'react';
import { Play, Pause, RotateCcw, X, Settings, Volume2, CheckCircle, BookOpen } from 'lucide-react';
import { useStudySession } from '../../contexts/StudySessionContext';
import '../../styles/StudySessions.css';

interface SessionCardProps {
  id: string;
}

const SOUNDS = [
  { id: 'bell', name: 'Bell', url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
  { id: 'digital', name: 'Digital', url: 'https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3' },
  { id: 'nature', name: 'Nature', url: 'https://assets.mixkit.co/active_storage/sfx/221/221-preview.mp3' },
];

const SessionCard: React.FC<SessionCardProps> = ({ id }) => {
  const { sessions, toggleSession, resetSession, removeSession, updateSession, finishSession } = useStudySession();
  const session = sessions.find(s => s.id === id);
  
  const [showSettings, setShowSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!session) return null;

  const handleFinish = async () => {
    setIsSaving(true);
    await finishSession(id);
    setIsSaving(false);
  };

  const progress = ((session.initialMinutes * 60 - (session.minutes * 60 + session.seconds)) / (session.initialMinutes * 60)) * 100;
    
  const radius = 85; 
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="session-card">
      <div className="session-header">
        <input 
          className="session-title-input" 
          value={session.title} 
          onChange={(e) => updateSession(id, { title: e.target.value })}
          placeholder="Session Name"
        />
        <div className="session-actions">
           <button onClick={() => setShowSettings(!showSettings)} className="icon-btn-mini"><Settings size={14}/></button>
           <button onClick={() => removeSession(id)} className="icon-btn-mini remove"><X size={14}/></button>
        </div>
      </div>

      {showSettings && (
        <div className="session-settings-overlay">
           <div className="setting-row-mini">
             <label>Duration:</label>
             <input 
               type="number" 
               value={session.initialMinutes} 
               onChange={(e) => {
                 const val = Number(e.target.value);
                 updateSession(id, { initialMinutes: val, minutes: val, seconds: 0 });
               }} 
               className="time-input-mini" 
             /> min
           </div>
           <div className="setting-row-mini">
              <label><Volume2 size={12}/></label>
              <select 
                value={session.selectedSound} 
                onChange={(e) => updateSession(id, { selectedSound: e.target.value })} 
                className="sound-select-mini"
              >
                {SOUNDS.map(s => <option key={s.id} value={s.url}>{s.name}</option>)}
              </select>
           </div>
        </div>
      )}

      {session.courseId && (
        <div style={{ fontSize: '10px', color: 'var(--accent-primary)', textAlign: 'center', marginBottom: '8px', fontWeight: 600 }}>
          <BookOpen size={10} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
          مربوط بكورس
        </div>
      )}

      <div className="mini-circular-timer">
        {session.autoCycle && (
          <div className="pomodoro-badge">
            {session.mode === 'focus' ? 'Focus' : 'Break'}
          </div>
        )}
        <svg width="200" height="200">
           <circle className="bg-circle" cx="100" cy="100" r={radius} />
           <circle 
              className="progress-circle" 
              cx="100" 
              cy="100" 
              r={radius} 
              style={{ 
                strokeDasharray: circumference, 
                strokeDashoffset,
                stroke: session.mode === 'break' ? '#10b981' : 'var(--accent-primary)'
              }}
           />
        </svg>
        <div className="mini-timer-text">
          <span className="mini-time">
            {session.minutes.toString().padStart(2,'0')}:{session.seconds.toString().padStart(2,'0')}
          </span>
          <button className={`mini-play-btn ${session.isActive ? 'active' : ''}`} onClick={() => toggleSession(id)}>
            {session.isActive ? <Pause size={16} /> : <Play size={16} style={{marginLeft:'2px'}} />}
          </button>
        </div>
      </div>

      <div className="presets-row">
        {[15, 25, 45, 60].map(m => (
          <button 
            key={m} 
            className={`preset-btn ${session.initialMinutes === m ? 'active' : ''}`}
            onClick={() => updateSession(id, { initialMinutes: m, minutes: m, seconds: 0, isActive: false })}
          >
            {m}m
          </button>
        ))}
      </div>

      <div className="pomodoro-toggle-row">
        <label className="pomodoro-switch">
          <input 
            type="checkbox" 
            checked={session.autoCycle} 
            onChange={(e) => updateSession(id, { autoCycle: e.target.checked })}
          />
          <span className="slider round"></span>
        </label>
        <span>Pomodoro Mode (Auto-Cycle)</span>
      </div>
      
      <div className="card-footer" style={{ display: 'flex', gap: '8px' }}>
        <button className="reset-btn-mini" onClick={() => resetSession(id)} style={{ flex: 1 }}>
          <RotateCcw size={14}/> Reset
        </button>
        {session.courseId && (
          <button 
            className="save-btn-mini" 
            onClick={handleFinish} 
            disabled={isSaving}
            style={{ 
              flex: 1, 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
              padding: '6px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: 'var(--accent-primary)', color: '#fff', fontSize: '12px', fontWeight: 600
            }}
          >
            <CheckCircle size={14}/> {isSaving ? '...' : 'Finish & Save'}
          </button>
        )}
      </div>
    </div>
  );
};

export default SessionCard;
