import mongoose, { Document, model, models, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string; // Campo per la password (opzionale per utenti Google)
  profileImg?: string;
  likedPosts: mongoose.Types.ObjectId[];
  isAuthor: boolean;
  authorProfile?: mongoose.Types.ObjectId;
  isVerified: boolean; // ✅ Nuovo campo
  verificationToken?: string; // ✅ Token per la verifica email
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false }, // Non restituiamo la password nelle query per sicurezza
    profileImg: { type: String, default: "/default-profile.png" },
    likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }],
    isAuthor: { type: Boolean, default: false },
    authorProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      default: null,
    },
    isVerified: { type: Boolean, default: false }, // Di default false
    verificationToken: { type: String, select: false }, // Token di verifica
  },
  { timestamps: true },
);

// Indexes for fast lookup
UserSchema.index({ username: 1, email: 1 });

export default models.User || model<IUser>("User", UserSchema);
