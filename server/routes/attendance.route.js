import { Router } from "express";
import { clockInOut, getAttendance } from "../controllers/attendance.controller.js";
import { protect } from "../middleware/protect.middleware.js";

const attendanceRouter = Router();

attendanceRouter.post("/", protect, clockInOut);
attendanceRouter.post("/clock", protect, clockInOut);
attendanceRouter.get("/", protect, getAttendance);

export default attendanceRouter;
