import mongoose, { Document, model, models, Schema } from "mongoose";

export interface IComment {
  user: mongoose.Types.ObjectId; // User who wrote the comment
  content: string;
  parentComment?: mongoose.Types.ObjectId; // Parent comment (if it's a reply)
  createdAt: Date;
}

export interface IComments extends Document {
  post: mongoose.Types.ObjectId; // The post this comment thread belongs to
  comments: IComment[]; // Array of comments
}

const CommentSchema = new Schema<IComment>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    }, // Parent reference for replies
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const CommentsSchema = new Schema<IComments>(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true }, // Reference to the post
    comments: [CommentSchema], // Store all comments related to the post
  },
  { timestamps: true },
);

// Index for fast lookups
CommentsSchema.index({ post: 1 });

export default models.Comments || model<IComments>("Comments", CommentsSchema);
