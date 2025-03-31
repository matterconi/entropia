import axios from "axios";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextResponse } from "next/server";

import Account from "@/database/Account";
import RegistrationRequest from "@/database/RegistrationRequest";
import User from "@/database/User";
import sendVerificationEmail from "@/lib/email/sendVerificationEmail";
import dbConnect from "@/lib/mongoose";

// Function to validate email using Abstract API
async function validateEmail(email: string) {
  try {
    const apiKey = process.env.ABSTRACT_KEY;
    const response = await axios.get(
      `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${encodeURIComponent(email)}`,
    );

    const data = response.data;

    // Check various quality indicators from the API response
    const isValidFormat = data.is_valid_format?.value;
    const isFreeEmail = data.is_free_email?.value;
    const isDisposable = data.is_disposable_email?.value;
    const deliverability = data.deliverability;

    // Define validation logic - you can adjust based on your requirements
    if (!isValidFormat) {
      return {
        isValid: false,
        message: "Il formato dell'email non è valido",
      };
    }

    if (isDisposable) {
      return {
        isValid: false,
        message: "Non sono ammesse email usa e getta",
      };
    }

    if (deliverability === "UNDELIVERABLE") {
      return {
        isValid: false,
        message: "Questa email sembra non essere raggiungibile",
      };
    }

    return { isValid: true };
  } catch (error) {
    console.error("Errore durante la validazione dell'email:", error);
    // If the validation service fails, we can proceed cautiously
    return { isValid: true }; // Defaulting to valid to not block registration on API failure
  }
}

