
import { db } from './config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { AppSettings } from '@/lib/types';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/lib/firebase/errors';

const settingsDocRef = doc(db, 'settings', 'general');

export async function getSettings(): Promise<AppSettings> {
    try {
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
            return docSnap.data() as AppSettings;
        }
        // Return default settings if the document doesn't exist
        return {
            projectName: 'LoopHub',
            leaveAccumulationAmount: 1.5,
            logoSvgColor: '208 44% 49%',
            logoTextColor: '220 13% 90%',
            primaryColor: '210 11% 50%',
            backgroundColor: '220 13% 96%',
            accentColor: '208 44% 49%',
        };
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: settingsDocRef.path,
            operation: 'get',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
    }
}

export function updateSettings(settings: AppSettings): void {
    setDoc(settingsDocRef, settings, { merge: true })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: settingsDocRef.path,
                operation: 'update',
                requestResourceData: settings,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });
}
