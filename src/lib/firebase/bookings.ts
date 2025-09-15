
import { db } from './config';
import { collection, getDocs, query, where, doc, setDoc, deleteDoc } from 'firebase/firestore';
import type { Booking } from '@/lib/types';

export async function getBookingsForRoom(roomId: string, date: string): Promise<Booking[]> {
  const bookingsCol = collection(db, 'bookings');
  const q = query(bookingsCol, where('roomId', '==', roomId), where('date', '==', date));
  const bookingSnapshot = await getDocs(q);
  return bookingSnapshot.docs.map(doc => doc.data() as Booking);
}

export async function addBooking(booking: Omit<Booking, 'id'>): Promise<string> {
  const newDocRef = doc(collection(db, 'bookings'));
  const newBooking: Booking = {
    id: newDocRef.id,
    ...booking,
  };
  await setDoc(newDocRef, newBooking);
  return newDocRef.id;
}

export async function deleteBooking(id: string): Promise<void> {
  const bookingDoc = doc(db, 'bookings', id);
  await deleteDoc(bookingDoc);
}
