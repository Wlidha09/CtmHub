
"use client";

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
    if (!id) return null;
    const employeeDoc = doc(db, 'employees', id);
    try {
        const employeeSnapshot = await getDoc(employeeDoc);
        if (employeeSnapshot.exists()) {
            return { id: employeeSnapshot.id, ...employeeSnapshot.data() } as Employee;
        }
        return null;

    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: employeeDoc.path,
            operation: 'get',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
    }
}


export function addEmployee(employee: Omit<Employee, 'id'>): void {
    const newDocRef = doc(collection(db, 'employees'));
    addDoc(collection(db, 'employees'), { ...employee, id: newDocRef.id })
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
