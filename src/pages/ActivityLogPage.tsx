import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { Activity } from 'lucide-react';

export default function ActivityLogPage() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    setLoading(true);
    api.get(`/activity-log?page=${page}&pageSize=20`).then(r => {
      setLogs(r.data.logs || []);
      setTotal(r.data.total || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, [page]);

  const actionColors: Record<string, string> = { Created: '#10b981', Updated: '#3b82f6', Deleted: '#ef4444', Login: '#6366f1', Register: '#8b5cf6' };

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 50, borderRadius: 10 }} />)}</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <Activity size={24} style={{ color: 'var(--accent-primary)' }} />
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>{t('sidebar.activityLog')}</h2>
        <span style={{ fontSize: 13, color: 'var(--text-tertiary)', marginLeft: 10 }}>{total} entries</span>
      </div>

      <div style={{ background: 'var(--bg-secondary)', borderRadius: 14, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        {logs.map((log: any) => (
          <div key={log.id} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
            borderBottom: '1px solid var(--border-color)',
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: actionColors[log.action] || '#6366f1',
            }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 500, fontSize: 14 }}>{log.action}</span>
              <span style={{ fontSize: 13, color: 'var(--text-tertiary)', marginLeft: 10 }}>{log.entityType}</span>
              {log.details && <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{log.details}</p>}
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
              {new Date(log.createdAt).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {total > 20 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)', cursor: page > 1 ? 'pointer' : 'not-allowed',
            color: 'var(--text-primary)',
          }}>←</button>
          <span style={{ padding: '8px 16px', fontSize: 14, color: 'var(--text-secondary)' }}>{page}</span>
          <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)', cursor: page * 20 < total ? 'pointer' : 'not-allowed',
            color: 'var(--text-primary)',
          }}>→</button>
        </div>
      )}
    </div>
  );
}
