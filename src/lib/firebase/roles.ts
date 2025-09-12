import { db } from './config';
import { collection, getDocs } from 'firebase/firestore';
import type { Role } from '@/lib/types';

export async function getRoles(): Promise<Role[]> {
  const rolesCol = collection(db, 'roles');
  const roleSnapshot = await getDocs(rolesCol);
  const roleList = roleSnapshot.docs.map(doc => doc.data() as Role);
  return roleList;
}
