import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER, // ✅ La tua email
    pass: process.env.EMAIL_PASS, // ✅ App password o credenziali SMTP
  },
});

export default async function sendVerificationEmail(
  email: string,
  token: string,
) {
  const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verifica il tuo account su Versia",
    html: `
    <div style="background-color:#f9f9f9; padding:20px; text-align:center; font-family:Arial, sans-serif;">
      <div style="background:#fff; padding:20px; border-radius:10px; max-width:500px; margin:auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color:#333;">Benvenuto su <span style="color:#007bff;">Versia</span>! 📖</h2>
        <p style="color:#666; font-size:16px;">
          Per iniziare a condividere le tue storie, devi confermare il tuo account.
        </p>
        <a href="${verificationLink}" style="
          display:inline-block; 
          background:#007bff; 
          color:white; 
          padding:12px 20px; 
          font-size:16px; 
          text-decoration:none; 
          border-radius:5px;
          font-weight:bold;
        ">✅ Verifica il tuo account</a>
        <p style="color:#999; font-size:12px; margin-top:20px;">
          Se non hai richiesto questa email, puoi ignorarla in sicurezza.  
        </p>
      </div>
      <p style="color:#aaa; font-size:12px; margin-top:20px;">📩 Questa è un'email automatica, non rispondere.</p>
    </div>
  `,
  };

  try {
    console.log("📩 Tentativo di invio email a:", email);
    console.log("📩 Configurazione mailOptions:", mailOptions);

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email inviata con successo:", info.response);
  } catch (error: any) {
    console.error("❌ Errore nell'invio dell'email:", error);

    if (error.response) {
      console.error("📩 Risposta dal server:", error.response);
    }

    if (error.code) {
      console.error("📩 Codice errore:", error.code);
    }
  }
}
