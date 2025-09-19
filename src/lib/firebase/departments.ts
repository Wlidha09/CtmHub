import { db } from './config';
import { collection, getDocs, doc, getDoc, deleteDoc, addDoc, query, where, writeBatch } from 'firebase/firestore';
import type { Department } from '@/lib/types';

export async function getDepartments(): Promise<Department[]> {
  const departmentsCol = collection(db, 'departments');
  const departmentSnapshot = await getDocs(departmentsCol);
  const departmentList = departmentSnapshot.docs.map(doc => doc.data() as Department);
  return departmentList;
}

export async function getDepartment(id: string): Promise<Department | null> {
    const departmentDoc = doc(db, 'departments', id);
    const departmentSnapshot = await getDoc(departmentDoc);
    if (departmentSnapshot.exists()) {
        return departmentSnapshot.data() as Department;
    }
    return null;
}

export async function addDepartment(department: Omit<Department, 'id'>) {
    const newDocRef = doc(collection(db, 'departments'));
    const newDepartment: Department = {
        id: newDocRef.id,
        ...department,
    };
    await addDoc(collection(db, 'departments'), newDepartment);
    return newDocRef.id;
}

export async function deleteDepartment(id: string): Promise<void> {
    const batch = writeBatch(db);

    // 1. Reference the department to be deleted
    const departmentDocRef = doc(db, 'departments', id);
    batch.delete(departmentDocRef);

    // 2. Find all employees in that department
    const employeesRef = collection(db, 'employees');
    const q = query(employeesRef, where('departmentId', '==', id));
    const querySnapshot = await getDocs(q);

    // 3. Update each employee to remove their departmentId
    querySnapshot.forEach(employeeDoc => {
        const employeeRef = doc(db, 'employees', employeeDoc.id);
        batch.update(employeeRef, { departmentId: '' });
    });
    
    // 4. Commit the batch
    await batch.commit();
}
