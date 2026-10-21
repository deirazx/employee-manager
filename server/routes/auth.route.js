import { Router } from "express";
import { changePassword, login, logout } from "../controllers/auth.controller.js";
import { protect } from "../middleware/protect.middleware.js";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.put("/change-pass", protect, changePassword);

export default authRouter;