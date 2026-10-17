import { Router } from "express";
import {
    createPayslip,
    getPayslip,
    getPayslipById,
} from "../controllers/payslip.controller.js";
import { protect, protectAdmin } from "../middleware/protect.middleware.js";

const payslipRouter = Router();

payslipRouter.post("/", protect, protectAdmin, createPayslip);
payslipRouter.get("/", protect, getPayslip);
payslipRouter.get("/:id", protect, getPayslipById);

export default payslipRouter;