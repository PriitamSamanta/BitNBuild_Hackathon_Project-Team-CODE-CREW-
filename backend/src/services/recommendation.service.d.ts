interface RecommendedTeam {
    teamId: string;
    name: string;
    type: string;
    status: string;
    distanceKm: number;
    capabilities: string[];
    contactNumber?: string;
    reason: string;
}
export declare const getRecommendations: (incidentId: string) => Promise<{
    incident: unknown;
    recommendations: RecommendedTeam[];
}>;
export {};
//# sourceMappingURL=recommendation.service.d.ts.map