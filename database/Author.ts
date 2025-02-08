import mongoose, { Document, model, models, Schema } from "mongoose";

export interface IAuthor extends Document {
  user: mongoose.Types.ObjectId; // Link to User
  bio?: string; // Short bio of the author
  articles: mongoose.Types.ObjectId[]; // List of published articles
}

const AuthorSchema = new Schema<IAuthor>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    }, // Each author is linked to one user
    bio: { type: String, default: "" },
    articles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }], // List of published articles
  },
  { timestamps: true },
);

// Index for fast author lookups
AuthorSchema.index({ user: 1 });

export default models.Author || model<IAuthor>("Author", AuthorSchema);
