import mongoose, { Schema } from "mongoose";

export type IncidentType =
  | "fire"
  | "flood"
  | "accident"
  | "medical"
  | "chemical"
  | "structural"
  | "road"
  | "other";

export type IncidentSeverity =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type IncidentStatus =
  | "reported"
  | "verified"
  | "assigned"
  | "en_route"
  | "on_scene"
  | "rescue_in_progress"
  | "resolved"
  | "closed";

export type IncidentSource =
  | "citizen"
  | "field_team"
  | "sensor"
  | "admin"
  | "system";

export interface IIncident {
  incidentId: string;
  type: IncidentType;
  title: string;
  description: string;

  severity: IncidentSeverity;
  status: IncidentStatus;
  priority: number;

  location: {
    address?: string;
    latitude: number;
    longitude: number;
  };

  peopleAffected: number;
  peopleTrapped: number;
  medicalAssistance: boolean;

  source: IncidentSource;

  assignedTeam?: mongoose.Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

const incidentSchema = new Schema<IIncident>(
  {
    incidentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "fire",
        "flood",
        "accident",
        "medical",
        "chemical",
        "structural",
        "road",
        "other",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "reported",
        "verified",
        "assigned",
        "en_route",
        "on_scene",
        "rescue_in_progress",
        "resolved",
        "closed",
      ],
      default: "reported",
      required: true,
    },

    priority: {
      type: Number,
      default: 3,
      min: 1,
      max: 5,
    },

    location: {
      address: {
        type: String,
        trim: true,
      },

      latitude: {
        type: Number,
        required: true,
      },

      longitude: {
        type: Number,
        required: true,
      },
    },

    peopleAffected: {
      type: Number,
      default: 0,
      min: 0,
    },

    peopleTrapped: {
      type: Number,
      default: 0,
      min: 0,
    },

    medicalAssistance: {
      type: Boolean,
      default: false,
    },

    source: {
      type: String,
      enum: ["citizen", "field_team", "sensor", "admin", "system"],
      required: true,
    },

    assignedTeam: {
      type: Schema.Types.ObjectId,
      ref: "Team",
    },
  },
  {
    timestamps: true,
  }
);

const Incident = mongoose.model<IIncident>(
  "Incident",
  incidentSchema
);

export default Incident;