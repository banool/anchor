import { createUser, getUserByEmail } from '@/lib/database';
import {
    getCurrentUser,
    logCrashlytics,
    onAuthStateChanged,
    setCrashlyticsUserId,
    signInWithApple,
    signInWithGoogle,
    signOut
} from '@/lib/firebase';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  phone: string | null;
  firebaseUid: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseAuthTypes.User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);

  // Create or get user from our database
  const createOrGetUser = async (firebaseUser: FirebaseAuthTypes.User): Promise<User> => {
    try {
      // First, try to get existing user
      const existingUsers = await getUserByEmail(firebaseUser.email!);

      if (existingUsers.length > 0) {
        // User exists, return the first one
        const dbUser = existingUsers[0];
        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          avatar: dbUser.avatar,
          phone: dbUser.phone,
          firebaseUid: firebaseUser.uid,
          createdAt: dbUser.createdAt,
          updatedAt: dbUser.updatedAt,
        };
      }

      // User doesn't exist, create new user
      const newUser = await createUser({
        email: firebaseUser.email!,
        name: firebaseUser.displayName || null,
        avatar: firebaseUser.photoURL || null,
        phone: firebaseUser.phoneNumber || null,
        firebaseUid: firebaseUser.uid,
      });

      return {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        avatar: newUser.avatar,
        phone: newUser.phone,
        firebaseUid: firebaseUser.uid,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      };
    } catch (error) {
      console.error('Error creating or getting user:', error);
      logCrashlytics('Error creating or getting user', error as Error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const currentFirebaseUser = getCurrentUser();
      if (currentFirebaseUser) {
        const updatedUser = await createOrGetUser(currentFirebaseUser);
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      logCrashlytics('Error refreshing user', error as Error);
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      logCrashlytics('User signed in with Google');
    } catch (error) {
      console.error('Google sign in error:', error);
      logCrashlytics('Google sign in error', error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSignInWithApple = async () => {
    try {
      setLoading(true);
      await signInWithApple();
      logCrashlytics('User signed in with Apple');
    } catch (error) {
      console.error('Apple sign in error:', error);
      logCrashlytics('Apple sign in error', error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
      setUser(null);
      setFirebaseUser(null);
      setCrashlyticsUserId('anonymous');
      logCrashlytics('User signed out');
    } catch (error) {
      console.error('Sign out error:', error);
      logCrashlytics('Sign out error', error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      try {
        setLoading(true);

        if (firebaseUser) {
          setFirebaseUser(firebaseUser);

          // Set user ID for crash reporting
          setCrashlyticsUserId(firebaseUser.uid);

          // Create or get user from database
          const dbUser = await createOrGetUser(firebaseUser);
          setUser(dbUser);

          logCrashlytics('User authenticated successfully');
        } else {
          setFirebaseUser(null);
          setUser(null);
          setCrashlyticsUserId('anonymous');
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        logCrashlytics('Auth state change error', error as Error);
        setFirebaseUser(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    signInWithGoogle: handleSignInWithGoogle,
    signInWithApple: handleSignInWithApple,
    signOut: handleSignOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
