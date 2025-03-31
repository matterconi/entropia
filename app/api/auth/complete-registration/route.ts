// app/api/auth/verify-token/route.ts
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

import Account from "@/database/Account";
import RegistrationRequest from "@/database/RegistrationRequest";
import User from "@/database/User";
import dbConnect from "@/lib/mongoose";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    console.log("Verifica richiesta di registrazione:", { email, code });

    // Validazione dei parametri
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email mancante" },
        { status: 400 },
      );
    }

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Codice mancante" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Trova la richiesta di registrazione usando email e verificando che il codice corrisponda
    const registrationRequest = await RegistrationRequest.findOne({
      email,
      verificationCode: code,
      expiresAt: { $gt: new Date() }, // Verifica che non sia scaduta
    });

    if (!registrationRequest) {
      // Incrementa il contatore di tentativi se troviamo una richiesta per questa email
      // ma il codice è sbagliato
      const requestWithEmail = await RegistrationRequest.findOne({ email });
      if (requestWithEmail) {
        requestWithEmail.attempts += 1;
        await requestWithEmail.save();

        // Se ci sono troppi tentativi, si potrebbe voler bloccare temporaneamente
        if (requestWithEmail.attempts >= 5) {
          return NextResponse.json(
            {
              success: false,
              error: "Troppi tentativi falliti. Riprova più tardi.",
            },
            { status: 400 },
          );
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: "Codice di verifica non valido o richiesta scaduta",
        },
        { status: 400 },
      );
    }

    // Verifica se l'utente esiste già
    let user = await User.findOne({ email: registrationRequest.email });

    if (!user) {
      // Crea l'utente
      user = new User({
        email: registrationRequest.email,
        username: registrationRequest.email.split("@")[0],
        profileImg: "/default-profile.png",
        accounts: [],
        bio: "",
      });

      await user.save();
      console.log("Nuovo utente creato:", user._id);

      // Crea l'account
      const account = new Account({
        user: user._id,
        provider: "credentials",
        password: registrationRequest.hashedPassword,
        isVerified: true,
      });

      await account.save();
      console.log("Nuovo account creato:", account._id);

      // Collega l'account all'utente
      await User.findByIdAndUpdate(user._id, {
        $push: { accounts: account._id },
      });
    }

    // Elimina la richiesta di registrazione
    await RegistrationRequest.deleteOne({ _id: registrationRequest._id });
    console.log("Richiesta di registrazione eliminata");

    // Crea un token JWT da utilizzare con NextAuth
    const jwtSecret =
      process.env.JWT_SECRET || process.env.AUTH_SECRET || "default-secret";
    const authToken = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      jwtSecret,
      { expiresIn: "1h" },
    );

    // Restituisci anche le credenziali temporanee per l'autologin
    return NextResponse.json({
      success: true,
      token: authToken,
      credentials: {
        email: user.email,
        tempPassword: registrationRequest.hashedPassword, // Questo è sicuro perché è già hashato
      },
    });
  } catch (error) {
    console.error("Errore durante la verifica:", error);
    return NextResponse.json(
      { success: false, error: "Errore interno del server" },
      { status: 500 },
    );
  }
}
