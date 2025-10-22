
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useToast } from './use-toast';

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
  const { toast } = useToast();

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
       
       let errorMessage = "An unexpected error occurred during sign-in. Please try again.";
       if (error.code === 'auth/unauthorized-domain') {
           errorMessage = "This domain is not authorized for sign-in. Please add your development domain to the authorized domains in your Firebase console's Authentication settings and try again.";
            toast({
                variant: "destructive",
                title: "Authentication Domain Error",
                description: "This app's domain is not authorized. Go to Firebase Console > Authentication > Settings > Authorized domains and add the domain you are using.",
                duration: 9000,
            });
       } else if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = "Sign-in process was cancelled.";
             toast({
                title: "Sign-in Cancelled",
                description: errorMessage,
            });
       } else {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: errorMessage,
            });
       }
       // We don't need to throw an error here as the toast provides user feedback
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
