
import { db } from './config';
import { collection, getDocs, query, where, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import type { Booking } from '@/lib/types';

export async function getBookingsForRoomByDate(roomId: string, date: string): Promise<Booking[]> {
  const bookingsCol = collection(db, 'bookings');
  const q = query(bookingsCol, where('roomId', '==', roomId), where('date', '==', date));
  const bookingSnapshot = await getDocs(q);
  const bookings = bookingSnapshot.docs.map(doc => doc.data() as Booking);
  return bookings.sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
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

export async function updateBooking(id: string, booking: Partial<Omit<Booking, 'id'>>): Promise<void> {
    const bookingDoc = doc(db, 'bookings', id);
    await updateDoc(bookingDoc, booking);
}

export async function deleteBooking(id: string): Promise<void> {
  const bookingDoc = doc(db, 'bookings', id);
  await deleteDoc(bookingDoc);
}
