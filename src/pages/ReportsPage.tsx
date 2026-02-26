import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

export default function ReportsPage() {
  const { t } = useTranslation();
  const [report, setReport] = useState<any>(null);
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  const fetchReport = () => {
    setLoading(true);
    api.get(`/reports?from=${from}&to=${to}`).then(r => setReport(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchReport(); }, [from, to]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6'];

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BarChart3 size={24} style={{ color: 'var(--accent-primary)' }} />
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>{t('reports.title')}</h2>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('reports.from')}</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{
            padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)',
            background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: 13,
          }} />
          <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('reports.to')}</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{
            padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)',
            background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: 13,
          }} />
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: t('dashboard.totalTasks'), value: report?.totalTasks, color: '#6366f1' },
          { label: t('dashboard.completed'), value: report?.completedTasks, color: '#10b981' },
          { label: t('dashboard.inProgress'), value: report?.inProgressTasks, color: '#f59e0b' },
          { label: t('reports.completionRate'), value: `${report?.completionRate}%`, color: '#3b82f6' },
        ].map(c => (
          <div key={c.label} style={{
            background: 'var(--bg-secondary)', borderRadius: 14, padding: '20px 18px',
            border: '1px solid var(--border-color)', textAlign: 'center',
          }}>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{c.label}</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Daily Activity */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 14, padding: 22, border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{t('reports.dailyActivity')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={report?.dailyActivity || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                tickFormatter={(d) => new Date(d).toLocaleDateString('en', { day: '2-digit', month: 'short' })} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
              <Bar dataKey="created" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 14, padding: 22, border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{t('reports.categoryStats')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={report?.categoryStats || []} dataKey="total" nameKey="name" cx="50%" cy="50%"
                outerRadius={80} label={(entry: any) => `${entry.name}: ${entry.total}`}>
                {report?.categoryStats?.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
