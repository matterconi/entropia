import mongoose, { Document, model, models, Schema } from "mongoose";

export interface IArticle extends Document {
  title: string;
  chapterTitle?: string;
  chapterIndex?: number;
  markdownPath: string; // ✅ Percorso su Supabase
  coverImage: string;
  author: mongoose.Types.ObjectId;
  genres: mongoose.Types.ObjectId[];
  categories: mongoose.Types.ObjectId[];
  topics: mongoose.Types.ObjectId[];
  publicationDate: Date;
  likeCount: number;
  comments: mongoose.Types.ObjectId[];
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
    chapterTitle: { type: String },
    chapterIndex: { type: Number },
    markdownPath: { type: String, required: true }, // ✅ Cambiato da `content` a `markdownPath`
    coverImage: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    genres: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Genre", required: true },
    ],
    categories: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    ],
    topics: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true },
    ],
    publicationDate: { type: Date, default: Date.now },
    likeCount: { type: Number, default: 0 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true },
);

// ✅ Aggiunti indici per velocizzare le query
ArticleSchema.index({ categories: 1 });
ArticleSchema.index({ genres: 1 });
ArticleSchema.index({ topics: 1 });

export default models.Article || model<IArticle>("Article", ArticleSchema);
