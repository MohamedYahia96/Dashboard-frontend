import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import {
  Plus, Trash2, Edit2, X, AlertCircle, ChevronDown, ChevronRight,
  GraduationCap, BookOpen, Building2, Award, TrendingUp, CheckCircle2,
  Clock, BarChart3
} from 'lucide-react';
import { useToast } from '../hooks/useUtils';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AcademicSubject {
  id: number; name: string; credits: number;
  grade?: number; gradePoint?: string;
  status: 'NotStarted' | 'InProgress' | 'Completed'; notes?: string;
  semesterId: number; createdAt: string;
}
interface AcademicSemester {
  id: number; semesterNumber: number; academicYearId: number;
  subjects: AcademicSubject[];
}
interface AcademicYear {
  id: number; yearNumber: number; facultyId: number;
  semesters: AcademicSemester[];
}
interface Faculty {
  id: number; name: string; description?: string; universityId: number;
  stage: 'Bachelor' | 'Diploma' | 'Master' | 'PhD';
  academicYears: AcademicYear[];
}
interface University {
  id: number; name: string; description?: string; color: string;
  faculties: Faculty[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const UNIVERSITY_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
  '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#06b6d4',
];

const STATUS_CONFIG = {
  NotStarted: { label: 'لم يبدأ', color: '#64748b', bg: '#64748b22' },
  InProgress: { label: 'قيد الدراسة', color: '#f97316', bg: '#f9731622' },
  Completed: { label: 'مكتمل', color: '#22c55e', bg: '#22c55e22' },
};

const STAGE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  Bachelor: { label: 'بكالوريوس', color: '#3b82f6', bg: '#3b82f622' },
  Diploma: { label: 'دبلوم', color: '#8b5cf6', bg: '#8b5cf622' },
  Master: { label: 'ماجستير', color: '#ec4899', bg: '#ec489922' },
  PhD: { label: 'دكتوراه', color: '#f59e0b', bg: '#f59e0b22' },
};

const GRADE_COLORS: Record<string, string> = {
  'A+': '#10b981', 'A': '#22c55e', 'B+': '#3b82f6', 'B': '#60a5fa',
  'C+': '#f59e0b', 'C': '#fbbf24', 'D+': '#f97316', 'D': '#fb923c',
  'F': '#ef4444',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function calcFacultyStats(faculty: Faculty) {
  const allSubjects = faculty.academicYears.flatMap(y =>
    y.semesters.flatMap(s => s.subjects));
  const total = allSubjects.length;
  const completed = allSubjects.filter(s => s.status === 'Completed').length;
  const graded = allSubjects.filter(s => s.grade !== undefined && s.grade !== null);
  const gpa = graded.length > 0
    ? graded.reduce((sum, s) => sum + gradeToPoint(s.gradePoint), 0) / graded.length
    : null;
  return { total, completed, gpa };
}

function gradeToPoint(gp?: string): number {
  const map: Record<string, number> = {
    'A+': 4.0, 'A': 4.0, 'B+': 3.5, 'B': 3.0,
    'C+': 2.5, 'C': 2.0, 'D+': 1.5, 'D': 1.0, 'F': 0.0,
  };
  return map[gp || ''] ?? 0;
}

function calcSemesterGPA(subjects: AcademicSubject[]): number | null {
  const graded = subjects.filter(s => s.grade !== undefined && s.grade !== null);
  if (graded.length === 0) return null;
  const totalCredits = graded.reduce((s, sub) => s + sub.credits, 0);
  if (totalCredits === 0) return null;
  const weightedSum = graded.reduce((s, sub) => s + gradeToPoint(sub.gradePoint) * sub.credits, 0);
  return weightedSum / totalCredits;
}

// ─── Shared input style ───────────────────────────────────────────────────────
const inp = (extra?: React.CSSProperties): React.CSSProperties => ({
  width: '100%', padding: '10px 13px', borderRadius: 10, boxSizing: 'border-box',
  border: '1px solid var(--border-color)', background: 'var(--input-bg)',
  color: 'var(--text-primary)', fontSize: 14, ...extra,
});

// ─── Modal wrapper ────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(5,6,31,0.6)' }} />
      <div style={{
        position: 'relative', width: '100%', maxWidth: 520, maxHeight: '88vh', overflowY: 'auto',
        background: 'var(--bg-secondary)', borderRadius: 20, padding: 28,
        border: '1px solid var(--border-color)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h3 style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-primary)' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4 }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────
function DeleteConfirm({ message, onCancel, onConfirm }: { message: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onCancel} style={{ position: 'absolute', inset: 0, background: 'rgba(5,6,31,0.6)' }} />
      <div style={{
        position: 'relative', width: 360, background: 'var(--bg-secondary)',
        borderRadius: 18, padding: 28, border: '1px solid var(--border-color)', textAlign: 'center',
      }}>
        <AlertCircle size={40} style={{ color: '#ef4444', marginBottom: 12 }} />
        <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 8, color: 'var(--text-primary)' }}>{message}</p>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 20 }}>لا يمكن التراجع عن هذا الإجراء.</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: 10, borderRadius: 10, background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: 'none', cursor: 'pointer', fontWeight: 500 }}>إلغاء</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: 10, borderRadius: 10, background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>حذف</button>
        </div>
      </div>
    </div>
  );
}

