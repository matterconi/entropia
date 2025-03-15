import mongoose, { Document, model, models, Schema } from "mongoose";

interface CountItem {
  id: mongoose.Types.ObjectId;
  name: string;
  count: number;
}

export interface IGenre extends Document {
  name: string;
  totalArticles: number;
  categoryCounts: CountItem[];
  topicCounts: CountItem[];
  authorCounts: CountItem[];
}

const CountItemSchema = new Schema(
  {
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    count: { type: Number, default: 0 },
  },
  { _id: false },
);

const GenreSchema = new Schema<IGenre>(
  {
    name: { type: String, unique: true, required: true, index: true },
    totalArticles: { type: Number, default: 0 },
    categoryCounts: [CountItemSchema],
    topicCounts: [CountItemSchema],
    authorCounts: [CountItemSchema],
  },
  { timestamps: true },
);

// Indici per ottimizzare le query sui conteggi
GenreSchema.index({ "categoryCounts.id": 1 });
GenreSchema.index({ "topicCounts.id": 1 });
GenreSchema.index({ "authorCounts.id": 1 });

export default models.Genre || model<IGenre>("Genre", GenreSchema);
