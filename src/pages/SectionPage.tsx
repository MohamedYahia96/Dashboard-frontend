import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { Plus, Pin, Trash2, GripVertical, LayoutList, Columns, X, AlertCircle, Edit2 } from 'lucide-react';
import { useToast } from '../hooks/useUtils';

interface Task {
  id: number; title: string; description?: string; status: string;
  priority: string; progress: number; isPinned: boolean; dueDate?: string;
  category?: any; taskTags?: any[]; order: number;
}

interface SectionPageProps { categoryId: number; }

export default function SectionPage({ categoryId }: SectionPageProps) {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', dueDate: '', recurrenceType: 'None' });

  const fetchTasks = () => {
    setLoading(true);
    api.get(`/tasks?category=${categoryId}`)
      .then((r) => setTasks(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTasks(); }, [categoryId]);

  const handleCreate = async () => {
    try {
      if (editTask) {
        await api.put(`/tasks/${editTask.id}`, { ...form, categoryId });
      } else {
        await api.post('/tasks', { ...form, categoryId });
      }
      addToast(t('common.success'), 'success');
      setShowModal(false);
      setForm({ title: '', description: '', priority: 'Medium', dueDate: '', recurrenceType: 'None' });
      setEditTask(null);
      fetchTasks();
    } catch { addToast(t('common.error'), 'error'); }
  };

  const handleEditClick = (task: Task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'Medium',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      recurrenceType: 'None'
    });
    setShowModal(true);
  };

  const handleUpdate = async (id: number, data: any) => {
    try {
      await api.put(`/tasks/${id}`, data);
      fetchTasks();
    } catch { addToast(t('common.error'), 'error'); }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/tasks/${id}`);
      addToast(t('common.success'), 'success');
      setConfirmDelete(null);
      fetchTasks();
    } catch { addToast(t('common.error'), 'error'); }
  };

  const togglePin = async (id: number) => {
    await api.put(`/tasks/${id}/pin`);
    fetchTasks();
  };

  // Helper to get color style
  const getStatusColor = (status: string) => {
      if (status === 'Todo') return 'var(--accent-primary)';
      if (status === 'InProgress') return 'var(--text-primary)';
      return 'var(--text-secondary)';
  }

  const kanbanStatuses = ['Todo', 'InProgress', 'Done'];

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
    </div>
  );

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: '1px solid var(--border-color)', background: 'var(--input-bg)',
    color: 'var(--text-primary)', fontSize: 14,
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setView('list')} style={{
            padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            background: view === 'list' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
            color: view === 'list' ? 'var(--bg-primary)' : 'var(--text-secondary)', border: 'none',
          }}><LayoutList size={15} style={{ marginRight: 6 }} />{t('tasks.listView')}</button>
          <button onClick={() => setView('kanban')} style={{
            padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            background: view === 'kanban' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
            color: view === 'kanban' ? 'var(--bg-primary)' : 'var(--text-secondary)', border: 'none',
          }}><Columns size={15} style={{ marginRight: 6 }} />{t('tasks.kanbanView')}</button>
        </div>
        <button onClick={() => { setEditTask(null); setForm({ title: '', description: '', priority: 'Medium', dueDate: '', recurrenceType: 'None' }); setShowModal(true); }} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10,
          background: 'linear-gradient(135deg, var(--accent-primary-light), var(--accent-primary))', color: 'var(--bg-primary)',
          fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
        }}><Plus size={18} />{t('tasks.addTask')}</button>
      </div>

      {/* Pinned Tasks */}
      {tasks.filter(t => t.isPinned).length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 10, textTransform: 'uppercase' }}>📌 Pinned</p>
          {tasks.filter(t => t.isPinned).map(task => renderTaskCard(task))}
        </div>
      )}

      {/* List View */}
      {view === 'list' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tasks.filter(t => !t.isPinned).length === 0 && (
            <p style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>{t('tasks.noResults')}</p>
          )}
          {tasks.filter(t => !t.isPinned).map(task => renderTaskCard(task))}
        </div>
      ) : (
        /* Kanban View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {kanbanStatuses.map(status => (
            <div key={status} style={{
              background: 'var(--bg-tertiary)', borderRadius: 14, padding: 16, minHeight: 300,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusColor(status) }} />
                <span style={{ fontWeight: 600, fontSize: 14 }}>{t(`tasks.${status === 'Todo' ? 'todo' : status === 'InProgress' ? 'inProgress' : 'done'}`)}</span>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
                  {tasks.filter(t => t.status === status).length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tasks.filter(t => t.status === status).map(task => (
                  <div key={task.id} style={{
                    background: 'var(--bg-secondary)', borderRadius: 10, padding: 14,
                    border: '1px solid var(--border-color)', cursor: 'pointer',
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>{task.title}</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                        background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                      }}>{task.priority}</span>
                      {task.progress > 0 && (
                        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${task.progress}%`, background: getStatusColor(task.status), borderRadius: 2 }} />
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      {kanbanStatuses.filter(s => s !== status).map(s => (
                        <button key={s} onClick={(e) => { e.stopPropagation(); handleUpdate(task.id, { status: s }); }} style={{
                          fontSize: 10, padding: '3px 8px', borderRadius: 5, cursor: 'pointer',
                          background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: 'none',
                        }}>→ {s}</button>
                      ))}
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                        <button onClick={(e) => { e.stopPropagation(); handleEditClick(task); }} style={{ padding: 4, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><Edit2 size={13} /></button>
                        <button onClick={(e) => { e.stopPropagation(); togglePin(task.id); }} style={{ padding: 4, borderRadius: 4, background: task.isPinned ? 'var(--accent-primary-bg)' : 'transparent', border: 'none', cursor: 'pointer', color: task.isPinned ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}><Pin size={13} /></button>
                        <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(task.id); }} style={{ padding: 4, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><Trash2 size={13} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setShowModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(5,6,31,0.5)' }} />
          <div style={{
            position: 'relative', width: '100%', maxWidth: 480, background: 'var(--bg-secondary)',
            borderRadius: 18, padding: 28, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 22 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>{editTask ? t('tasks.editTask') : t('tasks.addTask')}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input placeholder={t('tasks.title')} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} />
              <textarea placeholder={t('tasks.description')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} style={inputStyle}>
                  <option value="Low">{t('tasks.low')}</option>
                  <option value="Medium">{t('tasks.medium')}</option>
                  <option value="High">{t('tasks.high')}</option>
                </select>
                <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} style={inputStyle} />
              </div>
              <select value={form.recurrenceType} onChange={(e) => setForm({ ...form, recurrenceType: e.target.value })} style={inputStyle}>
                <option value="None">{t('tasks.none')}</option>
                <option value="Daily">{t('tasks.daily')}</option>
                <option value="Weekly">{t('tasks.weekly')}</option>
                <option value="Monthly">{t('tasks.monthly')}</option>
              </select>
              <button onClick={handleCreate} style={{
                padding: 14, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent-primary-light), var(--accent-primary))',
                color: 'var(--bg-primary)', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer',
              }}>{editTask ? t('common.save') : t('common.add')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setConfirmDelete(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(5,6,31,0.5)' }} />
          <div style={{
            position: 'relative', width: 360, background: 'var(--bg-secondary)',
            borderRadius: 16, padding: 28, border: '1px solid var(--border-color)', textAlign: 'center',
          }}>
            <AlertCircle size={40} style={{ color: 'var(--accent-danger)', marginBottom: 12 }} />
            <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{t('tasks.confirmDelete')}</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button onClick={() => setConfirmDelete(null)} style={{
                flex: 1, padding: 10, borderRadius: 8, background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)', border: 'none', cursor: 'pointer', fontWeight: 500,
              }}>{t('common.cancel')}</button>
              <button onClick={() => handleDelete(confirmDelete)} style={{
                flex: 1, padding: 10, borderRadius: 8, background: 'var(--accent-primary)', opacity: 0.8,
                color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500,
              }}>{t('common.delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function renderTaskCard(task: Task) {
    return (
      <div key={task.id} style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
        background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border-color)',
        boxShadow: 'var(--card-shadow)', transition: 'var(--transition)',
      }}>
        <GripVertical size={16} style={{ color: 'var(--text-tertiary)', cursor: 'grab', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{task.title}</span>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
              background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
            }}>{task.priority}</span>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
              background: 'var(--bg-tertiary)', color: getStatusColor(task.status),
            }}>{task.status}</span>
          </div>
          {task.description && <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 6 }}>{task.description}</p>}
          {task.progress > 0 && (
            <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-tertiary)', overflow: 'hidden', maxWidth: 200 }}>
              <div style={{ height: '100%', width: `${task.progress}%`, background: getStatusColor(task.status), borderRadius: 2, transition: 'width 0.4s' }} />
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => handleEditClick(task)} style={{ padding: 6, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
            <Edit2 size={15} />
          </button>
          <button onClick={() => togglePin(task.id)} style={{ padding: 6, borderRadius: 6, background: task.isPinned ? 'var(--accent-primary-bg)' : 'transparent', border: 'none', cursor: 'pointer', color: task.isPinned ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}>
            <Pin size={15} />
          </button>
          <button onClick={() => setConfirmDelete(task.id)} style={{ padding: 6, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
            <Trash2 size={15} />
          </button>
        </div>
        {/* Progress slider */}
        <input type="range" min={0} max={100} value={task.progress}
          onChange={(e) => handleUpdate(task.id, { progress: parseInt(e.target.value) })}
          style={{ width: 80, cursor: 'pointer' }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', minWidth: 32 }}>{task.progress}%</span>
      </div>
    );
  }
}
