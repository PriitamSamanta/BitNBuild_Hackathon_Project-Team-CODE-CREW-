import Report from "../models/Report.js";

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
  const reportCount = await Report.countDocuments();

  const reportId = `REP-${String(reportCount + 1).padStart(4, "0")}`;

  const report = await Report.create({
    ...data,
    reportId,
    source: data.source || "citizen",
  });

  return report;
};

export const getReports = async () => {
  return Report.find()
    .sort({ createdAt: -1 })
    .populate("incidentId");
};

export const getReportById = async (id: string) => {
  return Report.findById(id).populate("incidentId");
};

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