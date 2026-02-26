import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Plus, ArrowLeft, Pin, Trash2, Edit2, X, AlertCircle,
  ExternalLink, Star, BookOpen, Zap
} from 'lucide-react';
import { useToast } from '../hooks/useUtils';


interface Course {
  id: number; title: string; instructor?: string; url?: string;
  platform: string; status: string; totalHours: number; completedHours: number;
  rating?: number; notes?: string; isPinned: boolean;
  targetDate?: string; lastStudiedAt?: string; createdAt: string;
}

interface Track {
  id: number; name: string; icon: string; color: string; description?: string;
}

const PLATFORMS: { label: string; color: string; emoji: string }[] = [
  { label: 'Udemy', color: '#a435f0', emoji: '🟣' },
  { label: 'YouTube', color: '#ff0000', emoji: '🔴' },
  { label: 'Coursera', color: '#2a73cc', emoji: '🔵' },
  { label: 'Pluralsight', color: '#f15b2a', emoji: '🟠' },
  { label: 'Other', color: '#64748b', emoji: '⚪' },
];

const STATUS_OPTIONS: { value: string; label: string; color: string }[] = [
  { value: 'NotStarted', label: 'لم يبدأ', color: '#64748b' },
  { value: 'InProgress', label: 'قيد التنفيذ', color: '#f97316' },
  { value: 'Completed', label: 'مكتمل', color: '#22c55e' },
];

const statusKey = (s: string) => STATUS_OPTIONS.find(o => o.value === s);
const platformKey = (p: string) => PLATFORMS.find(o => o.label === p);

const emptyForm = {
  title: '', instructor: '', url: '', platform: 'Udemy',
  status: 'NotStarted', totalHours: '', completedHours: '',
  rating: '', notes: '', targetDate: '',
};

