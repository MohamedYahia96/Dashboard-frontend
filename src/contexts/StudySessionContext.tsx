import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useToast } from '../hooks/useUtils';

export interface StudySession {
  id: string;
  title: string;
  courseId?: number;
  minutes: number;
  seconds: number;
  initialMinutes: number;
  isActive: boolean;
  selectedSound: string;
  mode: 'focus' | 'break';
  autoCycle: boolean;
}

interface StudyStats {
  completedToday: number; // minutes
  dailyGoal: number; // hours
  streak: number;
  yesterday: number;
}

interface StudySessionContextType {
  sessions: StudySession[];
  stats: StudyStats;
  ambientSound: string | null;
  setAmbientSound: (url: string | null) => void;
  addSession: (title: string, courseId?: number) => void;
  removeSession: (id: string) => void;
  toggleSession: (id: string) => void;
  resetSession: (id: string) => void;
  updateSession: (id: string, updates: Partial<StudySession>) => void;
  finishSession: (id: string) => Promise<void>;
  updateDailyGoal: (hours: number) => void;
  activeSessionCount: number;
}

const StudySessionContext = createContext<StudySessionContextType>(null!);

export const useStudySession = () => useContext(StudySessionContext);

const SESSIONS_STORAGE_KEY = 'study_sessions_state';
const STATS_STORAGE_KEY = 'study_stats_state';

const DEFAULT_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

