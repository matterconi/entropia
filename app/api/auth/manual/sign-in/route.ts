import bcrypt from "bcryptjs";
import type { NextApiRequest, NextApiResponse } from "next";
import { signIn } from "next-auth/react";

import User from "@/database/User";
import dbConnect from "@/lib/mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "❌ Email e password sono obbligatori" });
  }

  await dbConnect();
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(400).json({ error: "❌ Questo account non esiste" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password!);
  if (!isPasswordValid) {
    return res.status(400).json({ error: "❌ Password errata" });
  }

  // Usiamo next-auth per gestire la sessione
  return signIn("credentials", { email, password, redirect: false })
    .then((response) => {
      if (response?.error) {
        return res.status(400).json({ error: response.error });
      }
      return res
        .status(200)
        .json({ message: "✅ Login effettuato con successo" });
    })
    .catch(() => {
      return res.status(500).json({ error: "❌ Errore durante il login" });
    });
}
