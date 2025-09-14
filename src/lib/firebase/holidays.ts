
import { db } from './config';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, query, where, setDoc } from 'firebase/firestore';
import type { Holiday } from '@/lib/types';

export async function getHolidaysByYear(year: string): Promise<Holiday[]> {
    const holidaysCol = collection(db, 'holidays');
    const q = query(holidaysCol, 
        where('date', '>=', `${year}-01-01`), 
        where('date', '<=', `${year}-12-31`)
    );
    const holidaySnapshot = await getDocs(q);
    const holidayList = holidaySnapshot.docs.map(doc => (doc.data() as Holiday));
    return holidayList.sort((a, b) => a.date.localeCompare(b.date));
}

export async function addHoliday(holiday: Omit<Holiday, 'id'>): Promise<string> {
    const newDocRef = doc(collection(db, 'holidays'));
    const newHoliday: Holiday = {
        id: newDocRef.id,
        ...holiday,
    };
    await setDoc(newDocRef, newHoliday);
    return newDocRef.id;
}

export async function updateHoliday(id: string, data: Partial<Holiday>): Promise<void> {
    const holidayDoc = doc(db, 'holidays', id);
    await updateDoc(holidayDoc, data);
}

export async function deleteHoliday(id: string): Promise<void> {
    const holidayDoc = doc(db, 'holidays', id);
    await deleteDoc(holidayDoc);
}
