"use client";

import { useSession } from "next-auth/react";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { User } from "@/types";

interface UserContextType {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  setUser: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Use this to track if we've set a final authenticated state
  const hasSetFinalState = useRef(false);

  useEffect(() => {
    // Log every state change for debugging
    console.log(`Session status changed: ${status}`);

    // If we're still loading, don't do anything yet
    if (status === "loading") {
      return;
    }

    // If authenticated and we have user data, update the user
    if (status === "authenticated" && session?.user) {
      console.log("Setting authenticated user state");
      setUser({
        id: session.user.id,
        username: session.user.username,
        email: session.user.email,
        profileImg: session.user.profileImg,
        isAuthor: session.user.isAuthor,
      });
      setLoading(false);
      hasSetFinalState.current = true;
    }
    // Only set as unauthenticated if we haven't already set a final authenticated state
    else if (status === "unauthenticated" && !hasSetFinalState.current) {
      console.log("Setting unauthenticated user state");
      setUser(null);
      setLoading(false);
      hasSetFinalState.current = true;
    }
  }, [session, status]);

  // Reset our state tracker if the session object itself changes
  useEffect(() => {
    if (session === null) {
      hasSetFinalState.current = false;
    }
  }, [session]);

  // Debug logs
  useEffect(() => {
    console.log("Current state:", {
      status,
      user,
      loading,
      hasSetFinalState: hasSetFinalState.current,
    });
  }, [status, user, loading]);

  return (
    <UserContext.Provider value={{ user, loading, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