export async function POST(req: Request) {
  try {
    const {
      email,
      password,
      "conferma email": confirmEmail,
    } = await req.json();

    // Basic field validation
    if (!email || !password || !confirmEmail) {
      return NextResponse.json(
        {
          error: "Tutti i campi sono obbligatori",
          errorType: "GENERAL",
        },
        { status: 400 },
      );
    }

    // Confirm emails match
    if (confirmEmail && email !== confirmEmail) {
      return NextResponse.json(
        {
          error: "Le email non corrispondono",
          errorType: "GENERAL",
        },
        { status: 400 },
      );
    }

    // Validate email format using a basic regex before making API call
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: "Formato email non valido",
          errorType: "GENERAL",
        },
        { status: 400 },
      );
    }

    // Validate email using external API
    const emailValidation = await validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        {
          error: emailValidation.message,
          errorType: "GENERAL",
        },
        { status: 400 },
      );
    }

    await dbConnect();

    // First, check if a user exists with this email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // If user exists, check their associated accounts
      const account = await Account.findOne({
        user: existingUser._id,
        provider: "credentials",
      });

      if (account) {
        return NextResponse.json(
          {
            error:
              "Questa mail è già stata usata per l'accesso. Puoi effettuare il sign in tramite il pulsante in basso, o inviare una mail di recupero password sempre nella pagina di sign in.",
            errorType: "EMAIL_ALREADY_EXISTS",
            email,
          },
          { status: 400 },
        );
      }

      const googleAccount = await Account.findOne({
        user: existingUser._id,
        provider: "google",
      });

      if (googleAccount) {
        // Verifica se esiste già una richiesta di registrazione per questa email
        let existingGoogleRequest = await RegistrationRequest.findOne({
          email,
        });
        let tokenToUse;
        let verificationCodeToUse;

        if (existingGoogleRequest) {
          // Se esiste già una richiesta, controlla se è scaduta
          const now = new Date();

          if (
            existingGoogleRequest.expiresAt &&
            existingGoogleRequest.expiresAt < now
          ) {
            // Se scaduta, elimina la vecchia richiesta
            await RegistrationRequest.deleteOne({
              _id: existingGoogleRequest._id,
            });
            existingGoogleRequest = null;
          } else {
            // Se non scaduta, aggiorna la richiesta esistente
            const hashedPassword = await bcrypt.hash(password, 10);
            verificationCodeToUse = Math.floor(
              1000 + Math.random() * 9000,
            ).toString();
            tokenToUse = crypto.randomBytes(48).toString("hex");

            // Aggiorna scadenza: 24 ore da adesso
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);

            // Aggiorna la richiesta esistente
            existingGoogleRequest.hashedPassword = hashedPassword;
            existingGoogleRequest.verificationCode = verificationCodeToUse;
            existingGoogleRequest.token = tokenToUse;
            existingGoogleRequest.expiresAt = expiresAt;
            existingGoogleRequest.isGoogleLinked = true;

            await existingGoogleRequest.save();

            // Invia nuova email di verifica
            await sendVerificationEmail(
              email,
              verificationCodeToUse,
              tokenToUse,
            );

            return NextResponse.json(
              {
                message: "✅ Controlla la tua email per verificare l'account.",
                registrationToken: tokenToUse,
                email: email,
                notificationMessage:
                  "Abbiamo notato che hai già un account Google con questa email. Ti abbiamo inviato un nuovo codice di verifica per completare la registrazione e poter accedere anche con email e password.",
              },
              { status: 201 },
            );
          }
        }

        // Se non esiste una richiesta valida, creane una nuova
        if (!existingGoogleRequest) {
          // Genera i dati per la registrazione
          const hashedPassword = await bcrypt.hash(password, 10);
          verificationCodeToUse = Math.floor(
            1000 + Math.random() * 9000,
          ).toString();
          tokenToUse = crypto.randomBytes(48).toString("hex");

          // Set expiration: 24 hours from now
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + 24);

          // Crea la registration request
          const registrationRequest = new RegistrationRequest({
            email,
            hashedPassword,
            verificationCode: verificationCodeToUse,
            token: tokenToUse,
            expiresAt,
            isGoogleLinked: true,
          });

          await registrationRequest.save();

          // Invia email di verifica
          await sendVerificationEmail(email, verificationCodeToUse, tokenToUse);
        }

        return NextResponse.json(
          {
            message: "✅ Controlla la tua email per verificare l'account.",
            registrationToken: tokenToUse,
            email: email,
            notificationMessage:
              "Abbiamo notato che hai già un account Google con questa email. Completa la registrazione per poter accedere anche con email e password.",
          },
          { status: 201 },
        );
      }
    }

    // Check for existing registration request (email usata ma non verificata)
    let existingRequest = await RegistrationRequest.findOne({ email });
    if (existingRequest) {
      console.log("Richiesta di registrazione esistente:", existingRequest);
    }
    let tokenToUse;
    let verificationCodeToUse;

    if (existingRequest) {
      // User has started registration but not completed verification
      const now = new Date();

      // Check if the request has expired
      if (existingRequest.expiresAt && existingRequest.expiresAt < now) {
        // If expired, delete the old request and create a new one below
        await RegistrationRequest.deleteOne({ _id: existingRequest._id });
        existingRequest = null;
      } else {
        // If not expired, update the existing request with new data
        // Generate new verification data
        const hashedPassword = await bcrypt.hash(password, 10);
        verificationCodeToUse = Math.floor(
          1000 + Math.random() * 9000,
        ).toString();
        tokenToUse = crypto.randomBytes(48).toString("hex");

        // Update expiration: 24 hours from now
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        // Update existing registration request
        existingRequest.hashedPassword = hashedPassword;
        existingRequest.verificationCode = verificationCodeToUse;
        existingRequest.token = tokenToUse;
        existingRequest.expiresAt = expiresAt;

        await existingRequest.save();

        // Send new verification email
        await sendVerificationEmail(email, verificationCodeToUse, tokenToUse);

        return NextResponse.json(
          {
            message: "✅ Controlla la tua email per verificare l'account.",
            registrationToken: tokenToUse,
            email: email,
            isReregistration: true,
            notificationMessage:
              "Abbiamo notato che avevi già iniziato la registrazione con questa email. Ti abbiamo inviato un nuovo codice di verifica.",
          },
          { status: 201 },
        );
      }
    }

    // Create new registration request if none exists or if previous was expired
    if (!existingRequest) {
      // Generate registration data
      const hashedPassword = await bcrypt.hash(password, 10);
      verificationCodeToUse = Math.floor(
        1000 + Math.random() * 9000,
      ).toString();
      tokenToUse = crypto.randomBytes(48).toString("hex");

      // Set expiration: 24 hours from now
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Create new registration request
      const registrationRequest = new RegistrationRequest({
        email,
        hashedPassword,
        verificationCode: verificationCodeToUse,
        token: tokenToUse,
        expiresAt,
      });

      await registrationRequest.save();

      // Send verification email with both code and token
      await sendVerificationEmail(email, verificationCodeToUse, tokenToUse);
    }

    return NextResponse.json(
      {
        message: "✅ Controlla la tua email per verificare l'account.",
        registrationToken: tokenToUse,
        email: email,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Errore durante la pre-registrazione:", error);
    return NextResponse.json(
      {
        error: "❌ Errore interno del server",
        errorType: "SERVER_ERROR",
      },
      { status: 500 },
    );
  }
}
