
import { db } from './config';
import { collection, getDocs, doc, getDoc, deleteDoc, addDoc, query, where, writeBatch } from 'firebase/firestore';
import type { Department } from '@/lib/types';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/lib/firebase/errors';

export async function getDepartments(): Promise<Department[]> {
  const departmentsCol = collection(db, 'departments');
  try {
    const departmentSnapshot = await getDocs(departmentsCol);
    const departmentList = departmentSnapshot.docs.map(doc => doc.data() as Department);
    return departmentList;
  } catch (serverError) {
    const permissionError = new FirestorePermissionError({
        path: departmentsCol.path,
        operation: 'list',
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  }
}

export async function getDepartment(id: string): Promise<Department | null> {
    const departmentDoc = doc(db, 'departments', id);
    try {
        const departmentSnapshot = await getDoc(departmentDoc);
        if (departmentSnapshot.exists()) {
            return departmentSnapshot.data() as Department;
        }
        return null;
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: departmentDoc.path,
            operation: 'get',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
    }
}

export function addDepartment(department: Omit<Department, 'id'>): void {
    const newDocRef = doc(collection(db, 'departments'));
    const newDepartment: Department = {
        id: newDocRef.id,
        ...department,
    };
    addDoc(collection(db, 'departments'), newDepartment)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: newDocRef.path,
                operation: 'create',
                requestResourceData: newDepartment,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });
}

export async function deleteDepartment(id: string): Promise<void> {
    try {
        const batch = writeBatch(db);

        const departmentDocRef = doc(db, 'departments', id);
        batch.delete(departmentDocRef);

        const employeesRef = collection(db, 'employees');
        const q = query(employeesRef, where('departmentId', '==', id));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach(employeeDoc => {
            const employeeRef = doc(db, 'employees', employeeDoc.id);
            batch.update(employeeRef, { departmentId: '' });
        });
        
        batch.commit()
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: departmentDocRef.path,
                    operation: 'delete',
                } satisfies SecurityRuleContext);
                errorEmitter.emit('permission-error', permissionError);
            });
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: `departments/${id}`,
            operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
    }
}
