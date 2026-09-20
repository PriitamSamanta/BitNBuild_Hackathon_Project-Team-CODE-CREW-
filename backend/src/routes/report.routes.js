import { Router } from "express";
import { create, getAll, getOne, update, } from "../controllers/report.controller.js";
const router = Router();
router.post("/", create);
router.get("/", getAll);
router.get("/:id", getOne);
router.patch("/:id", update);
export default router;
//# sourceMappingURL=report.routes.js.map