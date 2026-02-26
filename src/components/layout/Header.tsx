import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Sun, Moon, Languages, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import api from '../../services/api';

interface HeaderProps {
  collapsed: boolean;
}

export default function Header({ collapsed }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const isAr = i18n.language === 'ar';

  const toggleLang = () => {
    const newLang = isAr ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  useEffect(() => {
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
  }, [isAr]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') { setSearchOpen(false); setNotifOpen(false); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults(null); return; }
    const timer = setTimeout(() => {
      api.get(`/search?q=${searchQuery}`).then((r) => setSearchResults(r.data)).catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Notifications
  const fetchUnreadCount = () => {
    api.get('/notifications/unread-count').then((r) => setUnreadCount(r.data.count)).catch(() => {});
  };

  const fetchNotifications = () => {
    api.get('/notifications').then((r) => setNotifications(r.data)).catch(() => {});
  };

  useEffect(() => {
    fetchUnreadCount();
    
    // Listen for custom refresh event
    const handleRefresh = () => {
      fetchUnreadCount();
      if (notifOpen) {
        fetchNotifications();
      }
    };

    window.addEventListener('refresh-notifications', handleRefresh);
    return () => window.removeEventListener('refresh-notifications', handleRefresh);
  }, [notifOpen]);

  const openNotifications = () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen) {
      fetchNotifications();
    }
  };

  const markAllRead = () => {
    api.put('/notifications/read-all').then(() => { 
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    });
  };

  const markAsRead = (id: number) => {
    api.put(`/notifications/${id}/read`).then(() => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    });
  };

  const btnStyle = {
    width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'var(--transition)',
    position: 'relative' as const,
  };

  return (
    <header style={{
      position: 'fixed', top: 0, insetInlineEnd: 0, height: 'var(--header-height)',
      insetInlineStart: 0, zIndex: 100, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 28px',
      paddingInlineStart: collapsed ? 'calc(var(--sidebar-collapsed) + 28px)' : 'calc(var(--sidebar-width) + 28px)',
      transition: 'var(--transition)',
      background: 'var(--bg-glass)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-color)',
    }}>
      {/* Welcome */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
          {t('dashboard.welcome')}, {user?.fullName?.split(' ')[0]} 👋
        </h2>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Search */}
        <button onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 100); }} style={btnStyle}>
          <Search size={18} />
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button onClick={openNotifications} style={btnStyle}>
            <Bell size={18} />
            {unreadCount > 0 && <span style={{
              position: 'absolute', top: -4, insetInlineEnd: -4, width: 18, height: 18,
              borderRadius: '50%', background: '#ef4444', color: '#fff',
              fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center',
              justifyContent: 'center',
            }}>{unreadCount}</span>}
          </button>

          {notifOpen && (
            <div className="notification-dropdown" style={{
              position: 'absolute', top: 48, insetInlineEnd: 0, width: 360, maxHeight: 500,
              background: 'var(--bg-secondary)', borderRadius: 14,
              border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden', animation: 'fadeInScale 0.2s ease-out',
            }}>
              <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
                <span 
                  onClick={() => {
                    api.post('/notifications', { 
                      title: 'تجربة الإشعارات', 
                      message: 'هذا إشعار تجريبي للتأكد من عمل النظام بشكل صحيح.',
                      type: 0 
                    }).then(() => fetchUnreadCount());
                  }}
                  style={{ fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                >
                  {t('notifications.title')}
                </span>
                <button onClick={markAllRead} style={{ background: 'none', color: 'var(--accent-primary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none' }}>
                  {t('notifications.markAllRead')}
                </button>
              </div>
              <div style={{ overflowY: 'auto', maxHeight: 440 }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center' }}>
                    <div style={{ marginBottom: 12, opacity: 0.2 }}><Bell size={48} style={{ margin: '0 auto' }} /></div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>{t('notifications.noNotifications')}</div>
                  </div>
                ) : notifications.map((n: any) => {
                  const isSession = n.title.includes('الجلسة') || n.message.includes('جلسة');
                  
                  const getIcon = () => {
                    switch (n.type) {
                      case 1: return <AlertCircle size={18} />; // Warning
                      case 2: return <CheckCircle size={18} />; // Reminder/Success
                      default: return <Info size={18} />; // Info
                    }
                  };

                  const getColor = () => {
                    if (n.isRead) return 'var(--text-tertiary)';
                    switch (n.type) {
                      case 1: return '#f59e0b'; // Warning
                      case 2: return '#10b981'; // Success
                      default: return 'var(--accent-primary)'; // Info
                    }
                  };

                  return (
                    <div key={n.id} 
                      onClick={() => {
                        if (!n.isRead) markAsRead(n.id);
                        if (isSession) {
                          setNotifOpen(false);
                          navigate('/study-sessions');
                        }
                      }}
                      style={{
                        padding: '14px 18px', borderBottom: '1px solid var(--border-color)',
                        background: n.isRead ? 'transparent' : 'var(--accent-primary-bg)',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        display: 'flex', gap: 12
                      }}>
                      <div style={{ 
                        width: 36, height: 36, borderRadius: 10, 
                        background: n.isRead ? 'var(--bg-tertiary)' : `${getColor()}22`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: getColor(),
                        flexShrink: 0,
                        border: `1px solid ${n.isRead ? 'transparent' : `${getColor()}44`}`
                      }}>
                        {getIcon()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{n.title}</div>
                          {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: getColor(), marginTop: 6 }} />}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>{n.message}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button onClick={toggleTheme} style={btnStyle}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Language Toggle */}
        <button onClick={toggleLang} style={{
          ...btnStyle, fontSize: 12, fontWeight: 700, gap: 4, width: 'auto', padding: '0 12px',
        }}>
          <Languages size={16} />
          {isAr ? 'EN' : 'عربي'}
        </button>

        {/* Avatar */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, #818cf8, #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 14, marginLeft: 4, cursor: 'pointer',
        }} onClick={() => navigate('/profile')}>
          {user?.fullName?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 100 }}>
          <div onClick={() => setSearchOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <div style={{
            position: 'relative', width: '100%', maxWidth: 560, background: 'var(--bg-secondary)',
            borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--border-color)' }}>
              <Search size={18} style={{ color: 'var(--text-tertiary)', marginRight: 12 }} />
              <input ref={searchRef} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.search')} style={{
                  flex: 1, border: 'none', background: 'transparent', fontSize: 15,
                  color: 'var(--text-primary)', outline: 'none',
                }} />
              <button onClick={() => setSearchOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                <X size={18} />
              </button>
            </div>
            {searchResults && (
              <div style={{ maxHeight: 360, overflowY: 'auto', padding: 8 }}>
                {searchResults.tasks?.map((task: any) => (
                  <div key={task.id} onClick={() => { setSearchOpen(false); navigate(`/${task.category?.toLowerCase()}`); }}
                    style={{ padding: '10px 14px', borderRadius: 8, cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 500, fontSize: 14 }}>{task.title}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{task.category}</span>
                  </div>
                ))}
                {!searchResults.tasks?.length && !searchResults.categories?.length && (
                  <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-tertiary)' }}>{t('tasks.noResults')}</div>
                )}
              </div>
            )}
            <div style={{ padding: '8px 18px', borderTop: '1px solid var(--border-color)', fontSize: 12, color: 'var(--text-tertiary)' }}>
              Ctrl+K {t('common.search')} · Esc {t('common.close')}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          header { inset-inline-start: 0 !important; padding: 0 16px 0 56px !important; }
        }
      `}</style>
    </header>
  );
}
