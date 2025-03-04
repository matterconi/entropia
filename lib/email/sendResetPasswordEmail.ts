import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER, // La tua email
    pass: process.env.EMAIL_PASS, // App password o credenziali SMTP
  },
});

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export default async function sendResetPasswordEmail(
  email: string,
  token: string,
): Promise<void> {
  // Costruisci il link per il reset della password
  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

  const mailOptions: MailOptions = {
    from: process.env.EMAIL_USER as string,
    to: email,
    subject: "Resetta la tua password",
    html: `
      <div style="padding:20px; text-align:center; font-family:Arial, sans-serif;">
        <h2 style="color:#333;">Richiesta di reset della password</h2>
        <p style="color:#666; font-size:16px;">
          Hai richiesto di resettare la tua password. Clicca sul pulsante qui sotto per impostarne una nuova:
        </p>
        <a href="${resetLink}" style="
          display:inline-block; 
          background:#007bff; 
          color:white; 
          padding:12px 20px; 
          font-size:16px; 
          text-decoration:none; 
          border-radius:5px;
          font-weight:bold;
        ">Resetta la password</a>
        <p style="color:#999; font-size:12px; margin-top:20px;">
          Se non hai richiesto il reset, ignora questa email.
        </p>
      </div>
    `,
  };

  try {
    console.log("📩 Tentativo di invio email di reset a:", email);
    console.log("📩 Configurazione mailOptions:", mailOptions);

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email di reset inviata con successo:", info.response);
  } catch (error) {
    console.error("❌ Errore nell'invio dell'email di reset:", error);
    if (error instanceof Error) {
      if ((error as any).response) {
        console.error("📩 Risposta dal server:", (error as any).response);
      }
      if ((error as any).code) {
        console.error("📩 Codice errore:", (error as any).code);
      }
    }
  }
}
