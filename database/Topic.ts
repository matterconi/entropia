import mongoose, { Document, model, models, Schema } from "mongoose";

export interface ITopic extends Document {
  name: string;
}

const TopicSchema = new Schema<ITopic>(
  {
    name: { type: String, unique: true, required: true, index: true },
  },
  { timestamps: true },
);

export default models.Topic || model<ITopic>("Topic", TopicSchema);
