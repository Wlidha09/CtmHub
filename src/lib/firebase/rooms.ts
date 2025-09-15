
import { db } from './config';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { MeetingRoom } from '@/lib/types';

export async function getRooms(): Promise<MeetingRoom[]> {
  const roomsCol = collection(db, 'meetingRooms');
  const roomSnapshot = await getDocs(roomsCol);
  return roomSnapshot.docs.map(doc => doc.data() as MeetingRoom);
}

export async function addRoom(room: Omit<MeetingRoom, 'id'>): Promise<string> {
  const newDocRef = doc(collection(db, 'meetingRooms'));
  const newRoom: MeetingRoom = {
    id: newDocRef.id,
    ...room,
  };
  await setDoc(newDocRef, newRoom);
  return newDocRef.id;
}

export async function updateRoom(id: string, data: Partial<MeetingRoom>): Promise<void> {
  const roomDoc = doc(db, 'meetingRooms', id);
  await updateDoc(roomDoc, data);
}

export async function deleteRoom(id: string): Promise<void> {
  const roomDoc = doc(db, 'meetingRooms', id);
  await deleteDoc(roomDoc);
}
