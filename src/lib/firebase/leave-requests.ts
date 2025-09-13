import { db } from './config';
import { collection, getDocs, doc, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import type { LeaveRequest } from '@/lib/types';

export async function getLeaveRequests(userId?: string): Promise<LeaveRequest[]> {
    const leaveRequestsCol = collection(db, 'leaveRequests');
    let q = query(leaveRequestsCol);
    if (userId) {
        q = query(leaveRequestsCol, where("userId", "==", userId));
    }
    const leaveRequestSnapshot = await getDocs(q);
    const leaveRequestList = leaveRequestSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as LeaveRequest));
    return leaveRequestList;
}

export async function addLeaveRequest(request: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>) {
    const leaveRequestsCol = collection(db, 'leaveRequests');
    await addDoc(leaveRequestsCol, {
        ...request,
        status: 'Pending',
        createdAt: serverTimestamp(),
    });
}
