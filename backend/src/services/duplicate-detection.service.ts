import Incident from "../models/Incident.js";
import type { IncidentType } from "../models/Incident.js";

interface DuplicateCheckInput {
    description: string;
    latitude: number;
    longitude: number;
    type?: IncidentType;
}

interface DuplicateCandidate {
    incidentId: string;
    mongoId: string;
    type: IncidentType;
    title: string;
    severity: string;
    distanceKm: number;
    createdAt: Date | undefined;
    score: number;
}

const EARTH_RADIUS_KM = 6371;

const calculateDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const toRadians = (degrees: number) =>
        (degrees * Math.PI) / 180;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c =
        2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS_KM * c;
};

const normalizeText = (text: string): string[] => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter((word) => word.length >= 4);
};

const calculateTextSimilarity = (
    first: string,
    second: string
): number => {
    const firstWords = new Set(normalizeText(first));
    const secondWords = new Set(normalizeText(second));

    if (firstWords.size === 0 || secondWords.size === 0) {
        return 0;
    }

    let commonWords = 0;

    for (const word of firstWords) {
        if (secondWords.has(word)) {
            commonWords++;
        }
    }

    const totalUniqueWords = new Set([
        ...firstWords,
        ...secondWords,
    ]).size;

    return commonWords / totalUniqueWords;
};

export const findDuplicateIncidents = async (
    input: DuplicateCheckInput
): Promise<DuplicateCandidate[]> => {
    const recentTime = new Date(
        Date.now() - 24 * 60 * 60 * 1000
    );

    const incidents = await Incident.find({
        createdAt: {
            $gte: recentTime,
        },
        status: {
            $nin: ["resolved", "closed"],
        },
    })
        .sort({ createdAt: -1 })
        .limit(100);

    const candidates: DuplicateCandidate[] = [];

    for (const incident of incidents) {
        const distanceKm = calculateDistanceKm(
            input.latitude,
            input.longitude,
            incident.location.latitude,
            incident.location.longitude
        );

        // Ignore incidents more than 2 km away.
        if (distanceKm > 2) {
            continue;
        }

        const textSimilarity = calculateTextSimilarity(
            input.description,
            `${incident.title} ${incident.description}`
        );

        let score = 0;

        // Location similarity
        if (distanceKm <= 0.5) {
            score += 0.5;
        } else if (distanceKm <= 1) {
            score += 0.35;
        } else {
            score += 0.2;
        }

        // Incident type similarity
        if (input.type && input.type === incident.type) {
            score += 0.3;
        }

        // Description similarity
        if (textSimilarity >= 0.4) {
            score += 0.3;
        } else if (textSimilarity >= 0.2) {
            score += 0.2;
        } else if (textSimilarity >= 0.1) {
            score += 0.1;
        }

        candidates.push({
            incidentId: incident.incidentId,
            mongoId: incident._id.toString(),
            type: incident.type,
            title: incident.title,
            severity: incident.severity,
            distanceKm: Number(distanceKm.toFixed(2)),
            createdAt: incident.createdAt,
            score: Number(Math.min(score, 1).toFixed(2)),
        });
    }

    return candidates.sort(
        (a, b) => b.score - a.score
    );
};