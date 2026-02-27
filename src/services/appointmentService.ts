import api from "./api";

export interface Reminder {
    minutesBefore: number;
}

export interface Appointment {
    id: number;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    color: string;
    isAllDay: boolean;
    reminders?: { minutesBefore: number, isSent?: boolean }[];
}

export interface AppointmentDto {
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    color?: string;
    isAllDay: boolean;
    reminders?: Reminder[];
}

export interface DueReminder {
    id: number;
    appointmentId: number;
    appointmentTitle: string;
    minutesBefore: number;
    scheduledTime: string;
}

export const getAppointments = async (start?: string, end?: string) => {
    let url = '/appointments';
    const params = new URLSearchParams();
    if(start) params.append('start', start);
    if(end) params.append('end', end);
    if(params.toString()) url += `?${params.toString()}`;

    const res = await api.get<Appointment[]>(url);
    return res.data;
};

export const getAppointment = async (id: number) => {
    const res = await api.get<Appointment>(`/appointments/${id}`);
    return res.data;
};

export const createAppointment = async (dto: AppointmentDto) => {
    const res = await api.post<Appointment>('/appointments', dto);
    return res.data;
};

export const updateAppointment = async (id: number, dto: AppointmentDto) => {
    const res = await api.put<Appointment>(`/appointments/${id}`, dto);
    return res.data;
};

export const deleteAppointment = async (id: number) => {
    await api.delete(`/appointments/${id}`);
};

export const getDueReminders = async () => {
    const res = await api.get<DueReminder[]>('/appointments/due-reminders');
    return res.data;
};
