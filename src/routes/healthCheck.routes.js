import { Router } from "express";
import { healthCheck } from "../contollers/healthCheckController.js";

const router = Router();
router.route("/").get(healthCheck);

export default router;
