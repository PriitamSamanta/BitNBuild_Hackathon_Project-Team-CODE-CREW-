import Incident from "../models/Incident.js";
import Team from "../models/Team.js";
import { emitSocketEvent } from "../config/socket.js";

export const dispatchTeams = async (
  incidentId: string,
  teamIds: string[]
) => {
  if (!teamIds || teamIds.length === 0) {
    throw new Error("At least one team is required");
  }

  const incident = await Incident.findById(incidentId);

  if (!incident) {
    throw new Error("Incident not found");
  }

  // Frontend sends business IDs such as TEAM-001.
  // Find teams using teamId instead of MongoDB _id.
  const teams = await Team.find({
    teamId: { $in: teamIds },
  });

  if (teams.length !== teamIds.length) {
    throw new Error("One or more teams were not found");
  }

  const unavailableTeam = teams.find(
    (team) => team.status !== "available"
  );

  if (unavailableTeam) {
    throw new Error(
      `Team ${unavailableTeam.teamId} is not available`
    );
  }

  // Assign MongoDB team IDs to the incident.
  incident.assignedTeams = teams.map(
    (team) => team._id
  );

  incident.status = "assigned";

  await incident.save();

  // Update every dispatched team's status.
  await Team.updateMany(
    {
      teamId: { $in: teamIds },
    },
    {
      $set: {
        status: "en_route",
        currentIncident: incident._id,
      },
    }
  );

  const updatedTeams = await Team.find({
    teamId: { $in: teamIds },
  });

  const updatedIncident = await Incident.findById(
    incident._id
  ).populate("assignedTeams");

  emitSocketEvent("incident:dispatched", {
    incidentId: incident.incidentId,
    incidentMongoId: incident._id.toString(),
    status: incident.status,
    teams: updatedTeams.map((team) => ({
      teamId: team.teamId,
      name: team.name,
      type: team.type,
      status: team.status,
    })),
  });

  return {
    incident: updatedIncident,
    teams: updatedTeams,
  };
};