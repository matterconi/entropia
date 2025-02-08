import mongoose, { Document, model, models, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  profileImg?: string; // Profile picture
  likedPosts: mongoose.Types.ObjectId[]; // Posts the user liked
  isAuthor: boolean; // If true, links to Author schema
  authorProfile?: mongoose.Types.ObjectId; // Link to Author schema if isAuthor = true
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    profileImg: { type: String, default: "/default-profile.png" }, // Default image if none
    likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }], // List of liked articles
    isAuthor: { type: Boolean, default: false },
    authorProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      default: null,
    }, // Link to Author profile
  },
  { timestamps: true },
);

// Indexes for fast lookup
UserSchema.index({ username: 1, email: 1 });

export default models.User || model<IUser>("User", UserSchema);
