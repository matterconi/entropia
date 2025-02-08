import mongoose, { Document, model, models, Schema } from "mongoose";

export interface ICommentLike extends Document {
  user: mongoose.Types.ObjectId;
  comment: mongoose.Types.ObjectId;
}

const CommentLikeSchema = new Schema<ICommentLike>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
  },
  { timestamps: true },
);

// Index for fast lookups
CommentLikeSchema.index({ user: 1, comment: 1 }, { unique: true });

export default models.CommentLike ||
  model<ICommentLike>("CommentLike", CommentLikeSchema);
