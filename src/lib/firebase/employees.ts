
import { db } from './config';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where } from 'firebase/firestore';
import type { Employee } from '@/lib/types';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/lib/firebase/errors';

export async function getEmployees(): Promise<Employee[]> {
  const employeesCol = collection(db, 'employees');
  try {
    const employeeSnapshot = await getDocs(employeesCol);
    const employeeList = employeeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
    return employeeList;
  } catch (serverError) {
    const permissionError = new FirestorePermissionError({
        path: employeesCol.path,
        operation: 'list',
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  }
}

export async function getEmployee(id: string): Promise<Employee | null> {
    const employeesRef = collection(db, 'employees');
    // First try to get by document ID
    const docRef = doc(db, 'employees', id);

    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Employee;
        }
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'get',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
    }

    
    // If not found by ID, try to find by email, assuming ID might be an email or other unique field
    try {
        const q = query(employeesRef, where("email", "==", id));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            return { id: userDoc.id, ...userDoc.data() } as Employee;
        }
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: employeesRef.path,
            operation: 'list',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
    }


    return null;
}

export function addEmployee(employee: Omit<Employee, 'id'>): void {
    addDoc(collection(db, 'employees'), employee)
        .then(docRef => {
             updateDoc(docRef, { id: docRef.id });
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: 'employees',
                operation: 'create',
                requestResourceData: employee,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });
}

export function updateEmployee(id: string, employee: Partial<Employee>): void {
    const employeeDoc = doc(db, 'employees', id);
    updateDoc(employeeDoc, employee)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: employeeDoc.path,
                operation: 'update',
                requestResourceData: employee,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });
}
