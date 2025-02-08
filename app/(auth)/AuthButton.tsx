"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";

export default function AuthButton() {
  const { data: session } = useSession();

  return (
    <div>
      {session ? (
        <>
          <p>Welcome, {session.user?.name}!</p>
          <button
            onClick={() => signOut()}
            className="bg-red-500 text-white p-2 rounded-lg"
          >
            Sign Out
          </button>
        </>
      ) : (
        <button
          onClick={() => signIn("google")}
          className="bg-blue-500 text-white p-2 rounded-lg"
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}
