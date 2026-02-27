import React, { useState, useEffect } from 'react';
import { X, Clock, AlignLeft, Bell, Tag } from 'lucide-react';
import type { Appointment, AppointmentDto } from '../../services/appointmentService';

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (dto: AppointmentDto) => void;
    onDelete?: () => void;
    appointment?: Appointment | null;
    selectedDate?: Date | null;
}

const COLORS = [
    { value: '#6366f1', label: 'Indigo' },
    { value: '#ef4444', label: 'Red' },
    { value: '#10b981', label: 'Emerald' },
    { value: '#f59e0b', label: 'Amber' },
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#ec4899', label: 'Pink' },
    { value: '#0ea5e9', label: 'Sky' },
];

const REMINDER_OPTIONS = [
    { label: 'No reminder', value: 0 },
    { label: '5 min before', value: 5 },
    { label: '15 min before', value: 15 },
    { label: '30 min before', value: 30 },
    { label: '1 hour before', value: 60 },
    { label: '1 day before', value: 1440 },
];

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
    isOpen, onClose, onSave, onDelete, appointment, selectedDate
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('10:00');
    const [isAllDay, setIsAllDay] = useState(false);
    const [color, setColor] = useState(COLORS[0].value);
    const [reminderMinutes, setReminderMinutes] = useState(15);

    useEffect(() => {
        if (!isOpen) return;
        if (appointment) {
            setTitle(appointment.title || '');
            setDescription(appointment.description || '');
            setIsAllDay(appointment.isAllDay);
            setColor(appointment.color || COLORS[0].value);
            const s = new Date(appointment.startDate);
            const e = new Date(appointment.endDate);
            setStartDate(s.toISOString().split('T')[0]);
            setStartTime(s.toTimeString().slice(0, 5));
            setEndDate(e.toISOString().split('T')[0]);
            setEndTime(e.toTimeString().slice(0, 5));
            setReminderMinutes(appointment.reminders?.[0]?.minutesBefore ?? 0);
        } else {
            const d = selectedDate ?? new Date();
            const ds = d.toISOString().split('T')[0];
            setTitle(''); setDescription(''); setIsAllDay(false);
            setColor(COLORS[0].value); setReminderMinutes(15);
            setStartDate(ds); setEndDate(ds);
            setStartTime('09:00'); setEndTime('10:00');
        }
    }, [appointment, selectedDate, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalStart = new Date(`${startDate}T${isAllDay ? '00:00' : startTime}`);
        const finalEnd = new Date(`${endDate}T${isAllDay ? '23:59' : endTime}`);
        onSave({
            title, description, isAllDay, color,
            startDate: finalStart.toISOString(),
            endDate: finalEnd.toISOString(),
            reminders: reminderMinutes > 0 ? [{ minutesBefore: reminderMinutes }] : []
        });
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', boxSizing: 'border-box', padding: '10px 14px',
        borderRadius: 10, border: '1.5px solid var(--border-color, #e5e7eb)',
        background: 'var(--bg-secondary, #f9fafb)', color: 'var(--text-primary, #111)',
        fontSize: 14, outline: 'none', fontFamily: 'inherit',
        direction: 'ltr', textAlign: 'left', // Fixes input rendering in RTL dashboard
    };

    const labelStyle: React.CSSProperties = {
        display: 'flex', alignItems: 'center', gap: 6,
        marginBottom: 8, color: 'var(--text-secondary, #4b5563)', fontSize: 13, fontWeight: 600,
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(6px)',
        }} dir="rtl">
            <div style={{
                background: 'var(--bg-card, #fff)',
                borderRadius: 20, width: '100%', maxWidth: 480,
                boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
                overflow: 'hidden', animation: 'fadeInScale 0.2s ease',
                margin: '0 16px',
            }}>
                {/* Modal Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '18px 24px', borderBottom: '1px solid var(--border-color, #e5e7eb)',
                }}>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary, #111)' }}>
                        {appointment ? '✏️ Edit Appointment' : '📅 New Appointment'}
                    </h2>
                    <button onClick={onClose} style={{
                        width: 32, height: 32, borderRadius: 8, border: 'none',
                        background: 'var(--bg-secondary, #f3f4f6)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-secondary, #6b7280)',
                    }}><X size={16} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Title */}
                    <input
                        autoFocus type="text" placeholder="Event title..."
                        required value={title}
                        onChange={e => setTitle(e.target.value)}
                        style={{ ...inputStyle, fontSize: 18, fontWeight: 600, border: 'none', borderBottom: '2px solid var(--border-color, #e5e7eb)', borderRadius: 0, background: 'transparent', padding: '4px 0' }}
                    />

                    {/* All day toggle */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary, #6b7280)' }}>
                        <Clock size={16} />
                        <input type="checkbox" checked={isAllDay} onChange={e => setIsAllDay(e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                        All day event
                    </label>

                    {/* Dates */}
                    <div style={{ display: 'grid', gridTemplateColumns: isAllDay ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: 12 }} dir="ltr">
                        <div>
                            <div style={labelStyle}>Start Date</div>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required style={inputStyle} />
                        </div>
                        {!isAllDay && (
                            <div>
                                <div style={labelStyle}>Start Time</div>
                                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required style={inputStyle} />
                            </div>
                        )}
                        <div>
                            <div style={labelStyle}>End Date</div>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required style={inputStyle} />
                        </div>
                        {!isAllDay && (
                            <div>
                                <div style={labelStyle}>End Time</div>
                                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required style={inputStyle} />
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <div style={labelStyle}><AlignLeft size={16} /> Description</div>
                        <textarea
                            placeholder="Add details..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
                        />
                    </div>

                    {/* Reminder */}
                    <div>
                        <div style={labelStyle}><Bell size={16} /> Reminder</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {REMINDER_OPTIONS.map(o => {
                                const isSelected = reminderMinutes === o.value;
                                return (
                                    <button
                                        key={o.value}
                                        type="button"
                                        onClick={() => setReminderMinutes(o.value)}
                                        style={{
                                            padding: '6px 14px',
                                            borderRadius: 20,
                                            border: isSelected ? `2px solid ${color}` : '1.5px solid var(--border-color, #e5e7eb)',
                                            background: isSelected ? `${color}18` : 'var(--bg-secondary, #f9fafb)',
                                            color: isSelected ? color : 'var(--text-secondary, #6b7280)',
                                            fontSize: 12,
                                            fontWeight: isSelected ? 700 : 500,
                                            cursor: 'pointer',
                                            transition: 'all 0.18s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 5,
                                        }}
                                    >
                                        {isSelected && <Bell size={11} />}
                                        {o.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Color */}
                    <div>
                        <div style={labelStyle}><Tag size={16} /> Color</div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {COLORS.map(c => (
                                <button key={c.value} type="button" title={c.label} onClick={() => setColor(c.value)} style={{
                                    width: 28, height: 28, borderRadius: '50%', border: 'none',
                                    background: c.value, cursor: 'pointer',
                                    transform: color === c.value ? 'scale(1.35)' : 'scale(1)',
                                    boxShadow: color === c.value ? `0 0 0 3px white, 0 0 0 5px ${c.value}` : 'none',
                                    transition: 'all 0.2s',
                                }} />
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, paddingTop: 8, borderTop: '1px solid var(--border-color, #e5e7eb)' }}>
                        <div>
                            {appointment && onDelete && (
                                <button type="button" onClick={onDelete} style={{
                                    padding: '9px 18px', borderRadius: 10, border: 'none',
                                    background: '#fee2e2', color: '#ef4444', fontWeight: 600, fontSize: 14,
                                    cursor: 'pointer',
                                }}>
                                    Delete
                                </button>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button type="button" onClick={onClose} style={{
                                padding: '9px 18px', borderRadius: 10, border: '1.5px solid var(--border-color, #e5e7eb)',
                                background: 'transparent', color: 'var(--text-secondary, #6b7280)', fontWeight: 600,
                                fontSize: 14, cursor: 'pointer',
                            }}>
                                Cancel
                            </button>
                            <button type="submit" style={{
                                padding: '9px 22px', borderRadius: 10, border: 'none',
                                background: `linear-gradient(135deg, ${color}, ${color}bb)`,
                                color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                                boxShadow: `0 4px 14px ${color}50`,
                            }}>
                                {appointment ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            <style>{`@keyframes fadeInScale { from { opacity:0; transform: scale(0.95); } to { opacity:1; transform: scale(1); } }`}</style>
        </div>
    );
};
