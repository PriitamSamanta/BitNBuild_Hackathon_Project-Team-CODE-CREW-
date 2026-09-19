import type { Request, Response } from "express";

import {
  createReport,
  getReports,
  getReportById,
  updateReport,
} from "../services/report.service.js";

export const create = async (
  req: Request,
  res: Response
) => {
  try {
    const report = await createReport(req.body);

    res.status(201).json({
      success: true,
      message: "Emergency report submitted successfully",
      data: report,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to submit report",
    });
  }
};

export const getAll = async (
  _req: Request,
  res: Response
) => {
  try {
    const reports = await getReports();

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
    });
  }
};

export const getOne = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid report ID",
      });
      return;
    }

    const report = await getReportById(id);

    if (!report) {
      res.status(404).json({
        success: false,
        message: "Report not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch report",
    });
  }
};

export const update = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid report ID",
      });
      return;
    }

    const report = await updateReport(id, req.body);

    if (!report) {
      res.status(404).json({
        success: false,
        message: "Report not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Report updated successfully",
      data: report,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update report",
    });
  }
};