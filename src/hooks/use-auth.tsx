
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error("Sign-out Error:", error);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    
    try {
      await setPersistence(auth, browserSessionPersistence);
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle the user state update and routing
    } catch (error: any) {
       console.error("Google Sign-In Error:", error);
       await auth.signOut().catch(e => console.error("Sign-out failed after sign-in error:", e));
       setUser(null);
       
       let errorMessage = "An unexpected error occurred during sign-in. Please try again.";
       if (error.code === 'auth/unauthorized-domain') {
           errorMessage = "This domain is not authorized for sign-in. Please add your development domain (e.g., `localhost` or your secure URL) to the authorized domains in your Firebase console's Authentication settings and try again.";
       } else if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = "Sign-in process was cancelled.";
       }
       throw new Error(errorMessage);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
