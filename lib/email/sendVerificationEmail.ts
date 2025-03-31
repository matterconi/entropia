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
  verificationCode: string,
  token: string,
) {
  // Costruisci il link di verifica con il token
  const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${token}&email=${encodeURIComponent(email)}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verifica il tuo account su Versia",
    html: `
    <div style="background-color:#f9f9f9; padding:20px; text-align:center; font-family:Arial, sans-serif;">
      <div style="background:#fff; padding:30px; border-radius:10px; max-width:500px; margin:auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color:#333;">Benvenuto su <span style="color:#007bff;">Versia</span>! 📖</h2>
        
        <p style="color:#666; font-size:16px; margin-bottom:25px;">
          Per iniziare a condividere le tue storie, verifica il tuo account in uno dei seguenti modi:
        </p>
        
        <div style="margin:30px 0;">
          <p style="color:#555; font-size:16px; font-weight:bold;">Opzione 1: Usa il codice di verifica</p>
          <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            margin: 15px 0;
            color: #007bff;
            background: #f0f7ff;
            padding: 15px;
            border-radius: 8px;
            display: inline-block;
          ">
            ${verificationCode}
          </div>
          <p style="color:#777; font-size:14px; margin-top:5px;">
            Inserisci questo codice nella pagina di verifica.
          </p>
        </div>
        
        <div style="margin:30px 0; padding-top:10px; border-top:1px solid #eee;">
          <p style="color:#555; font-size:16px; font-weight:bold;">Opzione 2: Clicca sul link</p>
          <a href="${verificationLink}" style="
            display:inline-block;
            background:#007bff;
            color:white;
            padding:12px 25px;
            margin-top:10px;
            font-size:16px;
            text-decoration:none;
            border-radius:5px;
            font-weight:bold;
          ">Verifica il tuo account</a>
          <p style="color:#777; font-size:14px; margin-top:10px;">
            O copia questo link nel tuo browser: 
            <span style="color:#0066cc; word-break:break-all;">${verificationLink}</span>
          </p>
        </div>
        
        <p style="color:#666; font-size:14px; margin-top:30px;">
          Questo codice e il link scadranno tra 24 ore.
        </p>
        
        <p style="color:#999; font-size:12px; margin-top:20px; border-top:1px solid #eee; padding-top:15px;">
          Se non hai richiesto questa email, puoi ignorarla in sicurezza.
        </p>
      </div>
      <p style="color:#aaa; font-size:12px; margin-top:20px;">📩 Questa è un'email automatica, non rispondere.</p>
    </div>
  `,
  };

  try {
    console.log("📩 Tentativo di invio email a:", email);
    console.log("📩 Codice di verifica:", verificationCode);
    console.log("📩 Link di verifica:", verificationLink);

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email inviata con successo:", info.response);
    return { success: true };
  } catch (error: any) {
    console.error("❌ Errore nell'invio dell'email:", error);

    if (error.response) {
      console.error("📩 Risposta dal server:", error.response);
    }

    if (error.code) {
      console.error("📩 Codice errore:", error.code);
    }

    return { success: false, error };
  }
}
