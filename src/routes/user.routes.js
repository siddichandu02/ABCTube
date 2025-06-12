import { Router } from "express";
import { registerUser } from "../contollers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverimage", maxCount: 1 },
  ]),
  registerUser
);

export default router;
