import { Router } from "express";
import { createEmployee, deleteEmployee, getEmployees, updateEmployee } from "../controllers/employee.controller.js";
import { protect, protectAdmin } from "../middleware/protect.middleware.js";

const employeesRouter = Router();

employeesRouter.get("/", protect, protectAdmin, getEmployees);
employeesRouter.post("/", protect, protectAdmin, createEmployee);
employeesRouter.put("/:id", protect, protectAdmin, updateEmployee);
employeesRouter.delete("/:id", protect, protectAdmin, deleteEmployee);

export default employeesRouter;