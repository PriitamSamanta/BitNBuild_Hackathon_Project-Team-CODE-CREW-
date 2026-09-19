import Incident from "../models/Incident.js";
import Team from "../models/Team.js";

interface RecommendedTeam {
  teamId: string;
  name: string;
  type: string;
  status: string;
  distanceKm: number;
  capabilities: string[];
  contactNumber?: string;
  reason: string;
}

const toRadians = (value: number): number => {
  return (value * Math.PI) / 180;
};

const calculateDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const earthRadiusKm = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

const getRequiredTeams = (
  type: string,
  peopleTrapped: number,
  medicalAssistance: boolean
): {
  type: "fire" | "medical" | "police" | "rescue" | "disaster_response";
  reason: string;
}[] => {
  const requirements: {
    type:
      | "fire"
      | "medical"
      | "police"
      | "rescue"
      | "disaster_response";
    reason: string;
  }[] = [];

  if (type === "fire") {
    requirements.push({
      type: "fire",
      reason: "Fire incident requires fire suppression capability.",
    });
  }

  if (peopleTrapped > 0) {
    requirements.push({
      type: "rescue",
      reason: `${peopleTrapped} people are reported trapped and require search and rescue.`,
    });
  }

  if (medicalAssistance) {
    requirements.push({
      type: "medical",
      reason: "Medical assistance is required at the incident.",
    });
  }

  if (
    type === "accident" ||
    type === "road"
  ) {
    requirements.push({
      type: "police",
      reason: "Road/accident incident may require traffic and scene control.",
    });
  }

  if (
    type === "flood" ||
    type === "chemical" ||
    type === "structural"
  ) {
    requirements.push({
      type: "disaster_response",
      reason: `${type} incident may require specialized disaster-response support.`,
    });
  }

  if (requirements.length === 0) {
    requirements.push({
      type: "disaster_response",
      reason: "General emergency response team recommended.",
    });
  }

  return requirements;
};

export const getRecommendations = async (
  incidentId: string
): Promise<{
  incident: unknown;
  recommendations: RecommendedTeam[];
}> => {
  const incident = await Incident.findById(incidentId);

  if (!incident) {
    throw new Error("Incident not found");
  }

  const requirements = getRequiredTeams(
    incident.type,
    incident.peopleTrapped,
    incident.medicalAssistance
  );

  const availableTeams = await Team.find({
    status: "available",
  });

  const recommendations: RecommendedTeam[] = [];

  for (const requirement of requirements) {
    const matchingTeams = availableTeams
      .filter((team) => team.type === requirement.type)
      .map((team) => {
        const distanceKm = calculateDistanceKm(
          incident.location.latitude,
          incident.location.longitude,
          team.location.latitude,
          team.location.longitude
        );

        return {
          team,
          distanceKm,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);

    if (matchingTeams.length === 0) {
      continue;
    }

    const nearest = matchingTeams[0];

    recommendations.push({
      teamId: nearest.team.teamId,
      name: nearest.team.name,
      type: nearest.team.type,
      status: nearest.team.status,
      distanceKm: Number(nearest.distanceKm.toFixed(2)),
      capabilities: nearest.team.capabilities,
      contactNumber: nearest.team.contactNumber,
      reason: requirement.reason,
    });
  }

  return {
    incident,
    recommendations,
  };
};