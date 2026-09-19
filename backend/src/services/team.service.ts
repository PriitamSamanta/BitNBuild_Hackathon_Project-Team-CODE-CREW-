import Team from "../models/Team.js";

interface CreateTeamData {
  name: string;

  type:
    | "fire"
    | "medical"
    | "police"
    | "rescue"
    | "disaster_response";

  status?:
    | "available"
    | "busy"
    | "en_route"
    | "on_scene"
    | "offline";

  location: {
    address?: string;
    latitude: number;
    longitude: number;
  };

  members?: string[];

  capabilities?: string[];

  contactNumber?: string;
}

export const createTeam = async (data: CreateTeamData) => {
  const teamCount = await Team.countDocuments();

  const teamId = `TEAM-${String(teamCount + 1).padStart(3, "0")}`;

  return Team.create({
    ...data,
    teamId,
    status: data.status || "available",
    members: data.members || [],
    capabilities: data.capabilities || [],
  });
};

export const getTeams = async () => {
  return Team.find()
    .sort({ createdAt: -1 })
    .populate("currentIncident");
};

export const getTeamById = async (id: string) => {
  return Team.findById(id)
    .populate("currentIncident");
};

export const updateTeam = async (
  id: string,
  data: Record<string, unknown>
) => {
  return Team.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  ).populate("currentIncident");
};

export const deleteTeam = async (id: string) => {
  return Team.findByIdAndDelete(id);
};