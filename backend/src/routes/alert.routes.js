import { Router } from "express";
import { acknowledge, create, getAll, getOne, resolve, } from "../controllers/alert.controller.js";
const router = Router();
router.post("/", create);
router.get("/", getAll);
router.get("/:id", getOne);
router.patch("/:id/acknowledge", acknowledge);
router.patch("/:id/resolve", resolve);
export default router;
//# sourceMappingURL=alert.routes.js.map