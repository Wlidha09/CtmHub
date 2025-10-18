
import { db } from './config';
import { collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';
import type { Availability, WeeklySchedule, Employee } from '@/lib/types';
import { getEmployees } from './employees';
import { startOfWeek, format, eachDayOfInterval, endOfWeek, isWeekend, getDay, addDays } from 'date-fns';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/lib/firebase/errors';

export async function getAvailabilitiesForWeek(weekStartDate: string): Promise<Availability[]> {
    const availabilitiesCol = collection(db, 'availability');
    const q = query(availabilitiesCol, where('weekStartDate', '==', weekStartDate));
    try {
        const availabilitySnapshot = await getDocs(q);
        return availabilitySnapshot.docs.map(doc => doc.data() as Availability);
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: q.toString(),
            operation: 'list',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
    }
}

export async function getUserAvailabilityForWeek(userId: string, weekStartDate: string): Promise<Availability | null> {
    const availabilitiesCol = collection(db, 'availability');
    const q = query(
        availabilitiesCol, 
        where('userId', '==', userId),
        where('weekStartDate', '==', weekStartDate)
    );

    try {
        const availabilitySnapshot = await getDocs(q);
        if (availabilitySnapshot.empty) {
            return null;
        }
        return availabilitySnapshot.docs[0].data() as Availability;
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: q.toString(),
            operation: 'list',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
    }
}


export function saveAvailability(userId: string, weekStartDate: string, selectedDays: string[]): void {
    const availabilityRef = doc(collection(db, 'availability'));
    const newAvailability: Availability = {
        id: availabilityRef.id,
        userId,
        weekStartDate,
        selectedDays,
    };
    
    setDoc(availabilityRef, newAvailability, { merge: true })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: availabilityRef.path,
          operation: 'create',
          requestResourceData: newAvailability,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
}


export async function getWeeklySchedule(): Promise<WeeklySchedule[]> {
    const today = new Date();
    const currentDay = getDay(today);
    const targetDate = (currentDay >= 4 || currentDay === 0) ? addDays(today, 7) : today;
    const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 });
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
