import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, Pause, Clock } from 'lucide-react';
import { useStudySession } from '../../contexts/StudySessionContext';
import '../../styles/StudySessions.css';

const FloatingMiniTimer: React.FC = () => {
  const { sessions, toggleSession, activeSessionCount } = useStudySession();
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show on the main study sessions page
  if (location.pathname === '/study-sessions') return null;
  
  // Only show if there's an active/running session
  const activeSession = sessions.find(s => s.isActive) || sessions[0];
  if (!activeSession || activeSessionCount === 0) return null;

  return (
    <div className="floating-timer-container" onClick={() => navigate('/study-sessions')}>
      <div className="floating-timer-content">
        <div className="floating-timer-info">
          <Clock size={16} className="pulse-icon" />
          <span className="floating-time">
            {activeSession.minutes.toString().padStart(2, '0')}:{activeSession.seconds.toString().padStart(2, '0')}
          </span>
          <span className="floating-label">{activeSession.title}</span>
        </div>
        <button 
          className="floating-toggle-btn" 
          onClick={(e) => {
            e.stopPropagation();
            toggleSession(activeSession.id);
          }}
        >
          {activeSession.isActive ? <Pause size={14} /> : <Play size={14} />}
        </button>
      </div>
    </div>
  );
};

export default FloatingMiniTimer;
