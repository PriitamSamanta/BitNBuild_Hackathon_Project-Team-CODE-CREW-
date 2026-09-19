import Incident from "../models/Incident.js";

import type {
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
  IncidentSource,
} from "../models/Incident.js";

interface CreateIncidentData {
  type: IncidentType;
  title: string;
  description: string;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  priority?: number;
  location: {
    address?: string;
    latitude: number;
    longitude: number;
  };
  peopleAffected?: number;
  peopleTrapped?: number;
  medicalAssistance?: boolean;
  source: IncidentSource;
}

export const createIncident = async (data: CreateIncidentData) => {
  const incidentCount = await Incident.countDocuments();

  const incidentId = `INC-${String(incidentCount + 1).padStart(4, "0")}`;

  return Incident.create({
    ...data,
    incidentId,
  });
};

export const getIncidents = async () => {
  return Incident.find()
    .sort({ createdAt: -1 })
    .populate("assignedTeam");
};

export const getIncidentById = async (id: string) => {
  return Incident.findById(id).populate("assignedTeam");
};

export const updateIncident = async (
  id: string,
  data: Partial<CreateIncidentData>
) => {
  return Incident.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  ).populate("assignedTeam");
};

export const deleteIncident = async (id: string) => {
  return Incident.findByIdAndDelete(id);
};