import { Router } from "express";
import {
  checkDuplicateIncidents,
} from "../controllers/duplicate-detection.controller.js";

const router = Router();

router.post(
  "/incidents/check-duplicate",
  checkDuplicateIncidents
);

export default router;