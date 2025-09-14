import { db } from './config';
import { collection, getDocs, doc, getDoc, deleteDoc, addDoc } from 'firebase/firestore';
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
    const departmentDoc = doc(db, 'departments', id);
    await deleteDoc(departmentDoc);
}
