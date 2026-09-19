import { Router } from "express";
import { analyzeIncident } from "../controllers/ai.controller.js";

const router = Router();

router.post("/analyze", analyzeIncident);

export default router;