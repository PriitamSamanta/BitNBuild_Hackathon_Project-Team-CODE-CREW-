import Incident, {
    type IncidentStatus,
} from "../models/Incident.js";
import Team from "../models/Team.js";
import { emitSocketEvent } from "../config/socket.js";

const validStatuses: IncidentStatus[] = [
    "reported",
    "verified",
    "assigned",
    "en_route",
    "on_scene",
    "rescue_in_progress",
    "resolved",
    "closed",
];

export const updateIncidentStatus = async (
    incidentId: string,
    status: IncidentStatus
) => {
    if (!validStatuses.includes(status)) {
        throw new Error("Invalid incident status");
    }

    const incident = await Incident.findById(incidentId);

    if (!incident) {
        throw new Error("Incident not found");
    }

    const previousStatus = incident.status;

    if (previousStatus === status) {
        return {
            incident,
            previousStatus,
            status,
            changed: false,
        };
    }

    incident.status = status;
    await incident.save();

    // When an incident is resolved or closed,
    // release all teams assigned to it.
    if (status === "resolved" || status === "closed") {
        await Team.updateMany(
            {
                currentIncident: incident._id,
            },
            {
                $set: {
                    status: "available",
                },
                $unset: {
                    currentIncident: 1,
                },
            }
        );
    }

    const updatedIncident = await Incident.findById(incident._id).populate(
        "assignedTeamss"
    );

    const releasedTeams = await Team.find({
        _id: {
            $in: incident.assignedTeamss ?? [],
        },
    });

    emitSocketEvent("incident:status_changed", {
        incidentId: incident.incidentId,
        incidentMongoId: incident._id.toString(),
        previousStatus,
        status,
        assignedTeamss: incident.assignedTeamss?.map((teamId) =>
            teamId.toString()
        ) ?? [],
    });

    if (status === "resolved" || status === "closed") {
        emitSocketEvent("team:status_changed", {
            incidentId: incident.incidentId,
            status: "available",
            teams: releasedTeams.map((team) => ({
                teamId: team.teamId,
                name: team.name,
                status: team.status,
            })),
        });
    }

    return {
        incident: updatedIncident,
        previousStatus,
        status,
        changed: true,
    };
};