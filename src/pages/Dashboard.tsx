import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { ListTodo, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const { t } = useTranslation();
  useAuth();
  const [stats, setStats] = useState({ totalTasks: 0, completed: 0, inProgress: 0, overdue: 0, dailyActivity: [] as any[], categoryStats: [] as any[] });
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports'),
      api.get('/activity-log?page=1&pageSize=8'),
    ]).then(([reportRes, logRes]) => {
      setStats(reportRes.data);
      setActivities(logRes.data.logs || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: t('dashboard.totalTasks'), value: stats.totalTasks, icon: ListTodo, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { label: t('dashboard.completed'), value: stats.completed, icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: t('dashboard.inProgress'), value: stats.inProgress, icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: t('dashboard.overdue'), value: stats.overdue, icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  ];

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
      {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
      <div className="skeleton" style={{ height: 320, borderRadius: 16, gridColumn: '1 / -1' }} />
    </div>
  );

  return (
    <div>
      {/* Stat Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 28,
      }}>
        {statCards.map((card) => (
          <div key={card.label} style={{
            background: 'var(--bg-secondary)', borderRadius: 16, padding: '24px 22px',
            border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)',
            transition: 'var(--transition)', cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 8 }}>{card.label}</p>
                <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>{card.value}</p>
              </div>
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: card.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <card.icon size={24} style={{ color: card.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts + Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        {/* Weekly Chart */}
        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 16, padding: 24,
          border: '1px solid var(--border-color)',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>{t('dashboard.weeklyOverview')}</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.dailyActivity.slice(-7)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
                tickFormatter={(d) => new Date(d).toLocaleDateString('en', { weekday: 'short' })} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 10 }} />
              <Bar dataKey="created" fill="#6366f1" radius={[6, 6, 0, 0]} name="Created" />
              <Bar dataKey="completed" fill="#10b981" radius={[6, 6, 0, 0]} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 16, padding: 24,
          border: '1px solid var(--border-color)',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{t('dashboard.recentActivity')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activities.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: 30 }}>{t('dashboard.noTasks')}</p>
            ) : activities.map((act: any) => (
              <div key={act.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 12px', borderRadius: 10, background: 'var(--bg-tertiary)',
              }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{act.action}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 8 }}>{act.entityType}</span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                  {new Date(act.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Progress */}
      {stats.categoryStats.length > 0 && (
        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 16, padding: 24, marginTop: 20,
          border: '1px solid var(--border-color)',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Category Progress</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {stats.categoryStats.map((cat: any) => (
              <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', background: cat.color, flexShrink: 0,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{cat.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{cat.completed}/{cat.total}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 3, background: cat.color,
                      width: `${cat.progress}%`, transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns: '1fr 380px'"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
