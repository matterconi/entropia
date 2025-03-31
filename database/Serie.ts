import mongoose, { Document, Schema } from "mongoose";

// Define interface for Series document
export interface ISeries extends Document {
  title: string;
  description?: string;
  coverImage?: string;
  author: mongoose.Types.ObjectId;
  chapters: mongoose.Types.ObjectId[];
  isComplete: boolean;
  totalChapters: number;
  totalViews: number;
  totalLikes: number;
  aiDescription?: string;
  embedding?: number[];

  // Methods
  incrementViews(): Promise<ISeries>;
  incrementLikes(): Promise<ISeries>;
  decrementLikes(): Promise<ISeries>;
}

const SeriesSchema = new Schema<ISeries>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot be more than 200 characters"],
      index: true, // Added index from second schema
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot be more than 2000 characters"],
    },
    coverImage: {
      type: String,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author", // Changed from "User" to "Author" as in the second schema
      required: [true, "Author is required"],
    },
    chapters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post", // Changed from "Article" to "Post" as in the second schema
      },
    ],
    isComplete: {
      type: Boolean,
      default: false,
    },
    totalChapters: {
      type: Number,
      default: 0,
    },
    totalViews: {
      type: Number,
      default: 0,
    },
    totalLikes: {
      type: Number,
      default: 0,
    },
    aiDescription: {
      type: String,
      default: "",
    },
    embedding: {
      type: [Number],
      select: false, // Not included by default in queries
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Add index for author from second schema
SeriesSchema.index({ author: 1 });

// Virtual fields
SeriesSchema.virtual("viewCount").get(function () {
  return this.totalViews || 0;
});

SeriesSchema.virtual("likeCount").get(function () {
  return this.totalLikes || 0;
});

// Methods for incrementing/decrementing counters
SeriesSchema.methods.incrementViews = async function () {
  this.totalViews = (this.totalViews || 0) + 1;
  return this.save();
};

SeriesSchema.methods.incrementLikes = async function () {
  this.totalLikes = (this.totalLikes || 0) + 1;
  return this.save();
};

SeriesSchema.methods.decrementLikes = async function () {
  this.totalLikes = Math.max(0, (this.totalLikes || 0) - 1);
  return this.save();
};

// Create or get the model
export default mongoose.models.Series ||
  mongoose.model<ISeries>("Series", SeriesSchema);
