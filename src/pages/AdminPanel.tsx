import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { Shield, Trash2, AlertCircle } from 'lucide-react';
import { useToast } from '../hooks/useUtils';

export default function AdminPanel() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchUsers = () => {
    api.get('/admin/users').then((r) => setUsers(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const changeRole = async (userId: string, role: string) => {
    await api.put(`/admin/users/${userId}/role`, { role });
    addToast(t('common.success'), 'success');
    fetchUsers();
  };

  const deleteUser = async (userId: string) => {
    await api.delete(`/admin/users/${userId}`);
    addToast(t('common.success'), 'success');
    setConfirmDelete(null);
    fetchUsers();
  };

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12 }} />)}</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <Shield size={24} style={{ color: 'var(--accent-primary)' }} />
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>{t('admin.title')}</h2>
      </div>

      <div style={{ background: 'var(--bg-secondary)', borderRadius: 14, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              {[t('auth.fullName'), t('auth.email'), t('admin.role'), ''].map(h => (
                <th key={h} style={{ padding: '14px 18px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px 18px', fontWeight: 500 }}>{u.fullName}</td>
                <td style={{ padding: '12px 18px', color: 'var(--text-secondary)', fontSize: 14 }}>{u.email}</td>
                <td style={{ padding: '12px 18px' }}>
                  <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)} style={{
                    padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)',
                    background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer',
                  }}>
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>
                <td style={{ padding: '12px 18px' }}>
                  <button onClick={() => setConfirmDelete(u.id)} style={{
                    padding: 6, borderRadius: 6, background: 'rgba(239,68,68,0.1)',
                    color: '#ef4444', border: 'none', cursor: 'pointer',
                  }}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setConfirmDelete(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <div style={{ position: 'relative', width: 360, background: 'var(--bg-secondary)', borderRadius: 16, padding: 28, textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <AlertCircle size={40} style={{ color: '#ef4444', marginBottom: 12 }} />
            <p style={{ fontWeight: 600, marginBottom: 18 }}>{t('admin.confirmDeleteUser')}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: 10, borderRadius: 8, background: 'var(--bg-tertiary)', border: 'none', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>{t('common.cancel')}</button>
              <button onClick={() => deleteUser(confirmDelete)} style={{ flex: 1, padding: 10, borderRadius: 8, background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500 }}>{t('common.delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
