import mongoose, { Document, model, models, Schema } from "mongoose";

export interface IAdmin extends Document {
  user: mongoose.Types.ObjectId;
  last_activity: Date;
  role_assignments: {
    user: mongoose.Types.ObjectId;
    assigned_role: string;
    previous_role: string;
    timestamp: Date;
  }[];
  system_actions: {
    action_type:
      | "config_update"
      | "user_ban"
      | "content_delete"
      | "system_maintenance"
      | "other";
    description: string;
    timestamp: Date;
  }[];
}

const AdminSchema = new Schema<IAdmin>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    last_activity: {
      type: Date,
      default: Date.now,
    },
    role_assignments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        assigned_role: {
          type: String,
          required: true,
        },
        previous_role: {
          type: String,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    system_actions: [
      {
        action_type: {
          type: String,
          enum: [
            "config_update",
            "user_ban",
            "content_delete",
            "system_maintenance",
            "other",
          ],
          required: true,
        },
        description: {
          type: String,
          required: true,
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
AdminSchema.index({ user: 1 });
AdminSchema.index({ "role_assignments.user": 1 });
AdminSchema.index({ "role_assignments.timestamp": 1 });
AdminSchema.index({ "system_actions.action_type": 1 });
AdminSchema.index({ "system_actions.timestamp": 1 });

export default models.Admin || model<IAdmin>("Admin", AdminSchema);
