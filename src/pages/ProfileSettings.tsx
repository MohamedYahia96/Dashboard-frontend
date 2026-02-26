import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import { User, Lock, Palette } from 'lucide-react';
import { useToast } from '../hooks/useUtils';

export default function ProfileSettings() {
  const { t, i18n } = useTranslation();
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: '1px solid var(--border-color)', background: 'var(--input-bg)',
    color: 'var(--text-primary)', fontSize: 14,
  };

  const saveProfile = async () => {
    try {
      await api.put('/profile', { fullName });
      updateUser({ fullName });
      addToast(t('profile.saved'), 'success');
    } catch { addToast(t('common.error'), 'error'); }
  };

  const changePassword = async () => {
    try {
      await api.put('/profile/password', { currentPassword, newPassword });
      setCurrentPassword(''); setNewPassword('');
      addToast(t('profile.saved'), 'success');
    } catch { addToast(t('common.error'), 'error'); }
  };

  const cardStyle = {
    background: 'var(--bg-secondary)', borderRadius: 14, padding: 24,
    border: '1px solid var(--border-color)', marginBottom: 20,
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
        <User size={24} style={{ color: 'var(--accent-primary)' }} /> {t('profile.title')}
      </h2>

      {/* Avatar + Name */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, #818cf8, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 24,
          }}>{user?.fullName?.[0]?.toUpperCase()}</div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 16 }}>{user?.fullName}</p>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>{user?.email}</p>
            <p style={{ fontSize: 12, color: 'var(--accent-primary)', fontWeight: 500 }}>{user?.role}</p>
          </div>
        </div>
        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{t('profile.changeName')}</label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
          <button onClick={saveProfile} style={{
            padding: '10px 20px', borderRadius: 10, background: 'var(--accent-primary)',
            color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
          }}>{t('common.save')}</button>
        </div>
      </div>

      {/* Password */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Lock size={18} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontWeight: 600 }}>{t('profile.changePassword')}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="password" placeholder={t('profile.currentPassword')} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={inputStyle} />
          <input type="password" placeholder={t('profile.newPassword')} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} />
          <button onClick={changePassword} style={{
            padding: '10px 20px', borderRadius: 10, background: 'var(--accent-primary)',
            color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, alignSelf: 'flex-start',
          }}>{t('common.save')}</button>
        </div>
      </div>

      {/* Preferences */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Palette size={18} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontWeight: 600 }}>{t('profile.theme')} & {t('profile.language')}</span>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={toggleTheme} style={{
            padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            background: theme === 'dark' ? 'var(--accent-primary-bg)' : 'var(--bg-tertiary)',
            color: 'var(--text-primary)', border: '1px solid var(--border-color)',
          }}>🌙 {t('common.dark')} / ☀️ {t('common.light')}</button>
          <button onClick={() => { const l = i18n.language === 'ar' ? 'en' : 'ar'; i18n.changeLanguage(l); localStorage.setItem('language', l); document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'; }} style={{
            padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)',
          }}>🌐 {i18n.language === 'ar' ? 'English' : 'عربي'}</button>
        </div>
      </div>
    </div>
  );
}
