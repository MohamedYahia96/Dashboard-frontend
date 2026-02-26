import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import FloatingMiniTimer from '../study/FloatingMiniTimer';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Header collapsed={collapsed} />
      <main className="main-content" style={{
        marginInlineStart: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
        paddingTop: 'var(--header-height)',
        minHeight: '100vh',
        transition: 'var(--transition)',
      }}>
        <div style={{ padding: '28px', maxWidth: 1400 }}>
          <Outlet />
        </div>
      </main>
      <FloatingMiniTimer />
      <style>{`
        @media (max-width: 768px) {
          .main-content { margin-inline-start: 0 !important; }
        }
      `}</style>
    </div>
  );
}
