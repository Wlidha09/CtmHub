
'use client';

import React, { useEffect, useState } from 'react';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import type { FirestorePermissionError } from '@/lib/firebase/errors';

export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    const handleError = (e: FirestorePermissionError) => {
      console.info('Caught Firestore Permission Error:', e);
      setError(e);
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  if (!error) {
    return null;
  }

  // This is a basic error overlay. In a real app, you'd use a more robust solution.
  // The Next.js dev overlay will pick this up.
  throw error;
}
