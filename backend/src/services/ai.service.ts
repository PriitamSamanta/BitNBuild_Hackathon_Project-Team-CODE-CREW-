import { GoogleGenAI } from "@google/genai";



export interface IncidentAnalysis {
  type:
    | "fire"
    | "flood"
    | "accident"
    | "medical"
    | "chemical Disaster"
    | "structural"
    | "road"
    | "other";

  severity: "low" | "medium" | "high" | "critical";

  priority: number;

  title: string;

  summary: string;

  peopleAffected: number;

  peopleTrapped: number;

  medicalAssistance: boolean;

  recommendedAction: string;
}

export const analyzeEmergencyReport = async (
  description: string
): Promise<IncidentAnalysis> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined");
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  const prompt = `
You are ResQAI, an intelligent emergency-response system.

Analyze the following emergency report.

Return ONLY valid JSON.
Do not use markdown.
Do not add explanations outside the JSON.

Emergency report:
"${description}"

Return exactly this structure:

{
  "type": "fire",
  "severity": "critical",
  "priority": 5,
  "title": "short emergency title",
  "summary": "short emergency summary",
  "peopleAffected": 0,
  "peopleTrapped": 0,
  "medicalAssistance": false,
  "recommendedAction": "recommended immediate response"
}

Allowed type values:
fire, flood, accident, medical, chemical, structural, road, other

Allowed severity values:
low, medium, high, critical

Rules:

- priority must be between 1 and 5.
- 5 means immediate critical response.
- If people are trapped, consider high or critical severity.
- If medical assistance is clearly required, set medicalAssistance to true.
- Do not invent facts that are not present in the report.
- If the number of affected people is unknown, use 0.
- If the number of trapped people is unknown, use 0.
- If medical assistance is unknown, use false.
`;

  const response = await ai.models.generateContent({
    model:  "gemini-3.1-flash-lite",
    contents: prompt,
  });

  const text = response.text;

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  const cleanedText = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleanedText) as IncidentAnalysis;
};