import Report from "../models/Report.js";
import Incident from "../models/Incident.js";
import { analyzeEmergencyReport } from "./ai.service.js";
import { findDuplicateIncidents } from "./duplicate-detection.service.js";
import { emitSocketEvent } from "../config/socket.js";
import { createCriticalIncidentAlert } from "./alert-engine.service.js";
export const createReport = async (data) => {
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
    const aiAnalysis = await analyzeEmergencyReport(data.description);
    const duplicateCandidates = await findDuplicateIncidents({
        description: data.description,
        latitude: data.location.latitude,
        longitude: data.location.longitude,
        type: aiAnalysis.type,
    });
    const duplicateIncident = duplicateCandidates.find((candidate) => candidate.score >= 0.6);
    if (duplicateIncident) {
        const existingIncident = await Incident.findOne({
            incidentId: duplicateIncident.incidentId,
        });
        if (!existingIncident) {
            throw new Error("Matched incident could not be found");
        }
        const reportId = `REP-${String((await Report.countDocuments()) + 1).padStart(4, "0")}`;
        const report = await Report.create({
            reportId,
            description: data.description,
            type: aiAnalysis.type,
            location: data.location,
            ...(data.peopleAffected !== undefined
                ? { peopleAffected: data.peopleAffected }
                : {}),
            ...(data.peopleTrapped !== undefined
                ? { peopleTrapped: data.peopleTrapped }
                : {}),
            ...(data.medicalAssistance !== undefined
                ? { medicalAssistance: data.medicalAssistance }
                : {}),
            ...(data.reporterName !== undefined
                ? { reporterName: data.reporterName }
                : {}),
            ...(data.reporterPhone !== undefined
                ? { reporterPhone: data.reporterPhone }
                : {}),
            ...(data.source !== undefined
                ? { source: data.source }
                : {}),
            status: "linked",
            incidentId: existingIncident._id,
        });
        emitSocketEvent("report:linked", {
            reportId: report.reportId,
            incidentId: existingIncident.incidentId,
            incidentMongoId: existingIncident._id.toString(),
            duplicateScore: duplicateIncident.score,
        });
        return {
            report,
            incident: existingIncident,
            aiAnalysis,
            duplicate: true,
            duplicateScore: duplicateIncident.score,
        };
    }
    // ----------------------------------------
    // 4. Generate Incident ID
    // ----------------------------------------
    const incidentCount = await Incident.countDocuments();
    const incidentId = `INC-${String(incidentCount + 1).padStart(4, "0")}`;
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
        status: "reported",
        location: data.location,
        peopleAffected: data.peopleAffected ??
            aiAnalysis.peopleAffected ??
            0,
        peopleTrapped: data.peopleTrapped ??
            aiAnalysis.peopleTrapped ??
            0,
        medicalAssistance: data.medicalAssistance ??
            aiAnalysis.medicalAssistance ??
            false,
        source: data.source || "citizen",
    };
    const incident = await Incident.create(incidentData);
    await createCriticalIncidentAlert(incident._id.toString());
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
export const getReportById = async (id) => {
    return Report.findById(id)
        .populate("incidentId");
};
// ----------------------------------------
// Update Report
// ----------------------------------------
export const updateReport = async (id, data) => {
    return Report.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    }).populate("incidentId");
};
//# sourceMappingURL=report.service.js.map