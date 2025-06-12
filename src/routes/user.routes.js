import { Router } from "express";
import { registerUser, logoutUser } from "../contollers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverimage", maxCount: 1 },
  ]),
  registerUser
);

//secured route
router.route("/logout").get(verifyJWT, logoutUser);

export default router;
