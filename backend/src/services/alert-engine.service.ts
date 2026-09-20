import Incident from "../models/Incident.js";
import Alert from "../models/Alert.js";
import { createAlert } from "./alert.service.js";

const RESPONSE_DELAY_MINUTES = 5;
const ESCALATION_DELAY_MINUTES = 10;

export const createCriticalIncidentAlert = async (
  incidentId: string
) => {
  const incident = await Incident.findById(incidentId);

  if (!incident) {
    throw new Error("Incident not found");
  }

  if (incident.severity !== "critical") {
    return null;
  }

  const existingAlert = await Alert.findOne({
    incidentId: incident._id,
    type: "critical_incident",
    status: { $ne: "resolved" },
  });

  if (existingAlert) {
    return existingAlert;
  }

  return createAlert({
    type: "critical_incident",
    severity: "critical",
    title: `Critical ${incident.type} emergency`,
    message: `Immediate response required for ${incident.title}.`,
    incidentId: incident._id.toString(),
  });
};

export const checkDelayedResponses = async () => {
  const cutoff = new Date(
    Date.now() - RESPONSE_DELAY_MINUTES * 60 * 1000
  );

  const incidents = await Incident.find({
    status: { $in: ["assigned", "en_route"] },
    updatedAt: { $lte: cutoff },
  });

  for (const incident of incidents) {
    const existingAlert = await Alert.findOne({
      incidentId: incident._id,
      type: "response_delay",
      status: { $ne: "resolved" },
    });

    if (existingAlert) {
      continue;
    }

    const delayMinutes = Math.floor(
      (Date.now() - new Date(incident.updatedAt ?? Date.now()).getTime()) /
        60000
    );

    await createAlert({
      type: "response_delay",
      severity: "warning",
      title: "Response delay detected",
      message: `Response to ${incident.incidentId} has exceeded the expected response time.`,
      incidentId: incident._id.toString(),
      metadata: {
        delayMinutes,
      },
    });
  }
};

export const checkEscalations = async () => {
  const cutoff = new Date(
    Date.now() - ESCALATION_DELAY_MINUTES * 60 * 1000
  );

  const incidents = await Incident.find({
    status: { $in: ["assigned", "en_route"] },
    updatedAt: { $lte: cutoff },
  });

  for (const incident of incidents) {
    const existingEscalation = await Alert.findOne({
      incidentId: incident._id,
      type: "escalation",
      status: { $ne: "resolved" },
    });

    if (existingEscalation) {
      continue;
    }

    const delayMinutes = Math.floor(
      (Date.now() - new Date(incident.updatedAt ?? Date.now()).getTime()) /
        60000
    );

    await createAlert({
      type: "escalation",
      severity: "critical",
      title: "Emergency response escalated",
      message: `Incident ${incident.incidentId} has exceeded the escalation threshold and requires immediate attention.`,
      incidentId: incident._id.toString(),
      metadata: {
        delayMinutes,
        currentSeverity: incident.severity,
      },
    });
  }
};