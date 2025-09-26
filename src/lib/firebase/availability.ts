
import { db } from './config';
import { collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';
import type { Availability, WeeklySchedule, Employee } from '@/lib/types';
import { getEmployees } from './employees';
import { startOfWeek, format, eachDayOfInterval, endOfWeek, isWeekend, getDay, addDays } from 'date-fns';

export async function getAvailabilitiesForWeek(weekStartDate: string): Promise<Availability[]> {
    const availabilitiesCol = collection(db, 'availability');
    const q = query(availabilitiesCol, where('weekStartDate', '==', weekStartDate));
    const availabilitySnapshot = await getDocs(q);
    return availabilitySnapshot.docs.map(doc => doc.data() as Availability);
}

export async function getUserAvailabilityForWeek(userId: string, weekStartDate: string): Promise<Availability | null> {
    const availabilitiesCol = collection(db, 'availability');
    const q = query(
        availabilitiesCol, 
        where('userId', '==', userId),
        where('weekStartDate', '==', weekStartDate)
    );
    const availabilitySnapshot = await getDocs(q);
    if (availabilitySnapshot.empty) {
        return null;
    }
    return availabilitySnapshot.docs[0].data() as Availability;
}


export async function saveAvailability(userId: string, weekStartDate: string, selectedDays: string[]): Promise<void> {
    const availabilityRef = doc(collection(db, 'availability'));
    const newAvailability: Availability = {
        id: availabilityRef.id,
        userId,
        weekStartDate,
        selectedDays,
    };
    await setDoc(availabilityRef, newAvailability, { merge: true });
}


export async function getWeeklySchedule(): Promise<WeeklySchedule[]> {
    const today = new Date();
    const currentDay = getDay(today); // Sunday is 0, Monday is 1, ..., Saturday is 6
    // If it's Thursday (4) or later, show next week.
    const targetDate = (currentDay >= 4 || currentDay === 0) ? addDays(today, 7) : today;
    const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 }); // Monday
    const weekStartDate = format(weekStart, 'yyyy-MM-dd');

    const [employees, availabilities] = await Promise.all([
        getEmployees(),
        getAvailabilitiesForWeek(weekStartDate),
    ]);

    const availabilityMap = new Map(availabilities.map(a => [a.userId, a.selectedDays]));
    const weekDays = eachDayOfInterval({
        start: weekStart,
        end: endOfWeek(targetDate, { weekStartsOn: 1 }),
    }).filter(day => !isWeekend(day)).map(day => format(day, 'EEEE'));


    const weeklySchedules = employees.map(employee => {
        const scheduledDays = availabilityMap.get(employee.id) || [];
        const schedule: { [day: string]: boolean } = {};
        
        weekDays.forEach(day => {
            schedule[day] = scheduledDays.includes(day);
        });

        return {
            employeeId: employee.id,
            employeeName: employee.name,
            schedule,
        };
    });

    return weeklySchedules;
}
