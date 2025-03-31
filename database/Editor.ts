import mongoose, { Document, model, models, Schema } from "mongoose";

export interface IEditor extends Document {
  user: mongoose.Types.ObjectId;
  articles_reviewed: number;
  articles_published: number;
  articles_rejected: number;
  last_activity: Date;
  specialties: string[]; // es. ["poesia", "narrativa", "saggistica"]
  review_history: {
    article: mongoose.Types.ObjectId;
    action: "approved" | "rejected" | "requested_changes";
    comments: string;
    timestamp: Date;
  }[];
}

const EditorSchema = new Schema<IEditor>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    articles_reviewed: {
      type: Number,
      default: 0,
    },
    articles_published: {
      type: Number,
      default: 0,
    },
    articles_rejected: {
      type: Number,
      default: 0,
    },
    last_activity: {
      type: Date,
      default: Date.now,
    },
    specialties: [
      {
        type: String,
      },
    ],
    review_history: [
      {
        article: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Article",
        },
        action: {
          type: String,
          enum: ["approved", "rejected", "requested_changes"],
          required: true,
        },
        comments: {
          type: String,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

// Indici per ottimizzare le query
EditorSchema.index({ user: 1 });
EditorSchema.index({ "review_history.article": 1 });
EditorSchema.index({ specialties: 1 });

export default models.Editor || model<IEditor>("Editor", EditorSchema);