export default function CourseTrackPage() {
  const { trackId } = useParams<{ trackId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [track, setTrack] = useState<Track | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [form, setForm] = useState({ ...emptyForm });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [trackRes, coursesRes] = await Promise.all([
        api.get(`/course-tracks/${trackId}`),
        api.get(`/courses?trackId=${trackId}`),
      ]);
      setTrack(trackRes.data);
      setCourses(coursesRes.data);
    } catch { navigate('/courses'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [trackId]);

  const openCreate = () => {
    setEditCourse(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEdit = (course: Course) => {
    setEditCourse(course);
    setForm({
      title: course.title,
      instructor: course.instructor || '',
      url: course.url || '',
      platform: course.platform || 'Other',
      status: course.status || 'NotStarted',
      totalHours: String(course.totalHours),
      completedHours: String(course.completedHours),
      rating: course.rating !== undefined && course.rating !== null ? String(course.rating) : '',
      notes: course.notes || '',
      targetDate: course.targetDate ? course.targetDate.substring(0, 10) : '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    const payload = {
      title: form.title, instructor: form.instructor || null, url: form.url || null,
      platform: form.platform,
      status: form.status,
      totalHours: parseFloat(form.totalHours) || 0,
      completedHours: parseFloat(form.completedHours) || 0,
      rating: form.rating ? parseInt(form.rating) : null,
      notes: form.notes || null,
      targetDate: form.targetDate || null,
      courseTrackId: parseInt(trackId!),
    };
    try {
      if (editCourse) {
        await api.put(`/courses/${editCourse.id}`, payload);
        addToast('تم تحديث الكورس', 'success');
      } else {
        await api.post('/courses', payload);
        addToast('تمت إضافة الكورس', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch { addToast('حدث خطأ', 'error'); }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/courses/${id}`);
      addToast('تم الحذف', 'success');
      setConfirmDelete(null);
      fetchData();
    } catch { addToast('حدث خطأ', 'error'); }
  };

  const handleQuickStatus = async (course: Course) => {
    const order = ['NotStarted', 'InProgress', 'Completed'];
    const idx = order.indexOf(course.status);
    const nextStatus = order[(idx + 1) % 3];
    await api.put(`/courses/${course.id}`, { status: nextStatus });
    fetchData();
  };

  const handlePin = async (id: number) => {
    await api.put(`/courses/${id}/pin`);
    fetchData();
  };

  const handleStudy = async (course: Course) => {
    await api.put(`/courses/${course.id}/study`);
    navigate('/study-sessions', { state: { courseId: course.id, title: course.title } });
  };

  const getDaysLeft = (targetDate?: string) => {
    if (!targetDate) return null;
    const days = Math.ceil((new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Filtered courses (backend sends enums as strings via JsonStringEnumConverter)
  const filtered = courses.filter(c => {
    const matchSearch = !search
      || c.title.toLowerCase().includes(search.toLowerCase())
      || c.instructor?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || c.status === filterStatus;
    const matchPlatform = !filterPlatform || c.platform === filterPlatform;
    return matchSearch && matchStatus && matchPlatform;
  });

  // Stats for the track
  const total = courses.length;
  const completed = courses.filter(c => c.status === 'Completed').length;
  const inProgress = courses.filter(c => c.status === 'InProgress').length;
  const totalHours = courses.reduce((s, c) => s + c.completedHours, 0);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: '1px solid var(--border-color)', background: 'var(--input-bg)',
    color: 'var(--text-primary)', fontSize: 14, boxSizing: 'border-box',
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)}
    </div>
  );

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <button onClick={() => navigate('/courses')} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10,
          background: 'var(--bg-tertiary)', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
          fontSize: 13, fontWeight: 500,
        }}><ArrowLeft size={15} />الكورسات</button>
        <span style={{ color: 'var(--text-tertiary)' }}>›</span>
        <span style={{
          fontSize: 15, fontWeight: 700, color: track?.color,
          display: 'flex', alignItems: 'center', gap: 6,
        }}><BookOpen size={16} />{track?.name}</span>
      </div>

      {/* Track Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'الكورسات', value: total, color: '#6366f1' },
          { label: 'مكتمل', value: completed, color: '#22c55e' },
          { label: 'قيد التنفيذ', value: inProgress, color: '#f97316' },
          { label: 'ساعات المنجزة', value: `${totalHours.toFixed(1)}h`, color: '#14b8a6' },
        ].map((s, i) => (
          <div key={i} style={{
            padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: 14,
            border: '1px solid var(--border-color)', textAlign: 'center',
          }}>
            <p style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar + Add Button */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap', alignItems: 'center' }}>
        <input placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)} style={{
          ...inputStyle, width: 'auto', flex: 1, minWidth: 140,
        }} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="">كل الحالات</option>
          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="">كل المنصات</option>
          {PLATFORMS.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
        </select>
        <button onClick={openCreate} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10,
          background: `linear-gradient(135deg, ${track?.color}cc, ${track?.color})`,
          color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
        }}><Plus size={16} />إضافة كورس</button>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--bg-secondary)', borderRadius: 18, border: '2px dashed var(--border-color)' }}>
          <BookOpen size={44} style={{ color: 'var(--text-tertiary)', marginBottom: 12 }} />
          <p style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)', marginBottom: 6 }}>لا توجد كورسات</p>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>أضف أول كورس لهذا المسار</p>
          <button onClick={openCreate} style={{
            padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: track?.color, color: '#fff', fontWeight: 600,
          }}><Plus size={15} style={{ marginLeft: 6 }} />إضافة كورس</button>
        </div>
      )}

      {/* Course Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(course => {
          const pl = platformKey(course.platform) || PLATFORMS[4];
          const st = statusKey(course.status) || STATUS_OPTIONS[0];
          const progress = course.totalHours > 0 ? Math.round((course.completedHours / course.totalHours) * 100) : 0;
          const daysLeft = getDaysLeft(course.targetDate);

          return (
            <div key={course.id} style={{
              background: 'var(--bg-secondary)', borderRadius: 16, padding: '18px 20px',
              border: `1px solid ${course.isPinned ? (track?.color + '55') : 'var(--border-color)'}`,
              boxShadow: 'var(--card-shadow)',
            }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                {/* Platform badge */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  background: `${pl.color}22`,
                }}>{pl.emoji}</div>

                {/* Main content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{course.title}</span>
                    {/* Quick status pill */}
                    <button onClick={() => handleQuickStatus(course)} title="اضغط لتغيير الحالة" style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                      border: 'none', cursor: 'pointer',
                      background: `${st.color}22`, color: st.color,
                    }}>{st.label}</button>
                    {/* Platform label */}
                    <span style={{ fontSize: 11, color: pl.color, fontWeight: 500 }}>{pl.label}</span>
                    {/* Countdown */}
                    {daysLeft !== null && course.status !== 'Completed' && (
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                        background: daysLeft < 7 ? '#ef444422' : '#f9731622',
                        color: daysLeft < 7 ? '#ef4444' : '#f97316',
                      }}>
                        {daysLeft < 0 ? `تأخر ${Math.abs(daysLeft)} يوم` : `${daysLeft} يوم متبقي`}
                      </span>
                    )}
                  </div>

                  {course.instructor && (
                    <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6 }}>👨‍🏫 {course.instructor}</p>
                  )}

                  {/* Progress bar */}
                  {course.totalHours > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div style={{ flex: 1, height: 5, borderRadius: 4, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 4, width: `${progress}%`,
                          background: track?.color, transition: 'width 0.4s',
                        }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', minWidth: 56 }}>
                        {course.completedHours}h / {course.totalHours}h
                      </span>
                    </div>
                  )}

                  {/* Rating */}
                  {course.rating && (
                    <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={13} fill={s <= course.rating! ? '#eab308' : 'none'}
                          style={{ color: s <= course.rating! ? '#eab308' : 'var(--text-tertiary)' }} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 4, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {course.status !== 'Completed' && (
                    <button onClick={() => handleStudy(course)} title="ابدأ الدراسة" style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px',
                      borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 12,
                      background: `${track?.color}22`, color: track?.color,
                    }}><Zap size={13} />ابدأ</button>
                  )}
                  {course.url && (
                    <a href={course.url} target="_blank" rel="noreferrer" style={{
                      padding: 7, borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', display: 'flex',
                    }}><ExternalLink size={14} /></a>
                  )}
                  <button onClick={() => handlePin(course.id)} style={{
                    padding: 7, borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: course.isPinned ? `${track?.color}22` : 'var(--bg-tertiary)',
                    color: course.isPinned ? track?.color : 'var(--text-tertiary)',
                  }}><Pin size={14} /></button>
                  <button onClick={() => openEdit(course)} style={{
                    padding: 7, borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)',
                  }}><Edit2 size={14} /></button>
                  <button onClick={() => setConfirmDelete(course.id)} style={{
                    padding: 7, borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)',
                  }}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setShowModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(5,6,31,0.55)' }} />
          <div style={{
            position: 'relative', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto',
            background: 'var(--bg-secondary)', borderRadius: 20, padding: 28,
            border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>{editCourse ? 'تعديل الكورس' : 'إضافة كورس'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input placeholder="اسم الكورس *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} />
              <input placeholder="المدرس / المنشئ" value={form.instructor} onChange={e => setForm({ ...form, instructor: e.target.value })} style={inputStyle} />
              <input placeholder="رابط الكورس" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} style={inputStyle} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} style={inputStyle}>
                  {PLATFORMS.map(p => <option key={p.label} value={p.label}>{p.emoji} {p.label}</option>)}
                </select>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                  {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input type="number" placeholder="إجمالي الساعات" value={form.totalHours} onChange={e => setForm({ ...form, totalHours: e.target.value })} style={inputStyle} />
                <input type="number" placeholder="الساعات المنجزة" value={form.completedHours} onChange={e => setForm({ ...form, completedHours: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4, display: 'block' }}>التاريخ المستهدف</label>
                  <input type="date" value={form.targetDate} onChange={e => setForm({ ...form, targetDate: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4, display: 'block' }}>التقييم (1-5)</label>
                  <div style={{ display: 'flex', gap: 6, paddingTop: 10 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setForm({ ...form, rating: String(n) })} style={{
                        padding: '4px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
                        background: parseInt(form.rating) >= n ? '#eab30822' : 'var(--bg-tertiary)',
                        color: parseInt(form.rating) >= n ? '#eab308' : 'var(--text-tertiary)',
                        fontSize: 18,
                      }}>★</button>
                    ))}
                  </div>
                </div>
              </div>
              <textarea placeholder="ملاحظاتك عن الكورس..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              <button onClick={handleSave} style={{
                padding: 14, borderRadius: 12,
                background: `linear-gradient(135deg, ${track?.color}cc, ${track?.color})`,
                color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', marginTop: 4,
              }}>{editCourse ? 'حفظ التعديلات' : 'إضافة الكورس'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setConfirmDelete(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(5,6,31,0.55)' }} />
          <div style={{
            position: 'relative', width: 360, background: 'var(--bg-secondary)',
            borderRadius: 18, padding: 28, border: '1px solid var(--border-color)', textAlign: 'center',
          }}>
            <AlertCircle size={40} style={{ color: '#ef4444', marginBottom: 12 }} />
            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>حذف الكورس؟</p>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 18 }}>لا يمكن التراجع عن هذا الإجراء.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{
                flex: 1, padding: 10, borderRadius: 10, background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)', border: 'none', cursor: 'pointer', fontWeight: 500,
              }}>إلغاء</button>
              <button onClick={() => handleDelete(confirmDelete)} style={{
                flex: 1, padding: 10, borderRadius: 10, background: '#ef4444',
                color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600,
              }}>حذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
