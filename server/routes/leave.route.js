import { Router } from "express";
import {
    createLeave,
    getLeaves,
    updateLeaveStatus,
} from "../controllers/leave.controller.js";
import { protect, protectAdmin } from "../middleware/protect.middleware.js";

const leaveRouter = Router();

leaveRouter.post("/", protect, createLeave);
leaveRouter.get("/", protect, getLeaves);
leaveRouter.patch("/:id", protect, protectAdmin, updateLeaveStatus);

export default leaveRouter;