export const StudySessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  
  const [sessions, setSessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
    return saved ? JSON.parse(saved).map((s: any) => ({ ...s, isActive: false })) : [];
  });

  const [stats, setStats] = useState<StudyStats>(() => {
    const saved = localStorage.getItem(STATS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : { completedToday: 0, dailyGoal: 4, streak: 0, yesterday: 0 };
  });

  const [ambientSound, setAmbientSoundState] = useState<string | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Persist sessions
  useEffect(() => {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  // Persist stats
  useEffect(() => {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  // Daily Reset Logic
  useEffect(() => {
    const lastResetDate = localStorage.getItem('last_study_reset_date');
    const today = new Date().toDateString();

    if (lastResetDate !== today) {
      setStats(prev => {
        const isConsecutive = lastResetDate === new Date(Date.now() - 86400000).toDateString();
        return {
          ...prev,
          yesterday: prev.completedToday,
          completedToday: 0,
          streak: isConsecutive ? prev.streak + 1 : (prev.completedToday > 0 ? 1 : prev.streak)
        };
      });
      localStorage.setItem('last_study_reset_date', today);
    }
  }, []);

  // Ambient Sound Logic
  useEffect(() => {
    if (ambientSound) {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.src = ambientSound;
        ambientAudioRef.current.loop = true;
        ambientAudioRef.current.play().catch(e => console.log('Ambient play failed', e));
      } else {
        const audio = new Audio(ambientSound);
        audio.loop = true;
        audio.play().catch(e => console.log('Ambient play failed', e));
        ambientAudioRef.current = audio;
      }
    } else {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current = null;
      }
    }
    return () => {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
      }
    };
  }, [ambientSound]);

  const setAmbientSound = (url: string | null) => {
    setAmbientSoundState(url);
  };

  // Timer Logic with Stats Tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setSessions((prev) => {
        let changed = false;
        const next = prev.map((s): StudySession => {
          if (!s.isActive) return s;
          
          changed = true;
          let { minutes, seconds, mode, autoCycle } = s;

          if (seconds === 0) {
            if (minutes === 0) {
              if (autoCycle) {
                if (mode === 'focus') {
                  addToast(`انتهت فترة التركيز! تبدأ الاستراحة الآن (5 دقائق)`, 'info');
                  handleSessionComplete({ ...s, title: 'Focus Ended' });
                  // Add 25 mins to stats
                  updateStats(25);
                  return { ...s, mode: 'break' as const, minutes: 5, seconds: 0, isActive: true, initialMinutes: 5 };
                } else {
                  addToast(`انتهت الاستراحة! فلتعد للتركيز (25 دقيقة)`, 'info');
                  handleSessionComplete({ ...s, title: 'Break Ended' });
                  return { ...s, mode: 'focus' as const, minutes: 25, seconds: 0, isActive: true, initialMinutes: 25 };
                }
              } else {
                handleSessionComplete(s);
                // Last partial minute
                updateStats(1); 
                return { ...s, isActive: false, seconds: 0, minutes: 0 };
              }
            } else {
              // Every minute, update stats (simple estimation)
              updateStats(1);
              minutes -= 1;
              seconds = 59;
            }
          } else {
            seconds -= 1;
          }

          return { ...s, minutes, seconds };
        });
        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [addToast]);

  const updateStats = (minutes: number) => {
    setStats(prev => ({ ...prev, completedToday: prev.completedToday + minutes }));
  };

  const updateDailyGoal = (hours: number) => {
    setStats(prev => ({ ...prev, dailyGoal: hours }));
  };

  const handleSessionComplete = async (session: StudySession) => {
    // 1. Play Sound ONCE
    playNotificationSound(session.selectedSound);

    // 2. Add Notification to Backend (Navbar)
    try {
      await api.post('/notifications', {
        title: 'انتهت الجلسة!',
        message: `انتهت جلسة "${session.title}" بنجاح. لفترة ${session.initialMinutes} دقيقة.`,
        type: 2 // Success
      });
      console.log('Notification sent successfully');
      window.dispatchEvent(new CustomEvent('refresh-notifications'));
    } catch (e) {
      console.error('Failed to create completion notification', e);
      // No toast here to avoid cluttering, but log for developer
    }

    // 3. App Toast
    addToast(`انتهت جلسة "${session.title}"!`, 'success');
  };

  const playNotificationSound = (url: string) => {
    const audio = new Audio(url);
    audio.play().catch(e => console.log('Audio play failed', e));
  };

  const addSession = async (title: string, courseId?: number) => {
    const newSession: StudySession = {
      id: Date.now().toString(),
      title: title || 'New Session',
      courseId,
      minutes: 25,
      seconds: 0,
      initialMinutes: 25,
      isActive: false,
      selectedSound: DEFAULT_SOUND,
      mode: 'focus',
      autoCycle: false
    };
    setSessions([...sessions, newSession]);
    
    // Quick notification for adding session
    try {
      await api.post('/notifications', {
        title: 'جلسة جديدة',
        message: `تم إنشاء جلسة دراسة جديدة: "${newSession.title}"`,
        type: 0 // Info
      });
      window.dispatchEvent(new CustomEvent('refresh-notifications'));
    } catch {}
  };

  const removeSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  const toggleSession = async (id: string) => {
    const session = sessions.find(s => s.id === id);
    const newActiveState = !session?.isActive;
    
    setSessions(sessions.map(s => 
      s.id === id ? { ...s, isActive: !s.isActive } : s
    ));

    // Notify on start
    if (newActiveState && session) {
      try {
        await api.post('/notifications', {
          title: 'بدأت الجلسة',
          message: `بدأت الآن جلسة: "${session.title}"`,
          type: 0 // Info
        });
        window.dispatchEvent(new CustomEvent('refresh-notifications'));
      } catch {}
    }
  };

  const resetSession = (id: string) => {
    setSessions(sessions.map(s => 
      s.id === id ? { ...s, isActive: false, minutes: s.initialMinutes, seconds: 0 } : s
    ));
  };

  const updateSession = (id: string, updates: Partial<StudySession>) => {
    setSessions(sessions.map(s => 
      s.id === id ? { ...s, ...updates } : s
    ));
  };

  const finishSession = async (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (!session || !session.courseId) return;

    try {
      const remainingSeconds = session.minutes * 60 + session.seconds;
      const spentSeconds = session.initialMinutes * 60 - remainingSeconds;
      const spentHours = spentSeconds / 3600;

      if (spentHours <= 0) {
        addToast('No progress to save', 'info');
        return;
      }

      const { data: course } = await api.get(`/courses/${session.courseId}`);
      const newCompleted = course.completedHours + spentHours;
      
      await api.put(`/courses/${session.courseId}`, { completedHours: newCompleted });
      
      // Add Notification for progress save
      try {
        const minutesSpent = Math.max(1, Math.round(spentSeconds / 60));
        await api.post('/notifications', {
          title: 'تم تحديث التقدم',
          message: `تمت إضافة ${minutesSpent} دقيقة لتقدمك في كورس "${course.title}".`,
          type: 2 // Success
        });
        window.dispatchEvent(new CustomEvent('refresh-notifications'));
      } catch (e) {
        console.error('Failed to notify progress', e);
      }

      addToast(`تم حفظ ${Math.round(spentSeconds / 60)} دقيقة للكورس`, 'success');
      resetSession(id);
    } catch (e) {
      console.error('Error saving progress:', e);
      addToast('Error saving progress', 'error');
    }
  };

  const activeSessionCount = sessions.filter(s => s.isActive).length;

  return (
    <StudySessionContext.Provider value={{ 
      sessions, stats, ambientSound, setAmbientSound,
      addSession, removeSession, toggleSession, resetSession, 
      updateSession, finishSession, updateDailyGoal, activeSessionCount 
    }}>
      {children}
    </StudySessionContext.Provider>
  );
};
