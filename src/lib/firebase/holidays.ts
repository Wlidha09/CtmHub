
import { db } from './config';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, query, where, setDoc } from 'firebase/firestore';
import type { Holiday } from '@/lib/types';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/lib/firebase/errors';

export async function getHolidaysByYear(year: string): Promise<Holiday[]> {
    const holidaysCol = collection(db, 'holidays');
    const q = query(holidaysCol, 
        where('date', '>=', `${year}-01-01`), 
        where('date', '<=', `${year}-12-31`)
    );
    try {
        const holidaySnapshot = await getDocs(q);
        const holidayList = holidaySnapshot.docs.map(doc => (doc.data() as Holiday));
        return holidayList.sort((a, b) => a.date.localeCompare(b.date));
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: holidaysCol.path,
            operation: 'list',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
    }
}

export function addHoliday(holiday: Omit<Holiday, 'id'>): void {
    const newDocRef = doc(collection(db, 'holidays'));
    const newHoliday: Holiday = {
        id: newDocRef.id,
        ...holiday,
    };
    setDoc(newDocRef, newHoliday)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: newDocRef.path,
                operation: 'create',
                requestResourceData: newHoliday,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });
}

export function updateHoliday(id: string, data: Partial<Holiday>): void {
    const holidayDoc = doc(db, 'holidays', id);
    updateDoc(holidayDoc, data)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: holidayDoc.path,
                operation: 'update',
                requestResourceData: data,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });
}

export function deleteHoliday(id: string): void {
    const holidayDoc = doc(db, 'holidays', id);
    deleteDoc(holidayDoc)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: holidayDoc.path,
                operation: 'delete',
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });
}
