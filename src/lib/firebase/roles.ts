import { db } from './config';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import type { Role } from '@/lib/types';

export async function getRoles(): Promise<Role[]> {
  const rolesCol = collection(db, 'roles');
  const roleSnapshot = await getDocs(rolesCol);
  const roleList = roleSnapshot.docs.map(doc => doc.data() as Role);
  return roleList;
}

export async function updateRolePermissions(roleName: string, permissions: string[]): Promise<void> {
    const roleDoc = doc(db, 'roles', roleName);
    await updateDoc(roleDoc, { permissions });
}
