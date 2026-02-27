import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getDueReminders } from '../services/appointmentService';
import { useToast } from './useUtils';

export const useAppointmentReminders = () => {
    const { token } = useAuth();
    const { addToast } = useToast();

    useEffect(() => {
        if (!token) return;

        const checkReminders = async () => {
            try {
                const dueReminders = await getDueReminders();
                if (dueReminders && dueReminders.length > 0) {
                    dueReminders.forEach(reminder => {
                        let timeMsg = reminder.minutesBefore > 0 
                            ? `سيبدأ خلال ${reminder.minutesBefore} دقيقة!` 
                            : 'يبدأ الآن!';
                            
                        addToast(
                            `🔔 موعدك: "${reminder.appointmentTitle}" ${timeMsg}`,
                            'info'
                        );
                    });
                }
            } catch (error) {
                console.error('Failed to check reminders', error);
            }
        };

        // Initial check
        checkReminders();

        // Poll every 1 minute
        const intervalId = setInterval(checkReminders, 60000);

        return () => clearInterval(intervalId);
    }, [token, addToast]);
};
