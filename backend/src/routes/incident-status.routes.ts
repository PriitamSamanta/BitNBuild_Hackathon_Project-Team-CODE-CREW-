import { Router } from "express";
import { changeIncidentStatus } from "../controllers/incident-status.controller.js";

const router = Router();

router.patch(
  "/incidents/:id/status",
  changeIncidentStatus
);

export default router;