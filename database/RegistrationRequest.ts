import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";

// Schema per gestire le richieste di registrazione temporanee
const registrationRequestSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    // username field removed
    hashedPassword: {
      type: String,
      required: true,
    },
    verificationCode: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Define interface for the document
interface IRegistrationRequest extends mongoose.Document {
  email: string;
  // username removed from interface
  hashedPassword: string;
  verificationCode: string;
  token: string;
  attempts: number;
  expiresAt: Date;
  verifyPassword(password: string): Promise<boolean>;
}

// Define interface for the model
interface IRegistrationRequestModel
  extends mongoose.Model<IRegistrationRequest> {}

// Metodo per verificare la password
registrationRequestSchema.methods.verifyPassword = async function (
  this: IRegistrationRequest,
  password: string,
): Promise<boolean> {
  return await bcrypt.compare(password, this.hashedPassword);
};

// Indice TTL per eliminare i record dopo 24 ore
registrationRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Esporta il modello
const RegistrationRequest =
  mongoose.models.RegistrationRequest ||
  mongoose.model("RegistrationRequest", registrationRequestSchema);

export default RegistrationRequest;
