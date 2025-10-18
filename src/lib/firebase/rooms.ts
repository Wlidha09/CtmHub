
import { db } from './config';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { MeetingRoom } from '@/lib/types';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/lib/firebase/errors';

export async function getRooms(): Promise<MeetingRoom[]> {
  const roomsCol = collection(db, 'meetingRooms');
  try {
    const roomSnapshot = await getDocs(roomsCol);
    return roomSnapshot.docs.map(doc => doc.data() as MeetingRoom);
  } catch (serverError) {
    const permissionError = new FirestorePermissionError({
        path: roomsCol.path,
        operation: 'list',
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  }
}

export function addRoom(room: Omit<MeetingRoom, 'id'>): void {
  const newDocRef = doc(collection(db, 'meetingRooms'));
  const newRoom: MeetingRoom = {
    id: newDocRef.id,
    ...room,
  };
  setDoc(newDocRef, newRoom)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: newDocRef.path,
            operation: 'create',
            requestResourceData: newRoom,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
    });
}

export function updateRoom(id: string, data: Partial<MeetingRoom>): void {
  const roomDoc = doc(db, 'meetingRooms', id);
  updateDoc(roomDoc, data)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: roomDoc.path,
            operation: 'update',
            requestResourceData: data,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
    });
}

export function deleteRoom(id: string): void {
  const roomDoc = doc(db, 'meetingRooms', id);
  deleteDoc(roomDoc)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: roomDoc.path,
            operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
    });
}
