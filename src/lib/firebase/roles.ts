
import { db } from './config';
import { collection, getDocs, doc, updateDoc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import type { Role } from '@/lib/types';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/lib/firebase/errors';

export async function getRoles(): Promise<Role[]> {
  const rolesCol = collection(db, 'roles');
  try {
    const roleSnapshot = await getDocs(rolesCol);
    const roleList = roleSnapshot.docs.map(doc => doc.data() as Role);
    // Sort to ensure core roles come first, then alphabetically
    return roleList.sort((a, b) => {
      if (a.isCore && !b.isCore) return -1;
      if (!a.isCore && b.isCore) return 1;
      return a.name.localeCompare(b.name);
    });
  } catch (serverError) {
    const permissionError = new FirestorePermissionError({
        path: rolesCol.path,
        operation: 'list',
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  }
}

export async function getRole(roleName: string): Promise<Role | null> {
    const roleDoc = doc(db, 'roles', roleName);
    try {
        const roleSnapshot = await getDoc(roleDoc);
        if (roleSnapshot.exists()) {
            return roleSnapshot.data() as Role;
        }
        return null;
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: roleDoc.path,
            operation: 'get',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
    }
}

export function addRole(role: Role): void {
    const roleDoc = doc(db, 'roles', role.name);
    setDoc(roleDoc, role)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: roleDoc.path,
                operation: 'create',
                requestResourceData: role,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });
}

export function updateRole(roleName: string, data: Partial<Role>): void {
    const roleDoc = doc(db, 'roles', roleName);
    updateDoc(roleDoc, data)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: roleDoc.path,
                operation: 'update',
                requestResourceData: data,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });
}

export function deleteRole(roleName: string): void {
    const roleDoc = doc(db, 'roles', roleName);
    deleteDoc(roleDoc)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: roleDoc.path,
                operation: 'delete',
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });
}
