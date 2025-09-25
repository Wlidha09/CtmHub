
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

// Define allowed emails
const ALLOWED_EMAILS: string[] = ["wlidha09@gmail.com", "dev@loophub.com", "owner@loophub.com"];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.email && !ALLOWED_EMAILS.includes(currentUser.email)) {
        // If user is not allowed, sign them out and prevent access
        auth.signOut();
        setUser(null);
        console.error("Access denied for this email:", currentUser.email);
        // Optionally redirect or show a message
        router.push('/login');
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null); // Explicitly set user to null
      router.push('/login');
    } catch (error) {
      console.error("Sign-out Error:", error);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // After successful sign-in, onAuthStateChanged will handle the user state
      // and the email validation logic.
    } catch (error: any) {
       console.error("Google Sign-In Error:", error);
       // Ensure user is signed out on any error during sign-in
       await auth.signOut().catch(e => console.error("Sign-out failed after sign-in error:", e));
       setUser(null);
       
       let errorMessage = "An unexpected error occurred during sign-in.";
       if (error.code === 'auth/unauthorized-domain') {
           errorMessage = "This domain is not authorized for sign-in. Please add it to the authorized domains in your Firebase console's Authentication settings and try again.";
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
