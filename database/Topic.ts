import mongoose, { Document, model, models, Schema } from "mongoose";

interface CountItem {
  id: mongoose.Types.ObjectId;
  name: string;
  count: number;
}

export interface ITopic extends Document {
  name: string;
  totalArticles: number;
  categoryCounts: CountItem[];
  genreCounts: CountItem[];
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

const TopicSchema = new Schema<ITopic>(
  {
    name: { type: String, unique: true, required: true, index: true },
    totalArticles: { type: Number, default: 0 },
    categoryCounts: [CountItemSchema],
    genreCounts: [CountItemSchema],
    authorCounts: [CountItemSchema],
  },
  { timestamps: true },
);

// Indici per ottimizzare le query sui conteggi
TopicSchema.index({ "categoryCounts.id": 1 });
TopicSchema.index({ "genreCounts.id": 1 });
TopicSchema.index({ "authorCounts.id": 1 });

export default models.Topic || model<ITopic>("Topic", TopicSchema);
