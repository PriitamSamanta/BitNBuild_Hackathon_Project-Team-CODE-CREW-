export interface IncidentAnalysis {
    type: "fire" | "flood" | "accident" | "medical" | "chemical" | "structural" | "road" | "other";
    severity: "low" | "medium" | "high" | "critical";
    priority: number;
    title: string;
    summary: string;
    peopleAffected: number;
    peopleTrapped: number;
    medicalAssistance: boolean;
    recommendedAction: string;
}
export declare const analyzeEmergencyReport: (description: string) => Promise<IncidentAnalysis>;
//# sourceMappingURL=ai.service.d.ts.map