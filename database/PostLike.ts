import mongoose, { Document, model, models, Schema } from "mongoose";

export interface ILike extends Document {
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
}

const LikeSchema = new Schema<ILike>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
    },
  },
  { timestamps: true },
);

// Index for fast querying
LikeSchema.index({ user: 1, post: 1 }, { unique: true });

export default models.Like || model<ILike>("Like", LikeSchema);
