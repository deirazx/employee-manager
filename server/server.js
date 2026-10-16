import express from "express";
import cors from "cors";
import "dotenv/config";
import multer from "multer";
import { ConnectDb } from "./config/db.js";
import cookieParse from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import employeesRouter from "./routes/employee.route.js";
import profileRouter from "./routes/profile.route.js";
import attendanceRouter from "./routes/attendance.route.js";
import leaveRouter from "./routes/leave.route.js";

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(cookieParse());
app.use(express.json({ limit: "10kb" }));
app.use(multer().none());

app.get("/", (req, res) => res.send("Server is running"));

app.use("/api/auth", authRouter);
app.use("/api/employees", employeesRouter);
app.use("/api/profile", profileRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/leaves", leaveRouter);

ConnectDb().then(() => {
    app.listen(PORT, () => console.log(`Server is running at ${PORT}`));
});