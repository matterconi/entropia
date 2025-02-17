"use client";

import { useSession } from "next-auth/react";
import React, { createContext, useContext, useEffect, useState } from "react";

import { User } from "@/types";

interface UserContextType {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}


const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  setUser: () => {}, // Funzione placeholder
});

// Provider che avvolge l'app e fornisce il contesto
export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user) {
      setUser({
        id: session.user.id,
        username: session.user.username,
        email: session.user.email,
        profileImg: session.user.profileImg,
        isAuthor: session.user.isAuthor,
      });
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [session, status]);

  return (
    <UserContext.Provider value={{ user, loading, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

// Hook personalizzato per usare il contesto utente
export function useUser() {
  return useContext(UserContext);
}
