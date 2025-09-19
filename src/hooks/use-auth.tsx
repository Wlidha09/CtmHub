
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DENIED_EMAILS: string[] = [];
const DENIED_DOMAINS: string[] = [];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;

      if (userEmail) {
        if (DENIED_EMAILS.includes(userEmail) || DENIED_DOMAINS.some(domain => userEmail.endsWith(domain))) {
           await signOut(); // Sign out the user immediately
           throw new Error("Access denied for this account.");
        }
      }
      // If not denied, user state will be set by onAuthStateChanged
    } catch (error: any) {
       console.error("Google Sign-In Error:", error);
       // Rethrow to be caught by the calling component
       if (error.code === 'auth/popup-closed-by-user') {
            throw new Error("Sign-in process was cancelled.");
       }
       throw error;
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null); // Explicitly set user to null
      router.push('/login');
    } catch (error) {
      console.error("Sign-out Error:", error);
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
