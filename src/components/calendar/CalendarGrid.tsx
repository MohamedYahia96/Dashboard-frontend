import React from 'react';
import type { Appointment } from '../../services/appointmentService';
import {
    format,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    startOfMonth,
    endOfMonth,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarGridProps {
    currentDate: Date;
    appointments: Appointment[];
    onDateChange: (date: Date) => void;
    onAppointmentClick: (appointment: Appointment) => void;
    onDayClick: (date: Date) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
    currentDate,
    appointments,
    onDateChange,
    onAppointmentClick,
    onDayClick
}) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getDayAppointments = (day: Date) => {
        return appointments.filter(app => {
            const start = new Date(app.startDate);
            const end = new Date(app.endDate);
            const dayStart = new Date(day); dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(day); dayEnd.setHours(23, 59, 59, 999);
            return start <= dayEnd && end >= dayStart;
        }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    };

    return (
        <div style={{
            background: 'var(--bg-card, #fff)',
            borderRadius: 20,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid var(--border-color, #e5e7eb)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                borderBottom: '1px solid var(--border-color, #e5e7eb)',
                background: 'var(--bg-card, #fff)',
            }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text-primary, #111827)' }}>
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => onDateChange(subMonths(currentDate, 1))} style={{
                        width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border-color, #e5e7eb)',
                        background: 'var(--bg-secondary, #f9fafb)', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary, #6b7280)',
                        transition: 'background 0.2s',
                    }}>
                        <ChevronLeft size={18} />
                    </button>
                    <button onClick={() => onDateChange(new Date())} style={{
                        padding: '0 14px', height: 36, borderRadius: 10,
                        border: '1px solid var(--border-color, #e5e7eb)',
                        background: 'var(--bg-secondary, #f9fafb)', cursor: 'pointer',
                        fontSize: 13, fontWeight: 600, color: 'var(--text-secondary, #6b7280)',
                    }}>
                        Today
                    </button>
                    <button onClick={() => onDateChange(addMonths(currentDate, 1))} style={{
                        width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border-color, #e5e7eb)',
                        background: 'var(--bg-secondary, #f9fafb)', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary, #6b7280)',
                    }}>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Day Names Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border-color, #e5e7eb)', flexShrink: 0 }}>
                {DAY_NAMES.map(day => (
                    <div key={day} style={{
                        padding: '10px 0', textAlign: 'center', fontSize: 11,
                        fontWeight: 700, color: 'var(--text-secondary, #9ca3af)',
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                    }}>
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gridTemplateRows: `repeat(${Math.ceil(days.length / 7)}, 1fr)`,
                flex: 1,
                overflow: 'hidden',
            }}>
                {days.map((day) => {
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isToday = isSameDay(day, new Date());
                    const dayApps = getDayAppointments(day);
                    return (
                        <div
                            key={day.toString()}
                            onClick={() => onDayClick(day)}
                            style={{
                                padding: '6px 8px',
                                borderRight: '1px solid var(--border-color, #e5e7eb)',
                                borderBottom: '1px solid var(--border-color, #e5e7eb)',
                                background: isToday ? 'rgba(99,102,241,0.04)' : 'var(--bg-card, #fff)',
                                cursor: 'pointer',
                                opacity: isCurrentMonth ? 1 : 0.4,
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'background 0.15s',
                                minHeight: 100,
                                overflow: 'hidden',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary, #f9fafb)')}
                            onMouseLeave={e => (e.currentTarget.style.background = isToday ? 'rgba(99,102,241,0.04)' : 'var(--bg-card, #fff)')}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                                <span style={{
                                    width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: '50%', fontSize: 13, fontWeight: isToday ? 700 : 500,
                                    background: isToday ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                                    color: isToday ? '#fff' : 'var(--text-primary, #374151)',
                                    boxShadow: isToday ? '0 2px 8px rgba(99,102,241,0.4)' : 'none',
                                }}>
                                    {format(day, 'd')}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden', flex: 1 }}>
                                {dayApps.slice(0, 3).map(app => (
                                    <div
                                        key={app.id}
                                        onClick={e => { e.stopPropagation(); onAppointmentClick(app); }}
                                        title={app.title}
                                        style={{
                                            padding: '2px 6px',
                                            borderRadius: 5,
                                            fontSize: 11,
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            overflow: 'hidden',
                                            whiteSpace: 'nowrap',
                                            textOverflow: 'ellipsis',
                                            borderLeft: `3px solid ${app.color ?? '#6366f1'}`,
                                            background: `${app.color ?? '#6366f1'}18`,
                                            color: 'var(--text-primary, #374151)',
                                        }}
                                    >
                                        {!app.isAllDay && (
                                            <span style={{ opacity: 0.7, marginRight: 3 }}>
                                                {format(parseISO(app.startDate), 'HH:mm')}
                                            </span>
                                        )}
                                        {app.title}
                                    </div>
                                ))}
                                {dayApps.length > 3 && (
                                    <div style={{ fontSize: 10, color: 'var(--text-secondary, #6b7280)', paddingLeft: 6 }}>
                                        +{dayApps.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
