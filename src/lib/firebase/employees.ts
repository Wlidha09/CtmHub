import { db } from './config';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import type { Employee } from '@/lib/types';

export async function getEmployees(): Promise<Employee[]> {
  const employeesCol = collection(db, 'employees');
  const employeeSnapshot = await getDocs(employeesCol);
  const employeeList = employeeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
  return employeeList;
}

export async function getEmployee(id: string): Promise<Employee | null> {
    const employeeDoc = doc(db, 'employees', id);
    const employeeSnapshot = await getDoc(employeeDoc);
    if (employeeSnapshot.exists()) {
        return { id: employeeSnapshot.id, ...employeeSnapshot.data() } as Employee;
    }
    return null;
}

export async function addEmployee(employee: Omit<Employee, 'id'>) {
    const employeesCol = collection(db, 'employees');
    const docRef = await addDoc(employeesCol, employee);
    return docRef.id;
}

export async function updateEmployee(id: string, employee: Partial<Employee>) {
    const employeeDoc = doc(db, 'employees', id);
    await updateDoc(employeeDoc, employee);
}
