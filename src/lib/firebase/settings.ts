

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
        logoSvgColor: '208 44% 49%',
        logoTextColor: '220 13% 90%',
        primaryColor: '210 11% 50%',
        backgroundColor: '220 13% 96%',
        accentColor: '208 44% 49%',
    };
}

export async function updateSettings(settings: AppSettings): Promise<void> {
    await setDoc(settingsDocRef, settings, { merge: true });
}
