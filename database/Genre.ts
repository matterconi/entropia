import mongoose, { Document, model, models, Schema } from "mongoose";

export interface IGenre extends Document {
  name: string;
}

const GenreSchema = new Schema<IGenre>(
  {
    name: { type: String, unique: true, required: true, index: true },
  },
  { timestamps: true },
);

export default models.Genre || model<IGenre>("Genre", GenreSchema);
