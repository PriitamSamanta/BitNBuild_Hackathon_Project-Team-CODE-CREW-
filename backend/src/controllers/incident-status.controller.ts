import type { Request, Response } from "express";
import { updateIncidentStatus } from "../services/incident-status.service.js";
import type { IncidentStatus } from "../models/Incident.js";

export const changeIncidentStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid incident ID",
      });
      return;
    }

    const { status } = req.body as {
      status?: IncidentStatus;
    };

    if (!status) {
      res.status(400).json({
        success: false,
        message: "Status is required",
      });
      return;
    }

    const result = await updateIncidentStatus(id, status);

    res.status(200).json({
      success: true,
      message: result.changed
        ? "Incident status updated successfully"
        : "Incident status is already set to this value",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update incident status";

    const statusCode =
      message === "Incident not found"
        ? 404
        : message === "Invalid incident status"
          ? 400
          : 500;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};