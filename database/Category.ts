import mongoose, { Document, model, models, Schema } from "mongoose";

// Interfaccia per i conteggi (generi, topic, autori)
interface CountItem {
  id: mongoose.Types.ObjectId;
  name: string;
  count: number;
}

// Interfaccia estesa per Category
export interface ICategory extends Document {
  name: string;
  totalArticles: number; // Conteggio totale degli articoli
  genreCounts: CountItem[]; // Conteggi per genere
  topicCounts: CountItem[]; // Conteggi per topic
  authorCounts: CountItem[]; // Conteggi per autore
}

const CountItemSchema = new Schema(
  {
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    count: { type: Number, default: 0 },
  },
  { _id: false },
);

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, unique: true, required: true, index: true },
    totalArticles: { type: Number, default: 0 },
    genreCounts: [CountItemSchema],
    topicCounts: [CountItemSchema],
    authorCounts: [CountItemSchema],
  },
  { timestamps: true },
);

// Aggiunge indici per le ricerche più comuni
CategorySchema.index({ "genreCounts.id": 1 });
CategorySchema.index({ "topicCounts.id": 1 });
CategorySchema.index({ "authorCounts.id": 1 });

export default models.Category || model<ICategory>("Category", CategorySchema);
