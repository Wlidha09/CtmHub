import { db } from './config';
import { collection, getDocs } from 'firebase/firestore';
import type { Employee } from '@/lib/types';

export async function getEmployees(): Promise<Employee[]> {
  const employeesCol = collection(db, 'employees');
  const employeeSnapshot = await getDocs(employeesCol);
  const employeeList = employeeSnapshot.docs.map(doc => doc.data() as Employee);
  return employeeList;
}
