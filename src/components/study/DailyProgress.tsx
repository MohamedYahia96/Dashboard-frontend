import React, { useState } from 'react';
import { Pencil, Check } from 'lucide-react';
import { useStudySession } from '../../contexts/StudySessionContext';
import api from '../../services/api';
import '../../styles/StudySessions.css';

const DailyProgress: React.FC = () => {
  const { stats, updateDailyGoal } = useStudySession();
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(stats.dailyGoal);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  
  // Progress calculation: completedToday (minutes) / (dailyGoal * 60)
  const goalInMinutes = stats.dailyGoal * 60;
  const progress = Math.min((stats.completedToday / goalInMinutes) * 100, 100); 
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const [lastNotifiedGoal, setLastNotifiedGoal] = useState(0);

  // Goal achievement notification
  React.useEffect(() => {
    if (progress >= 100 && lastNotifiedGoal < stats.dailyGoal && goalInMinutes > 0) {
      api.post('/notifications', {
        title: '🎉 تهانينا! حققت هدفك اليومي',
        message: `لقد أتممت ${stats.dailyGoal} ساعة من المذاكرة اليوم. استمر في التألق!`,
        type: 2 // Success
      }).then(() => {
        window.dispatchEvent(new CustomEvent('refresh-notifications'));
        setLastNotifiedGoal(stats.dailyGoal);
      }).catch(() => {});
    }
  }, [progress, stats.dailyGoal, lastNotifiedGoal, goalInMinutes]);

  const handleSaveGoal = () => {
    updateDailyGoal(tempGoal);
    setIsEditingGoal(false);
  };

  return (
    <div className="daily-progress-card">
      <div className="card-header">
        <h3>Daily progress</h3>
        {isEditingGoal ? (
          <button className="edit-btn" onClick={handleSaveGoal}><Check size={16} /></button>
        ) : (
          <button className="edit-btn" onClick={() => setIsEditingGoal(true)}><Pencil size={16} /></button>
        )}
      </div>

      <div className="progress-content">
        <div className="stat-item">
          <span className="stat-label">Yesterday</span>
          <span className="stat-value">{stats.yesterday}</span>
          <span className="stat-unit">minutes</span>
        </div>

        <div className="main-progress">
          <svg width="140" height="140" className="progress-ring">
            <circle 
              className="ring-bg"
              cx="70"
              cy="70"
              r={radius}
            />
            <circle 
              className="ring-progress"
              cx="70"
              cy="70"
              r={radius}
              style={{ strokeDasharray: circumference, strokeDashoffset }}
            />
          </svg>
          <div className="ring-text">
            {isEditingGoal ? (
              <>
                <input 
                  type="number" 
                  value={tempGoal} 
                  onChange={(e) => setTempGoal(Number(e.target.value))}
                  style={{ width: '50px', fontSize: '1.2rem', textAlign: 'center', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)' }}
                />
                <span className="ring-unit">hours</span>
              </>
            ) : (
              <>
                <span className="ring-label">Daily goal</span>
                <span className="ring-value">{stats.dailyGoal}</span>
                <span className="ring-unit">hours</span>
              </>
            )}
          </div>
        </div>

        <div className="stat-item">
          <span className="stat-label">Streak</span>
          <span className="stat-value">{stats.streak}</span>
          <span className="stat-unit">days</span>
        </div>
      </div>

      <div className="completed-text">
        Completed: {stats.completedToday} minutes ({Math.round(progress)}%)
      </div>
    </div>
  );
};

export default DailyProgress;
