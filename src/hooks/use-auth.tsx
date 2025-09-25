
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

// Define allowed emails and domains
const ALLOWED_EMAILS: string[] = ["wlidha09@gmail.com", "dev@loophub.com", "owner@loophub.com"];
const ALLOWED_DOMAINS: string[] = ["@contractor.atolls.com"];


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
        const isAllowed = ALLOWED_EMAILS.includes(userEmail) || ALLOWED_DOMAINS.some(domain => userEmail.endsWith(domain));
        if (!isAllowed) {
           await signOut(); // Sign out the user immediately
           throw new Error("Access restricted for this account.");
        }
      } else {
        // No email available, deny access
        await signOut();
        throw new Error("Could not verify email. Access denied.");
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
