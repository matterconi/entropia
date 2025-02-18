"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { FaHeart } from "react-icons/fa";

import ArticleUploadForm from "@/components/forms/ArticleUploadForm";
import { useUser } from "@/context/UserContext";
import { User } from "@/types";

interface PrevUser {
  id: string;
  email: string;
  profileImg?: string;
  isAuthor: boolean;
}

export default function UserProfilePage() {
  const { user, loading, setUser } = useUser(); // ✅ Ottieni dati utente dal context
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [updating, setUpdating] = useState(false);

  // Funzione per aggiornare il nome utente
  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.length < 3) {
      alert("Username must be at least 3 characters long");
      return;
    }

    setUpdating(true);

    try {
      const res = await fetch(`/api/users/${user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername }),
      });

      if (!res.ok) throw new Error("Failed to update username");

      const updatedUser = await res.json();

      // ✅ Mantieni gli altri dati dell'utente
      setUser((prevUser) =>
        prevUser ? { ...prevUser, username: updatedUser.user.username } : null,
      );

      alert("Username updated successfully!");
    } catch (error) {
      console.error("Error updating username:", error);
      alert("Failed to update username");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (!user) return <p className="text-center">User not found</p>;

  // Generate avatar using Dicebear with email as seed
  const emailSeed = user.email.split("@")[0];
  const avatarUrl = `https://api.dicebear.com/5.x/adventurer/svg?seed=${emailSeed}`;

  return (
    <div className="mx-auto mt-12 p-6 bg-background rounded-lg">
      {/* User Info */}
      <div className="flex items-center gap-4">
        <img
          src={avatarUrl}
          alt={`${user.username} avatar`}
          className="rounded-full size-24"
        />
        <div>
          <h1 className="text-2xl font-bold">{user.username}</h1>
          <p className="text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* Modifica Username */}
      {false && (
        <form onSubmit={handleUsernameChange} className="mt-4">
          <label className="block font-semibold">Change Username</label>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="w-full p-2 border rounded mt-1"
          />
          <button
            type="submit"
            className="mt-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={updating}
          >
            {updating ? "Updating..." : "Save Changes"}
          </button>
        </form>
      )}

      <ArticleUploadForm userId={user.id} />
    </div>
  );
}
