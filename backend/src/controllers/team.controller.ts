import type { Request, Response } from "express";

import {
    createTeam,
    getTeams,
    getTeamById,
    updateTeam,
    deleteTeam,
} from "../services/team.service.js";

export const create = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const {
            name,
            type,
            location,
        } = req.body;

        if (!name || !type || !location) {
            res.status(400).json({
                success: false,
                message: "Name, type and location are required",
            });

            return;
        }

        const team = await createTeam(req.body);

        res.status(201).json({
            success: true,
            message: "Team created successfully",
            data: team,
        });
    } catch (error) {
        console.error("Create team error:", error);

        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to create team",
        });
    }
};

export const getAll = async (
    _req: Request,
    res: Response
): Promise<void> => {
    try {
        const teams = await getTeams();

        res.status(200).json({
            success: true,
            data: teams,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch teams",
        });
    }
};

export const getOne = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid team ID",
            });

            return;
        }

        const team = await getTeamById(id);

        if (!team) {
            res.status(404).json({
                success: false,
                message: "Team not found",
            });

            return;
        }

        res.status(200).json({
            success: true,
            data: team,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch team",
        });
    }
};

export const update = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid team ID",
            });

            return;
        }

        const team = await updateTeam(id, req.body);

        if (!team) {
            res.status(404).json({
                success: false,
                message: "Team not found",
            });

            return;
        }

        res.status(200).json({
            success: true,
            message: "Team updated successfully",
            data: team,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update team",
        });
    }
};

export const remove = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid team ID",
            });

            return;
        }

        const team = await deleteTeam(id);

        if (!team) {
            res.status(404).json({
                success: false,
                message: "Team not found",
            });

            return;
        }

        res.status(200).json({
            success: true,
            message: "Team deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete team",
        });
    }
};