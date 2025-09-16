
import { db } from './config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { AppSettings } from '@/lib/types';

const settingsDocRef = doc(db, 'settings', 'general');

export async function getSettings(): Promise<AppSettings> {
    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
        return docSnap.data() as AppSettings;
    }
    // Return default settings if the document doesn't exist
    return {
        projectName: 'LoopHub',
        leaveAccumulationAmount: 1.5,
    };
}

export async function updateSettings(settings: AppSettings): Promise<void> {
    await setDoc(settingsDocRef, settings, { merge: true });
}
