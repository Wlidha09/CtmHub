
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
    
    // First, try to get the document by its ID, as this is the most direct way.
    try {
        const docRef = doc(db, 'employees', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Employee;
        }
    } catch (serverError) {
        // This might be a permission error if rules are strict. We'll let the query below handle it
        // as the primary method, but log this for debugging if needed.
        console.warn(`Could not fetch employee directly by ID '${id}'. Falling back to query. Error: ${serverError}`);
    }

    // If not found by ID (or if ID is an email), query by the email field.
    try {
        const q = query(employeesRef, where("email", "==", id));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            return { id: userDoc.id, ...userDoc.data() } as Employee;
        }
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: employeesRef.path, // The query is on the collection
            operation: 'list', // A query is a 'list' operation
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
