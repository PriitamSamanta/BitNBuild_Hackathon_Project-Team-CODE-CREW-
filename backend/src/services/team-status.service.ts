import Team, { type TeamStatus } from "../models/Team.js";
import { emitSocketEvent } from "../config/socket.js";

const validStatuses: TeamStatus[] = [
  "available",
  "busy",
  "en_route",
  "on_scene",
  "offline",
];

export const updateTeamStatus = async (
  teamId: string,
  status: TeamStatus
) => {
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid team status");
  }

  const team = await Team.findById(teamId);

  if (!team) {
    throw new Error("Team not found");
  }

  const previousStatus = team.status;

  if (previousStatus === status) {
    return {
      team,
      previousStatus,
      status,
      changed: false,
    };
  }

  team.status = status;
  await team.save();

  emitSocketEvent("team:status_changed", {
    teamId: team.teamId,
    teamMongoId: team._id.toString(),
    name: team.name,
    type: team.type,
    previousStatus,
    status,
    currentIncident: team.currentIncident
      ? team.currentIncident.toString()
      : null,
  });

  return {
    team,
    previousStatus,
    status,
    changed: true,
  };
};