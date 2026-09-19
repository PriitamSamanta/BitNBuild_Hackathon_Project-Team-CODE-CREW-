import Report from "../models/Report.js";
import Incident from "../models/Incident.js";
import { analyzeEmergencyReport } from "./ai.service.js";

interface CreateReportData {
  description: string;

  type?: string;

  location: {
    address?: string;
    latitude: number;
    longitude: number;
  };

  peopleAffected?: number;

  peopleTrapped?: number;

  medicalAssistance?: boolean;

  reporterName?: string;

  reporterPhone?: string;

  source?: "citizen" | "field_team" | "sensor";
}

export const createReport = async (data: CreateReportData) => {
  // ----------------------------------------
  // 1. Generate Report ID
  // ----------------------------------------

  const reportCount = await Report.countDocuments();

  const reportId = `REP-${String(reportCount + 1).padStart(4, "0")}`;

  // ----------------------------------------
  // 2. Save Citizen Report
  // ----------------------------------------

  const report = await Report.create({
    ...data,
    reportId,
    source: data.source || "citizen",
    status: "processing",
  });

  // ----------------------------------------
  // 3. Analyze Emergency using Gemini
  // ----------------------------------------

  const aiAnalysis = await analyzeEmergencyReport(
    data.description
  );

  // ----------------------------------------
  // 4. Generate Incident ID
  // ----------------------------------------

  const incidentCount = await Incident.countDocuments();

  const incidentId = `INC-${String(incidentCount + 1).padStart(
    4,
    "0"
  )}`;

  // ----------------------------------------
  // 5. Create Incident
  // ----------------------------------------

  const incidentData = {
    incidentId,

    type: aiAnalysis.type,

    title: aiAnalysis.title,

    description: data.description,

    severity: aiAnalysis.severity,

    priority: aiAnalysis.priority,

    status: "reported" as const,

    location: data.location,

    peopleAffected:
      data.peopleAffected ??
      aiAnalysis.peopleAffected ??
      0,

    peopleTrapped:
      data.peopleTrapped ??
      aiAnalysis.peopleTrapped ??
      0,

    medicalAssistance:
      data.medicalAssistance ??
      aiAnalysis.medicalAssistance ??
      false,

    source: data.source || "citizen",
  };

  const incident = await Incident.create(incidentData);

  // ----------------------------------------
  // 6. Link Report → Incident
  // ----------------------------------------

  report.incidentId = incident._id;

  report.status = "linked";

  await report.save();

  // ----------------------------------------
  // 7. Return Result
  // ----------------------------------------

  return {
    report,
    incident,
    aiAnalysis,
  };
};

// ----------------------------------------
// Get All Reports
// ----------------------------------------

export const getReports = async () => {
  return Report.find()
    .sort({ createdAt: -1 })
    .populate("incidentId");
};

// ----------------------------------------
// Get Report By ID
// ----------------------------------------

export const getReportById = async (id: string) => {
  return Report.findById(id)
    .populate("incidentId");
};

// ----------------------------------------
// Update Report
// ----------------------------------------

export const updateReport = async (
  id: string,
  data: Record<string, unknown>
) => {
  return Report.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  ).populate("incidentId");
};