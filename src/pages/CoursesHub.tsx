import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Plus, BookOpen, X, Trash2, Edit2, AlertCircle,
  GraduationCap, CheckCircle, Clock, Zap
} from 'lucide-react';
import { useToast } from '../hooks/useUtils';

const ICONS = [
  'BookOpen', 'Code', 'Monitor', 'Globe', 'Brain', 'Zap', 'Star',
  'Music', 'Video', 'Database', 'Cpu', 'Layers', 'Award', 'Target'
];

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6'
];

interface Track {
  id: number; name: string; icon: string; color: string; description?: string;
  totalCourses: number; completedCourses: number; inProgressCourses: number;
  totalHours: number; completedHours: number;
}

interface LastStudied {
  id: number; title: string; completedHours: number; totalHours: number;
  status: string; platform: string; courseTrack: { id: number; name: string; color: string; };
}

export default function CoursesHub() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [lastStudied, setLastStudied] = useState<LastStudied | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTrack, setEditTrack] = useState<Track | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', icon: 'BookOpen', color: '#6366f1', description: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tracksRes, lastRes] = await Promise.allSettled([
        api.get('/course-tracks'),
        api.get('/courses/last-studied'),
      ]);
      if (tracksRes.status === 'fulfilled') setTracks(tracksRes.value.data);
      if (lastRes.status === 'fulfilled' && lastRes.value.status === 200) setLastStudied(lastRes.value.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditTrack(null);
    setForm({ name: '', icon: 'BookOpen', color: '#6366f1', description: '' });
    setShowModal(true);
  };

  const openEdit = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    setEditTrack(track);
    setForm({ name: track.name, icon: track.icon, color: track.color, description: track.description || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    try {
      if (editTrack) {
        await api.put(`/course-tracks/${editTrack.id}`, form);
        addToast('Track updated', 'success');
      } else {
        await api.post('/course-tracks', form);
        addToast('Track created', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch { addToast('Error saving track', 'error'); }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/course-tracks/${id}`);
      addToast('Track deleted', 'success');
      setConfirmDelete(null);
      fetchData();
    } catch { addToast('Error deleting track', 'error'); }
  };

  const handleStudy = async (e: React.MouseEvent, courseId: number, title: string) => {
    e.stopPropagation();
    await api.put(`/courses/${courseId}/study`);
    navigate('/study-sessions', { state: { courseId, title } });
  };

  // Aggregate stats
  const totalCourses = tracks.reduce((s, t) => s + t.totalCourses, 0);
  const completedCourses = tracks.reduce((s, t) => s + t.completedCourses, 0);
  const totalHours = tracks.reduce((s, t) => s + t.completedHours, 0);

  const getProgress = (track: Track) =>
    track.totalCourses === 0 ? 0 : Math.round((track.completedCourses / track.totalCourses) * 100);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: '1px solid var(--border-color)', background: 'var(--input-bg)',
    color: 'var(--text-primary)', fontSize: 14, boxSizing: 'border-box',
  };

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
      {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 18 }} />)}
    </div>
  );

  return (
    <div>
      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { icon: <GraduationCap size={20} />, label: 'Total Courses', value: totalCourses, color: '#6366f1' },
          { icon: <CheckCircle size={20} />, label: 'Completed', value: completedCourses, color: '#22c55e' },
          { icon: <Clock size={20} />, label: 'Hours Learned', value: `${totalHours.toFixed(1)}h`, color: '#f97316' },
        ].map((stat, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px',
            background: 'var(--bg-secondary)', borderRadius: 16,
            border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: `${stat.color}22`, color: stat.color,
            }}>{stat.icon}</div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{stat.value}</p>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access: Continue Learning */}
      {lastStudied && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 18, padding: '16px 22px',
          background: 'var(--bg-secondary)', borderRadius: 16, border: `1px solid ${lastStudied.courseTrack.color}44`,
          marginBottom: 28, boxShadow: 'var(--card-shadow)',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: `${lastStudied.courseTrack.color}22`,
            color: lastStudied.courseTrack.color, flexShrink: 0,
          }}><Zap size={22} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 3, textTransform: 'uppercase', fontWeight: 600 }}>
              واصل التعلم
            </p>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{lastStudied.title}</p>
            <div style={{ height: 5, borderRadius: 4, background: 'var(--bg-tertiary)', overflow: 'hidden', maxWidth: 200 }}>
              <div style={{
                height: '100%', borderRadius: 4,
                width: lastStudied.totalHours > 0 ? `${(lastStudied.completedHours / lastStudied.totalHours) * 100}%` : '0%',
                background: lastStudied.courseTrack.color,
              }} />
            </div>
          </div>
          <button onClick={(e) => handleStudy(e, lastStudied.id, lastStudied.title)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
            borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
            background: lastStudied.courseTrack.color, color: '#fff', flexShrink: 0,
          }}>أكمل الآن</button>
        </div>
      )}

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>مساراتي</h2>
        <button onClick={openCreate} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
          borderRadius: 10, background: 'linear-gradient(135deg, var(--accent-primary-light), var(--accent-primary))',
          color: 'var(--bg-primary)', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
        }}><Plus size={16} /> مسار جديد</button>
      </div>

      {/* Empty State */}
      {tracks.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '64px 24px', background: 'var(--bg-secondary)',
          borderRadius: 20, border: '2px dashed var(--border-color)',
        }}>
          <GraduationCap size={52} style={{ color: 'var(--text-tertiary)', marginBottom: 16 }} />
          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>لا توجد مسارات بعد</p>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 24 }}>أنشئ أول مسار لتنظيم كورساتك</p>
          <button onClick={openCreate} style={{
            padding: '12px 28px', borderRadius: 12,
            background: 'linear-gradient(135deg, var(--accent-primary-light), var(--accent-primary))',
            color: 'var(--bg-primary)', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer',
          }}><Plus size={16} style={{ marginLeft: 6 }} />أنشئ أول مسار</button>
        </div>
      )}

      {/* Track Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 18 }}>
        {tracks.map(track => {
          const progress = getProgress(track);
          const circumference = 2 * Math.PI * 22;
          const strokeDashoffset = circumference - (progress / 100) * circumference;
          return (
            <div key={track.id} onClick={() => navigate(`/courses/${track.id}`)} style={{
              background: 'var(--bg-secondary)', borderRadius: 20, padding: '22px',
              border: `1px solid var(--border-color)`, cursor: 'pointer',
              boxShadow: 'var(--card-shadow)', transition: 'transform 0.2s, box-shadow 0.2s',
              position: 'relative',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 32px ${track.color}33`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--card-shadow)';
              }}
            >
              {/* Top row: icon + actions */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', background: `${track.color}22`, color: track.color, fontSize: 24,
                }}><BookOpen size={24} /></div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={(e) => openEdit(e, track)} style={{
                    padding: 6, borderRadius: 8, border: 'none', background: 'var(--bg-tertiary)',
                    color: 'var(--text-tertiary)', cursor: 'pointer',
                  }}><Edit2 size={14} /></button>
                  <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(track.id); }} style={{
                    padding: 6, borderRadius: 8, border: 'none', background: 'var(--bg-tertiary)',
                    color: 'var(--text-tertiary)', cursor: 'pointer',
                  }}><Trash2 size={14} /></button>
                </div>
              </div>

              {/* Name & description */}
              <p style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-primary)', marginBottom: 4 }}>{track.name}</p>
              {track.description && <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 12 }}>{track.description}</p>}

              {/* Stats + Progress Ring */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    <b style={{ color: 'var(--text-primary)' }}>{track.totalCourses}</b> كورس
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    {track.completedCourses} مكتمل · {track.inProgressCourses} قيد التنفيذ
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    {track.completedHours.toFixed(1)} / {track.totalHours.toFixed(1)} ساعة
                  </span>
                </div>
                {/* SVG Progress Ring */}
                <div style={{ position: 'relative', width: 60, height: 60 }}>
                  <svg width="60" height="60" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="30" cy="30" r="22" fill="none" stroke="var(--bg-tertiary)" strokeWidth="5" />
                    <circle cx="30" cy="30" r="22" fill="none" stroke={track.color} strokeWidth="5"
                      strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
                  </svg>
                  <span style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: 'var(--text-primary)',
                  }}>{progress}%</span>
                </div>
              </div>

              {/* Color accent bar at bottom */}
              <div style={{ height: 4, borderRadius: 4, background: track.color, marginTop: 18, opacity: 0.7 }} />
            </div>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setShowModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(5,6,31,0.55)' }} />
          <div style={{
            position: 'relative', width: '100%', maxWidth: 460, background: 'var(--bg-secondary)',
            borderRadius: 20, padding: 28, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>{editTrack ? 'تعديل المسار' : 'مسار جديد'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input placeholder="اسم المسار (مثال: تطوير الويب)" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              <input placeholder="وصف مختصر (اختياري)" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} style={inputStyle} />

              {/* Icon Picker */}
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8, fontWeight: 600 }}>الأيقونة</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ICONS.map(icon => (
                    <button key={icon} onClick={() => setForm({ ...form, icon })} style={{
                      padding: '8px 12px', borderRadius: 10, fontSize: 12,
                      border: form.icon === icon ? `2px solid ${form.color}` : '2px solid var(--border-color)',
                      background: form.icon === icon ? `${form.color}22` : 'var(--bg-tertiary)',
                      color: form.icon === icon ? form.color : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500,
                    }}>{icon}</button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8, fontWeight: 600 }}>اللون</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {COLORS.map(color => (
                    <button key={color} onClick={() => setForm({ ...form, color })} style={{
                      width: 32, height: 32, borderRadius: '50%', background: color, cursor: 'pointer',
                      border: form.color === color ? '3px solid var(--text-primary)' : '3px solid transparent',
                    }} />
                  ))}
                </div>
              </div>

              <button onClick={handleSave} style={{
                padding: 14, borderRadius: 12,
                background: 'linear-gradient(135deg, var(--accent-primary-light), var(--accent-primary))',
                color: 'var(--bg-primary)', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', marginTop: 4,
              }}>{editTrack ? 'حفظ التعديلات' : 'إنشاء المسار'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setConfirmDelete(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(5,6,31,0.55)' }} />
          <div style={{
            position: 'relative', width: 380, background: 'var(--bg-secondary)',
            borderRadius: 18, padding: 28, border: '1px solid var(--border-color)', textAlign: 'center',
          }}>
            <AlertCircle size={44} style={{ color: 'var(--accent-danger)', marginBottom: 14 }} />
            <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>حذف المسار؟</p>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>سيتم حذف جميع الكورسات المرتبطة بهذا المسار بشكل نهائي.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{
                flex: 1, padding: 11, borderRadius: 10, background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)', border: 'none', cursor: 'pointer', fontWeight: 500,
              }}>إلغاء</button>
              <button onClick={() => handleDelete(confirmDelete)} style={{
                flex: 1, padding: 11, borderRadius: 10, background: 'var(--accent-danger)',
                color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600,
              }}>حذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
