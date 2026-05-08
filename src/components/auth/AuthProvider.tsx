"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import * as Sentry from "@sentry/nextjs";
import { getClientAuth } from "@/lib/firebase/client";
import { getOrCreateUserProfile } from "@/services/user-profile";
import type { UserProfile } from "@/lib/types/user-profile";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | undefined;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: undefined,
  loading: true,
});

export function useAuthContext(): AuthContextValue {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let callId = 0;

    const handleAuthChange = async (
      firebaseUser: User | null,
      currentId: number,
    ) => {
      setUser(firebaseUser);
      Sentry.setUser(firebaseUser !== null ? { id: firebaseUser.uid } : null);
      if (firebaseUser !== null) {
        try {
          const userProfile = await getOrCreateUserProfile(firebaseUser);
          if (currentId === callId) {
            setProfile(userProfile);
          }
        } catch (error) {
          console.error("Failed to load user profile:", error);
        } finally {
          if (currentId === callId) {
            setLoading(false);
          }
        }
      } else {
        setProfile(undefined);
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(getClientAuth(), (firebaseUser) => {
      void handleAuthChange(firebaseUser, ++callId);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
