import { Router } from "express";
import { protect } from "../middleware/protect.middleware.js";
import { getProfile, updateProfile } from "../controllers/profile.controller.js";

const profileRouter = Router();

profileRouter.get("/", protect, getProfile);
profileRouter.post("/", protect, updateProfile);

export default profileRouter;