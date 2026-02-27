import React, { useState, useEffect } from 'react';
import { CalendarGrid } from '../components/calendar/CalendarGrid';
import { AppointmentModal } from '../components/calendar/AppointmentModal';
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from '../services/appointmentService';
import type { Appointment } from '../services/appointmentService';
import { CalendarIcon } from 'lucide-react';
import { useToast } from '../hooks/useUtils';

export function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const loadAppointments = async () => {
        setLoading(true);
        try {
            const start = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).toISOString();
            const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0).toISOString();
            const data = await getAppointments(start, end);
            setAppointments(data);
        } catch (err) {
            console.error('Failed to load appointments', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAppointments(); }, [currentDate]);

    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
        setSelectedAppointment(null);
        setIsModalOpen(true);
    };

    const handleAppointmentClick = (app: Appointment) => {
        setSelectedAppointment(app);
        setSelectedDate(null);
        setIsModalOpen(true);
    };

    const handleSave = async (dto: any) => {
        try {
            if (selectedAppointment) {
                await updateAppointment(selectedAppointment.id, dto);
                addToast('تم تحديث الموعد بنجاح', 'success');
            } else {
                await createAppointment(dto);
                addToast('تم إنشاء الموعد بنجاح', 'success');
            }
            setIsModalOpen(false);
            loadAppointments();
        } catch (err: any) {
            console.error('Save failed', err);
            addToast(err?.response?.data?.message || 'حدث خطأ أثناء حفظ الموعد', 'error');
        }
    };

    const handleDelete = async () => {
        if (!selectedAppointment) return;
        if (confirm('هل أنت متأكد من حذف هذا الموعد؟')) {
            try {
                await deleteAppointment(selectedAppointment.id);
                addToast('تم حذف الموعد', 'info');
                setIsModalOpen(false);
                loadAppointments();
            } catch (err: any) {
                console.error('Delete failed', err);
                addToast('حدث خطأ أثناء الحذف', 'error');
            }
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', padding: '0', overflow: 'hidden' }}>
            {/* Page Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 28px 16px',
                borderBottom: '1px solid var(--border-color, #e5e7eb)',
                flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                    }}>
                        <CalendarIcon size={22} color="#fff" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary, #111)' }}>
                            My Calendar
                        </h1>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary, #6b7280)' }}>
                            Manage your appointments with smart reminders
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => { setSelectedAppointment(null); setSelectedDate(new Date()); setIsModalOpen(true); }}
                    style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: '#fff', border: 'none', borderRadius: 12,
                        fontWeight: 700, fontSize: 14, cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
                        display: 'flex', alignItems: 'center', gap: 6,
                        transition: 'transform 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.45)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.35)'; }}
                >
                    + New Appointment
                </button>
            </div>

            {/* Calendar Container */}
            <div style={{ flex: 1, minHeight: 0, padding: '20px 28px', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary, #6b7280)' }}>
                        Loading appointments...
                    </div>
                ) : (
                    <CalendarGrid
                        currentDate={currentDate}
                        appointments={appointments}
                        onDateChange={setCurrentDate}
                        onDayClick={handleDayClick}
                        onAppointmentClick={handleAppointmentClick}
                    />
                )}
            </div>

            <AppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                onDelete={selectedAppointment ? handleDelete : undefined}
                appointment={selectedAppointment}
                selectedDate={selectedDate}
            />
        </div>
    );
}

export default Calendar;
