
import { db } from './config';
import { collection, getDocs, doc, addDoc, serverTimestamp, query, where, updateDoc } from 'firebase/firestore';
import type { LeaveRequest } from '@/lib/types';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/lib/firebase/errors';

export async function getLeaveRequests(userId?: string): Promise<LeaveRequest[]> {
    const leaveRequestsCol = collection(db, 'leaveRequests');
    let q = query(leaveRequestsCol);
    if (userId) {
        q = query(leaveRequestsCol, where("userId", "==", userId));
    }
    
    try {
        const leaveRequestSnapshot = await getDocs(q);
        const leaveRequestList = leaveRequestSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as LeaveRequest));
        return leaveRequestList;
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: leaveRequestsCol.path,
            operation: 'list',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
    }
}

export function addLeaveRequest(request: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>): void {
    const leaveRequestsCol = collection(db, 'leaveRequests');
    const newRequest = {
        ...request,
        status: 'Pending',
        createdAt: serverTimestamp(),
    };

    addDoc(leaveRequestsCol, newRequest)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: leaveRequestsCol.path,
                operation: 'create',
                requestResourceData: newRequest,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });
}

export function updateLeaveRequestStatus(id: string, status: LeaveRequest['status']): void {
    const leaveRequestDoc = doc(db, 'leaveRequests', id);
    const updateData = { status };
    updateDoc(leaveRequestDoc, updateData)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: leaveRequestDoc.path,
                operation: 'update',
                requestResourceData: updateData,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });
}
