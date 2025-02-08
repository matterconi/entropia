import mongoose, { Document, model, models, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, unique: true, required: true, index: true },
  },
  { timestamps: true },
);

export default models.Category || model<ICategory>("Category", CategorySchema);
