import { Router } from "express";
import { recommendTeams, } from "../controllers/recommendation.controller.js";
const router = Router();
router.get("/incidents/:id/recommendations", recommendTeams);
export default router;
//# sourceMappingURL=recommendation.routes.js.map