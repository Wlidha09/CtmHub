import { db } from './config';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where } from 'firebase/firestore';
import type { Employee } from '@/lib/types';

export async function getEmployees(): Promise<Employee[]> {
  const employeesCol = collection(db, 'employees');
  const employeeSnapshot = await getDocs(employeesCol);
  const employeeList = employeeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
  return employeeList;
}

export async function getEmployee(id: string): Promise<Employee | null> {
    const employeesRef = collection(db, 'employees');
    // First try to get by document ID
    const docRef = doc(db, 'employees', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Employee;
    }
    
    // If not found by ID, try to find by email, as ID could be an email or other unique field
    const qByEmail = query(employeesRef, where("email", "==", id));
    const emailSnapshot = await getDocs(qByEmail);
    if (!emailSnapshot.empty) {
        const userDoc = emailSnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() } as Employee;
    }
    
    // Fallback for systems where UID might be stored differently
    const qByUid = query(employeesRef, where("uid", "==", id));
    const uidSnapshot = await getDocs(qByUid);
    if (!uidSnapshot.empty) {
        const userDoc = uidSnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() } as Employee;
    }

    return null;
}

export async function addEmployee(employee: Omit<Employee, 'id'>) {
    const employeesCol = collection(db, 'employees');
    const docRef = await addDoc(employeesCol, employee);
    // Now update the document to include its own ID
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
}

export async function updateEmployee(id: string, employee: Partial<Employee>) {
    const employeeDoc = doc(db, 'employees', id);
    await updateDoc(employeeDoc, employee);
}
