import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useStudySession } from '../contexts/StudySessionContext';
import { useKeyboardShortcuts } from '../hooks/useUtils';
import DailyProgress from '../components/study/DailyProgress';
import AmbientSounds from '../components/study/AmbientSounds';
import SessionCard from '../components/study/SessionCard';
import '../styles/StudySessions.css';

const StudySessions: React.FC = () => {
  const location = useLocation();
  const { sessions, addSession, toggleSession, resetSession } = useStudySession();

  // Keyboard Shortcuts: Space = toggle first session, R = reset first session
  useKeyboardShortcuts({
    ' ': () => sessions.length > 0 && toggleSession(sessions[0].id),
    'r': () => sessions.length > 0 && resetSession(sessions[0].id),
  });

  useEffect(() => {
    // Check if we came from a course
    const state = location.state as { courseId?: number; title?: string } | null;
    if (state?.courseId && state?.title) {
      // Check if session already exists for this course to avoid duplicates on re-render
      const exists = sessions.find(s => s.courseId === state.courseId);
      if (!exists) {
        addSession(state.title, state.courseId);
      }
    } else if (sessions.length === 0) {
      addSession('Focus Session');
    }
  }, [location.state, sessions.length]); // Dependencies to ensure it runs correctly

  return (
    <div className="study-sessions-layout">
      {/* Top Section: Daily Progress */}
      <DailyProgress />
      
      <AmbientSounds />

      {/* Grid of Sessions */}
      <div className="sessions-grid">
        {sessions.map(session => (
          <SessionCard 
            key={session.id} 
            id={session.id}
          />
        ))}

        {/* Add New Session Card */}
        <button className="add-session-btn" onClick={() => addSession('Focus Session')}>
          <Plus size={40} />
          <span style={{marginTop: '1rem'}}>Add Session</span>
        </button>
      </div>
    </div>
  );
};

export default StudySessions;