// ─── Progress Ring ────────────────────────────────────────────────────────────
function ProgressRing({ pct, color, size = 44 }: { pct: number; color: string; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-tertiary)" strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.5s ease' }} />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function AcademicPage() {
  const { addToast } = useToast();
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection state
  const [selectedUniversityId, setSelectedUniversityId] = useState<number | null>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | null>(null);
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

  // University modal
  const [uniModal, setUniModal] = useState<{ open: boolean; edit?: University }>({ open: false });
  const [uniForm, setUniForm] = useState({ name: '', description: '', color: UNIVERSITY_COLORS[0] });

  // Faculty modal
  const [facModal, setFacModal] = useState<{ open: boolean; edit?: Faculty }>({ open: false });
  const [facForm, setFacForm] = useState({ name: '', description: '', stage: 'Bachelor' });

  // Subject modal
  const [subModal, setSubModal] = useState<{ open: boolean; edit?: AcademicSubject; semesterId?: number; facultyId?: number; yearNumber?: number; semesterNumber?: number } | null>(null);
  const [subForm, setSubForm] = useState({ name: '', credits: '3', grade: '', status: 'NotStarted', notes: '' });

  // Delete confirms
  const [delUni, setDelUni] = useState<number | null>(null);
  const [delFac, setDelFac] = useState<number | null>(null);
  const [delSub, setDelSub] = useState<number | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchUniversities = useCallback(async () => {
    try {
      const res = await api.get('/universities');
      setUniversities(res.data);
      if (res.data.length > 0 && !selectedUniversityId) {
        setSelectedUniversityId(res.data[0].id);
      }
    } catch { addToast('خطأ في تحميل البيانات', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUniversities(); }, [fetchUniversities]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const selectedUniversity = universities.find(u => u.id === selectedUniversityId);
  const selectedFaculty = selectedUniversity?.faculties.find(f => f.id === selectedFacultyId);

  // ── University CRUD ────────────────────────────────────────────────────────
  const openUniCreate = () => { setUniForm({ name: '', description: '', color: UNIVERSITY_COLORS[0] }); setUniModal({ open: true }); };
  const openUniEdit = (u: University) => { setUniForm({ name: u.name, description: u.description || '', color: u.color }); setUniModal({ open: true, edit: u }); };

  const saveUniversity = async () => {
    if (!uniForm.name.trim()) return;
    try {
      if (uniModal.edit) {
        await api.put(`/universities/${uniModal.edit.id}`, uniForm);
        addToast('تم تحديث الجامعة', 'success');
      } else {
        const res = await api.post('/universities', uniForm);
        setSelectedUniversityId(res.data.id);
        addToast('تمت إضافة الجامعة', 'success');
      }
      setUniModal({ open: false });
      fetchUniversities();
    } catch { addToast('حدث خطأ', 'error'); }
  };

  const deleteUniversity = async (id: number) => {
    try {
      await api.delete(`/universities/${id}`);
      addToast('تم حذف الجامعة', 'success');
      if (selectedUniversityId === id) { setSelectedUniversityId(null); setSelectedFacultyId(null); }
      setDelUni(null);
      fetchUniversities();
    } catch { addToast('حدث خطأ', 'error'); }
  };

  // ── Faculty CRUD ───────────────────────────────────────────────────────────
  const openFacCreate = () => { setFacForm({ name: '', description: '', stage: 'Bachelor' }); setFacModal({ open: true }); };
  const openFacEdit = (f: Faculty) => { setFacForm({ name: f.name, description: f.description || '', stage: f.stage || 'Bachelor' }); setFacModal({ open: true, edit: f }); };

  const saveFaculty = async () => {
    if (!facForm.name.trim() || !selectedUniversityId) return;
    try {
      if (facModal.edit) {
        await api.put(`/faculties/${facModal.edit.id}`, { ...facForm, universityId: selectedUniversityId });
        addToast('تم تحديث الكلية', 'success');
      } else {
        const res = await api.post('/faculties', { ...facForm, universityId: selectedUniversityId });
        setSelectedFacultyId(res.data.id);
        addToast('تمت إضافة الكلية', 'success');
      }
      setFacModal({ open: false });
      fetchUniversities();
    } catch { addToast('حدث خطأ', 'error'); }
  };

  const deleteFaculty = async (id: number) => {
    try {
      await api.delete(`/faculties/${id}`);
      addToast('تم حذف الكلية', 'success');
      if (selectedFacultyId === id) setSelectedFacultyId(null);
      setDelFac(null);
      fetchUniversities();
    } catch { addToast('حدث خطأ', 'error'); }
  };

  // ── Subject CRUD ───────────────────────────────────────────────────────────
  const openSubCreate = (facultyId: number, yearNumber: number, semesterNumber: number) => {
    setSubForm({ name: '', credits: '3', grade: '', status: 'NotStarted', notes: '' });
    setSubModal({ open: true, facultyId, yearNumber, semesterNumber });
  };

  const openSubEdit = (sub: AcademicSubject) => {
    setSubForm({
      name: sub.name, credits: String(sub.credits),
      grade: sub.grade !== undefined && sub.grade !== null ? String(sub.grade) : '',
      status: sub.status, notes: sub.notes || '',
    });
    setSubModal({ open: true, edit: sub });
  };

  const saveSubject = async () => {
    if (!subForm.name.trim() || !subModal) return;
    try {
      if (subModal.edit) {
        await api.put(`/academic-subjects/${subModal.edit.id}`, {
          name: subForm.name, credits: parseFloat(subForm.credits) || 3,
          grade: subForm.grade ? parseFloat(subForm.grade) : null,
          status: subForm.status, notes: subForm.notes || null,
        });
        addToast('تم تحديث المادة', 'success');
      } else {
        await api.post('/academic-subjects', {
          name: subForm.name, credits: parseFloat(subForm.credits) || 3,
          grade: subForm.grade ? parseFloat(subForm.grade) : null,
          status: subForm.status, notes: subForm.notes || null,
          facultyId: subModal.facultyId, yearNumber: subModal.yearNumber,
          semesterNumber: subModal.semesterNumber,
        });
        addToast('تمت إضافة المادة', 'success');
      }
      setSubModal(null);
      fetchUniversities();
    } catch { addToast('حدث خطأ', 'error'); }
  };

  const deleteSubject = async (id: number) => {
    try {
      await api.delete(`/academic-subjects/${id}`);
      addToast('تم حذف المادة', 'success');
      setDelSub(null);
      fetchUniversities();
    } catch { addToast('حدث خطأ', 'error'); }
  };

  const toggleYear = (yearId: number) => {
    setExpandedYears(prev => {
      const next = new Set(prev);
      if (next.has(yearId)) next.delete(yearId); else next.add(yearId);
      return next;
    });
  };

  // ── Global stats across all universities ───────────────────────────────────
  const allSubjects = universities.flatMap(u => u.faculties.flatMap(f => f.academicYears.flatMap(y => y.semesters.flatMap(s => s.subjects))));
  const totalSubjects = allSubjects.length;
  const completedSubjects = allSubjects.filter(s => s.status === 'Completed').length;
  const inProgressSubjects = allSubjects.filter(s => s.status === 'InProgress').length;
  const gradedAll = allSubjects.filter(s => s.gradePoint);
  const overallGPA = gradedAll.length > 0
    ? gradedAll.reduce((sum, s) => sum + gradeToPoint(s.gradePoint) * s.credits, 0) / gradedAll.reduce((s, sub) => s + sub.credits, 0)
    : null;

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />)}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { icon: <GraduationCap size={18} />, label: 'الجامعات', value: universities.length, color: '#6366f1' },
          { icon: <BookOpen size={18} />, label: 'إجمالي المواد', value: totalSubjects, color: '#14b8a6' },
          { icon: <CheckCircle2 size={18} />, label: 'مكتملة', value: completedSubjects, color: '#22c55e' },
          {
            icon: <Award size={18} />, label: 'GPA التقديري',
            value: overallGPA !== null ? overallGPA.toFixed(2) : '—', color: '#f97316'
          },
        ].map((s, i) => (
          <div key={i} style={{
            padding: '14px 18px', background: 'var(--bg-secondary)', borderRadius: 14,
            border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
              {s.icon}
            </div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Layout ───────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', gap: 16, minHeight: 500 }}>

        {/* ── Sidebar: Universities ─────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1 }}>الجامعات</span>
            <button onClick={openUniCreate} style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 8,
              background: 'var(--accent-primary-bg)', color: 'var(--accent-primary)', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            }}><Plus size={13} />إضافة</button>
          </div>

          {universities.length === 0 && (
            <div style={{ textAlign: 'center', padding: 24, background: 'var(--bg-secondary)', borderRadius: 14, border: '2px dashed var(--border-color)' }}>
              <Building2 size={32} style={{ color: 'var(--text-tertiary)', marginBottom: 8 }} />
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>أضف جامعتك الأولى</p>
            </div>
          )}

          {universities.map(u => {
            const stats = { total: u.faculties.flatMap(f => f.academicYears.flatMap(y => y.semesters.flatMap(s => s.subjects))).length };
            const isActive = u.id === selectedUniversityId;
            return (
              <div key={u.id} onClick={() => { setSelectedUniversityId(u.id); setSelectedFacultyId(null); }}
                style={{
                  padding: '12px 14px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                  background: isActive ? `${u.color}18` : 'var(--bg-secondary)',
                  border: `2px solid ${isActive ? u.color : 'var(--border-color)'}`,
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: u.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: isActive ? u.color : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 3 }}>
                    <button onClick={e => { e.stopPropagation(); openUniEdit(u); }} style={{ padding: 4, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><Edit2 size={12} /></button>
                    <button onClick={e => { e.stopPropagation(); setDelUni(u.id); }} style={{ padding: 4, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><Trash2 size={12} /></button>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6, paddingRight: 18 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{u.faculties.length} كلية</span>
                  <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>·</span>
                  <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{stats.total} مادة</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Right Panel ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* No university selected */}
          {!selectedUniversity && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', borderRadius: 18, border: '2px dashed var(--border-color)', padding: 48, textAlign: 'center' }}>
              <GraduationCap size={52} style={{ color: 'var(--text-tertiary)', marginBottom: 14 }} />
              <p style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)', marginBottom: 6 }}>اختر جامعة</p>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>اختر جامعة من القائمة أو أضف جامعة جديدة للبدء</p>
            </div>
          )}

          {selectedUniversity && (
            <>
              {/* Faculty Cards */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: selectedUniversity.color }} />
                    <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{selectedUniversity.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>— الكليات</span>
                  </div>
                  <button onClick={openFacCreate} style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 9,
                    background: `${selectedUniversity.color}20`, color: selectedUniversity.color,
                    border: `1px solid ${selectedUniversity.color}40`, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  }}><Plus size={14} />إضافة كلية</button>
                </div>

                {selectedUniversity.faculties.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '28px 20px', background: 'var(--bg-secondary)', borderRadius: 14, border: '2px dashed var(--border-color)' }}>
                    <Building2 size={36} style={{ color: 'var(--text-tertiary)', marginBottom: 8 }} />
                    <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>أضف كلية لهذه الجامعة</p>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                  {selectedUniversity.faculties.map(f => {
                    const s = calcFacultyStats(f);
                    const pct = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
                    const isActive = f.id === selectedFacultyId;
                    return (
                      <div key={f.id} onClick={() => setSelectedFacultyId(f.id === selectedFacultyId ? null : f.id)}
                        style={{
                          padding: '14px 16px', borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s',
                          background: isActive ? `${selectedUniversity.color}15` : 'var(--bg-secondary)',
                          border: `2px solid ${isActive ? selectedUniversity.color : 'var(--border-color)'}`,
                        }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: 13, color: isActive ? selectedUniversity.color : 'var(--text-primary)', marginBottom: 4 }}>{f.name}</p>
                            {f.stage && STAGE_CONFIG[f.stage] && (
                              <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: STAGE_CONFIG[f.stage].bg, color: STAGE_CONFIG[f.stage].color, fontWeight: 600 }}>
                                {STAGE_CONFIG[f.stage].label}
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 3 }}>
                            <button onClick={e => { e.stopPropagation(); openFacEdit(f); }} style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', borderRadius: 5 }}><Edit2 size={12} /></button>
                            <button onClick={e => { e.stopPropagation(); setDelFac(f.id); }} style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', borderRadius: 5 }}><Trash2 size={12} /></button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <ProgressRing pct={pct} color={selectedUniversity.color} size={40} />
                          <div>
                            <p style={{ fontSize: 18, fontWeight: 800, color: selectedUniversity.color }}>{pct}%</p>
                            <p style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{s.completed}/{s.total} مادة</p>
                            {s.gpa !== null && <p style={{ fontSize: 10, color: '#f97316', fontWeight: 600 }}>GPA: {s.gpa.toFixed(2)}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Faculty Detail — Academic Years + Semesters + Subjects */}
              {selectedFaculty && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Building2 size={15} style={{ color: selectedUniversity.color }} />
                    <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{selectedFaculty.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>— المقررات الدراسية</span>
                    {selectedFaculty.stage && STAGE_CONFIG[selectedFaculty.stage] && (
                      <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: STAGE_CONFIG[selectedFaculty.stage].bg, color: STAGE_CONFIG[selectedFaculty.stage].color, fontWeight: 600, marginRight: 4 }}>
                        {STAGE_CONFIG[selectedFaculty.stage].label}
                      </span>
                    )}
                  </div>

                  {/* Add Year shortcut */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4, 5].map(yr => {
                      const exists = selectedFaculty.academicYears.some(y => y.yearNumber === yr);
                      return (
                        <button key={yr} onClick={() => { if (!exists) openSubCreate(selectedFaculty.id, yr, 1); }}
                          style={{
                            padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: exists ? 'default' : 'pointer',
                            border: `1px solid ${exists ? selectedUniversity.color : 'var(--border-color)'}`,
                            background: exists ? `${selectedUniversity.color}18` : 'var(--bg-secondary)',
                            color: exists ? selectedUniversity.color : 'var(--text-tertiary)',
                          }}>
                          السنة {yr}
                        </button>
                      );
                    })}
                  </div>

                  {selectedFaculty.academicYears.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 32, background: 'var(--bg-secondary)', borderRadius: 14, border: '2px dashed var(--border-color)' }}>
                      <BarChart3 size={36} style={{ color: 'var(--text-tertiary)', marginBottom: 8 }} />
                      <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>أضف مادة دراسية لبدء خطة الدراسة</p>
                    </div>
                  )}

                  {[...selectedFaculty.academicYears].sort((a, b) => a.yearNumber - b.yearNumber).map(year => {
                    const isExpanded = expandedYears.has(year.id);
                    const yearSubjects = year.semesters.flatMap(s => s.subjects);
                    const yearPct = yearSubjects.length > 0 ? Math.round(yearSubjects.filter(s => s.status === 'Completed').length / yearSubjects.length * 100) : 0;
                    return (
                      <div key={year.id} style={{ background: 'var(--bg-secondary)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                        {/* Year header */}
                        <div onClick={() => toggleYear(year.id)} style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', cursor: 'pointer',
                          background: isExpanded ? `${selectedUniversity.color}0a` : 'transparent',
                          borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none',
                        }}>
                          {isExpanded ? <ChevronDown size={16} style={{ color: selectedUniversity.color }} /> : <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} />}
                          <span style={{ fontWeight: 700, fontSize: 15, color: isExpanded ? selectedUniversity.color : 'var(--text-primary)' }}>
                            السنة الدراسية {year.yearNumber}
                          </span>
                          <div style={{ flex: 1, height: 4, borderRadius: 4, background: 'var(--bg-tertiary)', overflow: 'hidden', maxWidth: 200 }}>
                            <div style={{ height: '100%', width: `${yearPct}%`, background: selectedUniversity.color, borderRadius: 4, transition: 'width 0.5s' }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: selectedUniversity.color }}>{yearPct}%</span>
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{yearSubjects.length} مادة</span>
                        </div>

                        {/* Semesters */}
                        {isExpanded && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                            {[1, 2].map(semNum => {
                              const sem = year.semesters.find(s => s.semesterNumber === semNum);
                              const subjects = sem?.subjects ?? [];
                              const semGpa = calcSemesterGPA(subjects);
                              return (
                                <div key={semNum} style={{
                                  padding: '16px 18px', borderLeft: semNum === 2 ? '1px solid var(--border-color)' : 'none',
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: selectedUniversity.color }} />
                                      <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>الترم {semNum}</span>
                                      {semGpa !== null && (
                                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 8, background: '#f9731622', color: '#f97316' }}>
                                          GPA: {semGpa.toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                    <button onClick={() => openSubCreate(selectedFaculty.id, year.yearNumber, semNum)} style={{
                                      display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7,
                                      background: `${selectedUniversity.color}18`, color: selectedUniversity.color,
                                      border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                                    }}><Plus size={11} />إضافة مادة</button>
                                  </div>

                                  {subjects.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '16px 8px', border: '1px dashed var(--border-color)', borderRadius: 10 }}>
                                      <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>لا توجد مواد بعد</p>
                                    </div>
                                  )}

                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {subjects.map(sub => {
                                      const stConf = STATUS_CONFIG[sub.status];
                                      const gpColor = sub.gradePoint ? GRADE_COLORS[sub.gradePoint] : 'var(--text-tertiary)';
                                      return (
                                        <div key={sub.id} style={{
                                          display: 'flex', alignItems: 'center', gap: 8, padding: '9px 11px',
                                          background: 'var(--bg-tertiary)', borderRadius: 10,
                                          border: '1px solid var(--border-color)',
                                        }}>
                                          <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
                                              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{sub.name}</span>
                                              <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 6, background: stConf.bg, color: stConf.color, fontWeight: 600 }}>{stConf.label}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                              <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{sub.credits} ساعة</span>
                                              {sub.grade !== undefined && sub.grade !== null && (
                                                <>
                                                  <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>·</span>
                                                  <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{sub.grade}%</span>
                                                </>
                                              )}
                                              {sub.gradePoint && (
                                                <span style={{ fontSize: 11, fontWeight: 700, color: gpColor }}>{sub.gradePoint}</span>
                                              )}
                                            </div>
                                          </div>
                                          <div style={{ display: 'flex', gap: 3 }}>
                                            <button onClick={() => openSubEdit(sub)} style={{ padding: 5, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', borderRadius: 6 }}><Edit2 size={12} /></button>
                                            <button onClick={() => setDelSub(sub.id)} style={{ padding: 5, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', borderRadius: 6 }}><Trash2 size={12} /></button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Progress Summary */}
                  {selectedFaculty.academicYears.length > 0 && (() => {
                    const allSubs = selectedFaculty.academicYears.flatMap(y => y.semesters.flatMap(s => s.subjects));
                    const stats = calcFacultyStats(selectedFaculty);
                    return (
                      <div style={{
                        display: 'flex', gap: 12, padding: '14px 18px', background: 'var(--bg-secondary)',
                        borderRadius: 14, border: '1px solid var(--border-color)', flexWrap: 'wrap',
                      }}>
                        {[
                          { icon: <BookOpen size={14} />, label: 'إجمالي المواد', value: stats.total, color: '#6366f1' },
                          { icon: <CheckCircle2 size={14} />, label: 'مكتملة', value: stats.completed, color: '#22c55e' },
                          { icon: <Clock size={14} />, label: 'قيد الدراسة', value: allSubs.filter(s => s.status === 'InProgress').length, color: '#f97316' },
                          { icon: <TrendingUp size={14} />, label: 'GPA التقديري', value: stats.gpa !== null ? stats.gpa.toFixed(2) : '—', color: '#14b8a6' },
                        ].map((s, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ color: s.color }}>{s.icon}</span>
                            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{s.label}:</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── University Modal ──────────────────────────────────────────────── */}
      {uniModal.open && (
        <Modal title={uniModal.edit ? 'تعديل الجامعة' : 'إضافة جامعة'} onClose={() => setUniModal({ open: false })}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input placeholder="اسم الجامعة *" value={uniForm.name} onChange={e => setUniForm({ ...uniForm, name: e.target.value })} style={inp()} />
            <textarea placeholder="وصف مختصر (اختياري)" value={uniForm.description} onChange={e => setUniForm({ ...uniForm, description: e.target.value })} rows={2} style={inp({ resize: 'vertical' })} />
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8, display: 'block' }}>لون الجامعة</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {UNIVERSITY_COLORS.map(c => (
                  <button key={c} onClick={() => setUniForm({ ...uniForm, color: c })}
                    style={{
                      width: 28, height: 28, borderRadius: '50%', background: c, border: `3px solid ${uniForm.color === c ? '#fff' : 'transparent'}`,
                      cursor: 'pointer', outline: uniForm.color === c ? `2px solid ${c}` : 'none', outlineOffset: 2,
                    }} />
                ))}
              </div>
            </div>
            <button onClick={saveUniversity} style={{
              padding: 13, borderRadius: 10, background: uniForm.color,
              color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', marginTop: 4,
            }}>{uniModal.edit ? 'حفظ التعديلات' : 'إضافة الجامعة'}</button>
          </div>
        </Modal>
      )}

      {/* ── Faculty Modal ─────────────────────────────────────────────────── */}
      {facModal.open && (
        <Modal title={facModal.edit ? 'تعديل الكلية' : 'إضافة كلية'} onClose={() => setFacModal({ open: false })}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input placeholder="اسم الكلية *" value={facForm.name} onChange={e => setFacForm({ ...facForm, name: e.target.value })} style={inp()} />
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>المرحلة الأكاديمية</label>
              <select value={facForm.stage} onChange={e => setFacForm({ ...facForm, stage: e.target.value })} style={inp()}>
                <option value="Bachelor">بكالوريوس</option>
                <option value="Diploma">دبلوم</option>
                <option value="Master">ماجستير</option>
                <option value="PhD">دكتوراه</option>
              </select>
            </div>
            <textarea placeholder="وصف مختصر (اختياري)" value={facForm.description} onChange={e => setFacForm({ ...facForm, description: e.target.value })} rows={2} style={inp({ resize: 'vertical' })} />
            <button onClick={saveFaculty} style={{
              padding: 13, borderRadius: 10, background: selectedUniversity?.color || 'var(--accent-primary)',
              color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', marginTop: 4,
            }}>{facModal.edit ? 'حفظ التعديلات' : 'إضافة الكلية'}</button>
          </div>
        </Modal>
      )}

      {/* ── Subject Modal ─────────────────────────────────────────────────── */}
      {subModal?.open && (
        <Modal title={subModal.edit ? 'تعديل المادة' : `إضافة مادة — السنة ${subModal.yearNumber} / الترم ${subModal.semesterNumber}`}
          onClose={() => setSubModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input placeholder="اسم المادة *" value={subForm.name} onChange={e => setSubForm({ ...subForm, name: e.target.value })} style={inp()} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>الساعات المعتمدة</label>
                <input type="number" min="1" max="6" value={subForm.credits} onChange={e => setSubForm({ ...subForm, credits: e.target.value })} style={inp()} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>الدرجة % (0–100)</label>
                <input type="number" min="0" max="100" placeholder="مثال: 85" value={subForm.grade} onChange={e => setSubForm({ ...subForm, grade: e.target.value })} style={inp()} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>الحالة</label>
              <select value={subForm.status} onChange={e => setSubForm({ ...subForm, status: e.target.value })} style={inp()}>
                <option value="NotStarted">لم يبدأ</option>
                <option value="InProgress">قيد الدراسة</option>
                <option value="Completed">مكتمل</option>
              </select>
            </div>
            <textarea placeholder="ملاحظات (اختياري)" value={subForm.notes} onChange={e => setSubForm({ ...subForm, notes: e.target.value })} rows={2} style={inp({ resize: 'vertical' })} />
            <button onClick={saveSubject} style={{
              padding: 13, borderRadius: 10, background: selectedUniversity?.color || 'var(--accent-primary)',
              color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', marginTop: 4,
            }}>{subModal.edit ? 'حفظ التعديلات' : 'إضافة المادة'}</button>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirms ────────────────────────────────────────────────── */}
      {delUni && <DeleteConfirm message="حذف الجامعة وكل بياناتها؟" onCancel={() => setDelUni(null)} onConfirm={() => deleteUniversity(delUni)} />}
      {delFac && <DeleteConfirm message="حذف الكلية وكل مواردها؟" onCancel={() => setDelFac(null)} onConfirm={() => deleteFaculty(delFac)} />}
      {delSub && <DeleteConfirm message="حذف المادة الدراسية؟" onCancel={() => setDelSub(null)} onConfirm={() => deleteSubject(delSub)} />}
    </div>
  );
}
