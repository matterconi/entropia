import mongoose, { Document, model, models, Schema } from "mongoose";

interface CountItem {
  id: mongoose.Types.ObjectId;
  name: string;
  count: number;
}

export interface IAuthor extends Document {
  name: string;
  totalArticles: number;
  articlesByCategory: CountItem[];
  articlesByGenre: CountItem[];
  articlesByTopic: CountItem[];
  series: mongoose.Types.ObjectId | null; // Riferimento alla serie dell'autore (opzionale)
  bio?: string;
  avatar?: string;
}

const CountItemSchema = new Schema(
  {
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    count: { type: Number, default: 0 },
  },
  { _id: false },
);

const AuthorSchema = new Schema<IAuthor>(
  {
    name: { type: String, required: true, index: true },
    totalArticles: { type: Number, default: 0 },
    articlesByCategory: [CountItemSchema],
    articlesByGenre: [CountItemSchema],
    articlesByTopic: [CountItemSchema],
    series: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Series",
      default: null,
    },
    bio: { type: String },
    avatar: { type: String },
  },
  { timestamps: true },
);

// Indici per ottimizzare le query sui conteggi
AuthorSchema.index({ "articlesByCategory.id": 1 });
AuthorSchema.index({ "articlesByGenre.id": 1 });
AuthorSchema.index({ "articlesByTopic.id": 1 });

export default models.Author || model<IAuthor>("Author", AuthorSchema);
