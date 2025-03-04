import mongoose, { Document, model, models, Schema } from "mongoose";

export interface IAccount extends Document {
  user: mongoose.Types.ObjectId;
  provider: "credentials" | "google";
  providerId?: string; // Solo per Google (sub dell'utente)
  password?: string; // Solo per credenziali
  isVerified: boolean; // Verifica separata per ogni account
  verificationToken?: string; // Per email
  resetToken?: string; // Per reset password
}

const AccountSchema = new Schema<IAccount>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: String, enum: ["credentials", "google"], required: true },
    providerId: { type: String, unique: true, sparse: true }, // Solo per Google
    password: { type: String, select: false }, // Solo per credenziali
    isVerified: { type: Boolean, default: false }, // 🔥 Ogni account deve essere verificato
    verificationToken: { type: String },
    resetToken: { type: String },
  },
  { timestamps: true },
);

// Indexes for fast lookup
AccountSchema.index({ user: 1, provider: 1 }, { unique: true });

export default models.Account || model<IAccount>("Account", AccountSchema);
