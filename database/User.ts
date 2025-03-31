import mongoose, { Document, model, models, Schema } from "mongoose";

export type UserRole = "user" | "author" | "editor" | "admin";

export interface IUser extends Document {
  username: string;
  email: string;
  profileImg?: string;
  likedPosts: mongoose.Types.ObjectId[];
  accounts: mongoose.Types.ObjectId[]; // 🔗 Relazione con Account
  bio: string;
  role: UserRole; // Campo per i ruoli
  authorProfile?: mongoose.Types.ObjectId; // Collegamento al profilo autore
  editorProfile?: mongoose.Types.ObjectId; // Collegamento al profilo editor
  adminProfile?: mongoose.Types.ObjectId; // Collegamento al profilo admin

  // Metodi helper
  hasRole(role: UserRole): boolean;
  hasRoleOrHigher(role: UserRole): boolean;
  isContentCreator(): boolean; // Nuovo metodo che sostituisce isAuthor
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    profileImg: { type: String, default: "/default-profile.png" },
    likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }],
    accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
    bio: { type: String, default: "" },
    role: {
      type: String,
      enum: ["user", "author", "editor", "admin"],
      default: "user",
    },
    authorProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthorProfile",
    },

    editorProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Editor",
      default: null,
    },
    adminProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  { timestamps: true },
);

// Indexes for fast lookup
UserSchema.index({ username: 1, email: 1 });
UserSchema.index({ role: 1 }); // Indice per velocizzare ricerche per ruolo

// Metodo per verificare se l'utente ha un ruolo specifico
UserSchema.methods.hasRole = function (role: UserRole): boolean {
  return this.role === role;
};

// Metodo per verificare se l'utente ha un ruolo pari o superiore
UserSchema.methods.hasRoleOrHigher = function (
  requiredRole: UserRole,
): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    user: 0,
    author: 1,
    editor: 2,
    admin: 3,
  };

  return roleHierarchy[this.role as UserRole] >= roleHierarchy[requiredRole];
};

// Metodo che sostituisce la funzionalità di isAuthor
UserSchema.methods.isContentCreator = function (): boolean {
  return ["author", "editor", "admin"].includes(this.role);
};

export default models.User || model<IUser>("User", UserSchema);
