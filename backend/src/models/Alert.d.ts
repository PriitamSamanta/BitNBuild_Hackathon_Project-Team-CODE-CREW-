import mongoose from "mongoose";
export type AlertType = "critical_incident" | "response_delay" | "escalation" | "resource_shortage";
export type AlertSeverity = "info" | "warning" | "critical";
export type AlertStatus = "active" | "acknowledged" | "resolved";
export interface IAlert {
    alertId: string;
    type: AlertType;
    severity: AlertSeverity;
    title: string;
    message: string;
    incidentId?: mongoose.Types.ObjectId;
    status: AlertStatus;
    metadata?: {
        delayMinutes?: number;
        previousSeverity?: string;
        currentSeverity?: string;
        requiredResource?: string;
    };
    createdAt?: Date;
    updatedAt?: Date;
}
declare const Alert: mongoose.Model<IAlert, {}, {}, {}, mongoose.Document<unknown, {}, IAlert, {}, mongoose.DefaultSchemaOptions> & IAlert & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, IAlert>;
export default Alert;
//# sourceMappingURL=Alert.d.ts.map