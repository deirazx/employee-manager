import mongoose from "mongoose";
import Employee from "../models/Employee.js";
import Payslip from "../models/Payslip.js";

// POST /api/payslips
// Create payslip for an employee (Admin only)
export const createPayslip = async (req, res) => {
    try {
        const {
            employeeId,
            month,
            year,
            basicSalary,
            allowances = 0,
            deductions = 0,
        } = req.body;

        // Validate required fields
        if (
            !employeeId ||
            month === undefined ||
            month === null ||
            year === undefined ||
            year === null ||
            basicSalary === undefined ||
            basicSalary === null ||
            basicSalary === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter all the required fields",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID format",
            });
        }

        // Convert values to numbers
        const monthNumber = Number(month);
        const yearNumber = Number(year);
        const basicSalaryNumber = Number(basicSalary);
        const allowancesNumber = Number(allowances);
        const deductionsNumber = Number(deductions);

        // Validate numeric ranges
        if (
            !Number.isInteger(monthNumber) ||
            monthNumber < 1 ||
            monthNumber > 12 ||
            !Number.isInteger(yearNumber) ||
            yearNumber < 1900 ||
            !Number.isFinite(basicSalaryNumber) ||
            basicSalaryNumber < 0 ||
            !Number.isFinite(allowancesNumber) ||
            allowancesNumber < 0 ||
            !Number.isFinite(deductionsNumber) ||
            deductionsNumber < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter valid salary details",
            });
        }

        const netSalary = Math.round((basicSalaryNumber + allowancesNumber - deductionsNumber) * 100) / 100;

        if (netSalary < 0) {
            return res.status(400).json({
                success: false,
                message: "Deductions cannot exceed the total earnings",
            });
        }

        // Verify employee exists and is active
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        if (employee.isDeleted) {
            return res.status(400).json({
                success: false,
                message: "Cannot create payslip for a deactivated employee",
            });
        }

        // Prevent duplicate payslips for the same month and year
        const existingPayslip = await Payslip.findOne({
            employeeId,
            month: monthNumber,
            year: yearNumber,
        });

        if (existingPayslip) {
            return res.status(409).json({
                success: false,
                message: `Payslip for ${monthNumber}/${yearNumber} already exists for this employee`,
            });
        }

        const payslip = await Payslip.create({
            employeeId,
            month: monthNumber,
            year: yearNumber,
            basicSalary: basicSalaryNumber,
            allowances: allowancesNumber,
            deductions: deductionsNumber,
            netSalary,
        });

        const populatedPayslip = await Payslip.findById(payslip._id).populate("employeeId");

        return res.status(201).json({
            success: true,
            data: populatedPayslip,
        });
    } catch (error) {
        console.error("Create payslip error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// GET /api/payslips
// Get payslips (Admin gets all with optional filters, Employee gets their own)
export const getPayslip = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const isAdmin = user.role?.toUpperCase() === "ADMIN";
        let payslips;

        if (isAdmin) {
            const query = {};
            if (req.query.employeeId && mongoose.Types.ObjectId.isValid(req.query.employeeId)) {
                query.employeeId = req.query.employeeId;
            }
            if (req.query.month) {
                query.month = Number(req.query.month);
            }
            if (req.query.year) {
                query.year = Number(req.query.year);
            }

            payslips = await Payslip.find(query)
                .populate("employeeId")
                .sort({ createdAt: -1 });
        } else {
            // Find the employee linked to the logged-in user
            const employee = await Employee.findOne({ userId: user._id });

            if (!employee) {
                return res.status(404).json({
                    success: false,
                    message: "Employee record not found",
                });
            }

            payslips = await Payslip.find({ employeeId: employee._id })
                .populate("employeeId")
                .sort({ createdAt: -1 });
        }

        const data = payslips.map((p) => {
            const obj = p.toObject ? p.toObject() : p;
            const employee = obj.employeeId;

            return {
                ...obj,
                id: obj._id.toString(),
                employee,
                employeeId: employee?._id?.toString() ?? employee?.toString() ?? null,
            };
        });

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Get payslips error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get payslips",
        });
    }
};

// GET /api/payslips/:id
// Get single payslip by ID with population and authorization check
export const getPayslipById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payslip ID format",
            });
        }

        const payslip = await Payslip.findById(id).populate("employeeId").lean();

        if (!payslip) {
            return res.status(404).json({
                success: false,
                message: "Payslip not found",
            });
        }

        const user = req.user;
        const isAdmin = user.role?.toUpperCase() === "ADMIN";

        // Non-admin can only access their own payslip
        if (!isAdmin) {
            const employee = await Employee.findOne({ userId: user._id });
            const payslipEmpId = payslip.employeeId?._id?.toString() || payslip.employeeId?.toString();
            if (!employee || payslipEmpId !== employee._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Access forbidden: You can only view your own payslip",
                });
            }
        }

        const employee = payslip.employeeId;

        const data = {
            ...payslip,
            id: payslip._id.toString(),
            employee,
            employeeId: employee?._id ? employee._id.toString() : employee?.toString(),
        };

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Get payslip by ID error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get payslip",
        });
    }
};
