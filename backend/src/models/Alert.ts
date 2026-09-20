import mongoose, { Schema } from "mongoose";

export type AlertType =
  | "critical_incident"
  | "response_delay"
  | "escalation"
  | "resource_shortage";

export type AlertSeverity = "info" | "warning" | "critical";

export type AlertStatus = "active" | "acknowledged" | "resolved";

export interface IAlert {
  alertId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;

  incidentId?: mongoose.Types.ObjectId;

  status: AlertStatus;

  metadata?: {
    delayMinutes?: number;
    previousSeverity?: string;
    currentSeverity?: string;
    requiredResource?: string;
  };

  createdAt?: Date;
  updatedAt?: Date;
}

const alertSchema = new Schema<IAlert>(
  {
    alertId: {
      type: String,
      required: true,
      unique: true,
    },

    type: {
      type: String,
      enum: [
        "critical_incident",
        "response_delay",
        "escalation",
        "resource_shortage",
      ],
      required: true,
    },

    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    incidentId: {
      type: Schema.Types.ObjectId,
      ref: "Incident",
    },

    status: {
      type: String,
      enum: ["active", "acknowledged", "resolved"],
      default: "active",
    },

    metadata: {
      delayMinutes: Number,
      previousSeverity: String,
      currentSeverity: String,
      requiredResource: String,
    },
  },
  {
    timestamps: true,
  }
);

const Alert = mongoose.model<IAlert>("Alert", alertSchema);

export default Alert;