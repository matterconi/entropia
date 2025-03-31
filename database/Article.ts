import mongoose, { Document, model, models, Schema } from "mongoose";

export interface IArticle extends Document {
  title: string;
  chapterTitle?: string;
  chapterIndex?: number;
  markdownPath: string; // Percorso su Supabase
  coverImage: string;
  author: mongoose.Types.ObjectId;
  series?: mongoose.Types.ObjectId; // Riferimento alla serie (opzionale)
  isSeriesChapter: boolean; // Flag per indicare se l'articolo è un capitolo di serie
  genres: {
    id: mongoose.Types.ObjectId;
    relevance: number; // 1 = più rilevante, 2 = secondo più rilevante, ecc.
  }[];
  categories: mongoose.Types.ObjectId[];
  topics: {
    id: mongoose.Types.ObjectId;
    relevance: number;
  }[];
  publicationDate: Date;
  likeCount: number;
  comments: mongoose.Types.ObjectId[];

  aiDescription?: string;
  embedding?: number[]; // Vettore di embedding per le raccomandazioni
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
    chapterTitle: { type: String }, // Titolo del capitolo se è parte di una serie
    chapterIndex: { type: Number }, // Indice/ordine del capitolo nella serie
    markdownPath: { type: String, required: true }, // Percorso su Supabase
    coverImage: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    series: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Serie",
    },
    isSeriesChapter: {
      type: Boolean,
      default: false,
    },
    genres: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Genre",
          required: true,
        },
        relevance: { type: Number, default: 0 },
      },
    ],
    categories: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    ],
    topics: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Topic",
          required: true,
        },
        relevance: { type: Number, default: 0 },
      },
    ],
    publicationDate: { type: Date, default: Date.now },
    likeCount: { type: Number, default: 0 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],

    aiDescription: { type: String },
    embedding: [{ type: Number }],
  },
  { timestamps: true },
);

// Indici per velocizzare le query
ArticleSchema.index({ categories: 1 });
ArticleSchema.index({ genres: 1 });
ArticleSchema.index({ topics: 1 });
ArticleSchema.index({ author: 1 });
ArticleSchema.index({ series: 1 }); // Indice per le query sulla serie
ArticleSchema.index({ isSeriesChapter: 1 }); // Indice per filtrare i capitoli di serie

// Validazione per garantire che i capitoli di serie abbiano sempre un riferimento alla serie
ArticleSchema.pre("validate", function (next) {
  if (this.isSeriesChapter && !this.series) {
    this.invalidate(
      "series",
      "Series reference is required for series chapters",
    );
  }
  next();
});

// Validazione per garantire che i capitoli di serie abbiano sempre un indice capitolo
ArticleSchema.pre("validate", function (next) {
  if (this.isSeriesChapter && this.chapterIndex === undefined) {
    this.invalidate(
      "chapterIndex",
      "Chapter index is required for series chapters",
    );
  }
  next();
});

export default models.Article || model<IArticle>("Article", ArticleSchema);
