import { Router } from "express";
import { changeTeamStatus } from "../controllers/team-status.controller.js";
const router = Router();
router.patch("/teams/:id/status", changeTeamStatus);
export default router;
//# sourceMappingURL=team-status.routes.js.map