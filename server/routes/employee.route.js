import { Router } from "express";
import { createEmployee, deleteEmployee, getEmployees, updateEmployee } from "../controllers/employee.controller.js";

const employeesRouter = Router();

employeesRouter.get("/", getEmployees);
employeesRouter.post("/", createEmployee);
employeesRouter.put("/:id", updateEmployee);
employeesRouter.delete("/:id", deleteEmployee);

export default employeesRouter;