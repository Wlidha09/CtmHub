import { db } from './config';
import { collection, getDocs, doc, updateDoc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import type { Role } from '@/lib/types';

export async function getRoles(): Promise<Role[]> {
  const rolesCol = collection(db, 'roles');
  const roleSnapshot = await getDocs(rolesCol);
  const roleList = roleSnapshot.docs.map(doc => doc.data() as Role);
  // Sort to ensure core roles come first, then alphabetically
  return roleList.sort((a, b) => {
    if (a.isCore && !b.isCore) return -1;
    if (!a.isCore && b.isCore) return 1;
    return a.name.localeCompare(b.name);
  });
}

export async function getRole(roleName: string): Promise<Role | null> {
    const roleDoc = doc(db, 'roles', roleName);
    const roleSnapshot = await getDoc(roleDoc);
    if (roleSnapshot.exists()) {
        return roleSnapshot.data() as Role;
    }
    return null;
}

export async function addRole(role: Role): Promise<void> {
    const roleDoc = doc(db, 'roles', role.name);
    await setDoc(roleDoc, role);
}

export async function updateRole(roleName: string, data: Partial<Role>): Promise<void> {
    const roleDoc = doc(db, 'roles', roleName);
    await updateDoc(roleDoc, data);
}

export async function deleteRole(roleName: string): Promise<void> {
    const roleDoc = doc(db, 'roles', roleName);
    await deleteDoc(roleDoc);
}
