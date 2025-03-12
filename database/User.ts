import mongoose, { Document, model, models, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  profileImg?: string;
  likedPosts: mongoose.Types.ObjectId[];
  isAuthor: boolean;
  authorProfile?: mongoose.Types.ObjectId;
  accounts: mongoose.Types.ObjectId[]; // 🔗 Relazione con Account
  bio: string; // Aggiungi il campo bio
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    profileImg: { type: String, default: "/default-profile.png" },
    likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }],
    isAuthor: { type: Boolean, default: false },
    authorProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      default: null,
    },
    accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }], // 🔗 Relazione con account
    bio: { type: String, default: "" }, // Aggiungi il campo bio
  },
  { timestamps: true },
);

// Indexes for fast lookup
UserSchema.index({ username: 1, email: 1 });

export default models.User || model<IUser>("User", UserSchema);
