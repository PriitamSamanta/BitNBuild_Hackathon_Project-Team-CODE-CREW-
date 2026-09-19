import { Router } from "express";

import {
  dispatch,
} from "../controllers/dispatch.controller.js";

const router = Router();

router.post(
  "/incidents/:id/dispatch",
  dispatch
);

export default router;