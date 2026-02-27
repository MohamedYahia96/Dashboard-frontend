import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, GraduationCap, Gamepad2, BookOpen, Share2, Music, Bot,
  School, Calendar, Shield, BarChart3, Activity, User, LogOut, ChevronLeft,
  ChevronRight, Menu, X, StickyNote
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, key: 'dashboard' },

  { path: '/sticky-notes', icon: StickyNote, key: 'stickyNotes' },
  { path: '/study-sessions', icon: BookOpen, key: 'studySessions' },
  { path: '/courses', icon: GraduationCap, key: 'courses' },
  { path: '/academic', icon: School, key: 'academic' },
  { path: '/music', icon: Music, key: 'music' },
  { path: '/entertainment', icon: Gamepad2, key: 'entertainment' },
  { path: '/social-media', icon: Share2, key: 'socialMedia' },
  { path: '/calendar', icon: Calendar, key: 'calendar' },
  { path: '/ai-tools', icon: Bot, key: 'aiTools' },
  
];

const bottomItems = [
  { path: '/reports', icon: BarChart3, key: 'reports' },
  { path: '/activity-log', icon: Activity, key: 'activityLog' },
  { path: '/profile', icon: User, key: 'profile' },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const { t, i18n } = useTranslation();
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const linkStyle = (isActive: boolean) => ({
    display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 12, padding: '11px 16px',
    borderRadius: 10, color: isActive ? 'var(--text-sidebar-active)' : 'var(--text-sidebar)',
    background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
    transition: 'var(--transition)', fontSize: 14, fontWeight: isActive ? 600 : 400,
    whiteSpace: 'nowrap' as const, overflow: 'hidden',
  });

  const sidebarContent = (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 12px',
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '4px 8px', marginBottom: 28,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, var(--accent-primary-light), var(--accent-primary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#05061f', fontWeight: 800, fontSize: 16, flexShrink: 0,
        }}>T</div>
        {!collapsed && <span style={{ fontWeight: 700, fontSize: 17, color: '#fff' }}>
          {t('app.title')}
        </span>}
      </div>

    {/* Collapse Toggle */}
      <button onClick={() => setCollapsed(!collapsed)} className="collapse-btn" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: 8, padding: 8, borderRadius: 8,
        background: 'rgba(255,255,255,0.08)', color: 'var(--text-sidebar)',
        border: 'none', cursor: 'pointer',
      }}>
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* Main Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
            style={({ isActive }) => linkStyle(isActive)}>
            <item.icon size={20} style={{ flexShrink: 0 }} />
            {!collapsed && <span>{t(`sidebar.${item.key}`)}</span>}
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink to="/admin" onClick={() => setMobileOpen(false)}
            style={({ isActive }) => linkStyle(isActive)}>
            <Shield size={20} style={{ flexShrink: 0 }} />
            {!collapsed && <span>{t('sidebar.adminPanel')}</span>}
          </NavLink>
        )}
      </nav>

      {/* Bottom Nav */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {bottomItems.map((item) => (
          <NavLink key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
            style={({ isActive }) => linkStyle(isActive)}>
            <item.icon size={20} style={{ flexShrink: 0 }} />
            {!collapsed && <span>{t(`sidebar.${item.key}`)}</span>}
          </NavLink>
        ))}
        <button onClick={handleLogout} style={{
          ...linkStyle(false), background: 'transparent', border: 'none', cursor: 'pointer', width: '100%',
        }}>
          <LogOut size={20} style={{ flexShrink: 0 }} />
          {!collapsed && <span>{t('sidebar.logout')}</span>}
        </button>
      </div>

  
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger */}
      <button onClick={() => setMobileOpen(!mobileOpen)} className="mobile-menu-btn" style={{
        display: 'none', position: 'fixed', top: 14, left: 14, zIndex: 1001,
        padding: 8, borderRadius: 8, background: 'var(--accent-primary)',
        color: '#fff', border: 'none', cursor: 'pointer',
      }}>
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998,
      }} />}

      {/* Sidebar */}
      {/* Sidebar */}
      <aside className="sidebar" style={{
        position: 'fixed', top: 0, insetInlineStart: 0, bottom: 0,
        width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
        background: 'var(--bg-sidebar)', transition: 'var(--transition)',
        zIndex: 999, overflowY: 'auto', overflowX: 'hidden',
        transform: mobileOpen ? 'translateX(0)' : undefined,
      }}>
        {sidebarContent}
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          .sidebar { transform: translateX(${i18n.dir() === 'rtl' ? '100%' : '-100%'}); width: 280px !important; }
          ${mobileOpen ? '.sidebar { transform: translateX(0) !important; }' : ''}
          .collapse-btn { display: none !important; }
        }
      `}</style>
    </>
  );
}
