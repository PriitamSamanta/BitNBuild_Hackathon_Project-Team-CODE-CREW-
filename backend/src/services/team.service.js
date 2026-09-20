import Team from "../models/Team.js";
export const createTeam = async (data) => {
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
export const getTeamById = async (id) => {
    return Team.findById(id)
        .populate("currentIncident");
};
export const updateTeam = async (id, data) => {
    return Team.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    }).populate("currentIncident");
};
export const deleteTeam = async (id) => {
    return Team.findByIdAndDelete(id);
};
//# sourceMappingURL=team.service.js.map