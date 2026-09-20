import mongoose from "mongoose";
export type ReportStatus = "received" | "processing" | "linked" | "consolidated";
export type ReportSource = "citizen" | "field_team" | "sensor";
export interface IReport {
    reportId: string;
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
    source: ReportSource;
    status: ReportStatus;
    incidentId?: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}
declare const Report: mongoose.Model<IReport, {}, {}, {}, mongoose.Document<unknown, {}, IReport, {}, mongoose.DefaultSchemaOptions> & IReport & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, IReport>;
export default Report;
//# sourceMappingURL=Report.d.ts.map