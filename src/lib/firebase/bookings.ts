
import { db } from './config';
import { collection, getDocs, query, where, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import type { Booking } from '@/lib/types';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/lib/firebase/errors';

export async function getBookingsForRoomByDate(roomId: string, date: string): Promise<Booking[]> {
  const bookingsCol = collection(db, 'bookings');
  const q = query(bookingsCol, where('roomId', '==', roomId), where('date', '==', date));
  try {
    const bookingSnapshot = await getDocs(q);
    const bookings = bookingSnapshot.docs.map(doc => doc.data() as Booking);
    return bookings.sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  } catch (serverError) {
    const permissionError = new FirestorePermissionError({
        path: q.toString(),
        operation: 'list',
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  }
}

export function addBooking(booking: Omit<Booking, 'id'>): void {
  const newDocRef = doc(collection(db, 'bookings'));
  const newBooking: Booking = {
    id: newDocRef.id,
    ...booking,
  };
  
  setDoc(newDocRef, newBooking)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: newDocRef.path,
          operation: 'create',
          requestResourceData: newBooking,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
}

export function updateBooking(id: string, booking: Partial<Omit<Booking, 'id'>>): void {
    const bookingDoc = doc(db, 'bookings', id);
    updateDoc(bookingDoc, booking)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: bookingDoc.path,
                operation: 'update',
                requestResourceData: booking,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });
}

export function deleteBooking(id: string): void {
  const bookingDoc = doc(db, 'bookings', id);
  deleteDoc(bookingDoc)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: bookingDoc.path,
            operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
    });
}
