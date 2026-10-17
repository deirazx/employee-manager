import { DEPARTMENTS } from "../constant/departments.js";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import LeaveApplication from "../models/LeaveApplication.js";
import Payslip from "../models/Payslip.js";

// Get dashboard stats for employee and admin
// GET /api/dashboard
export const getDashboard = async (req, res) => {
    try {
        const user = req.user;
        const isAdmin = user.role?.toUpperCase() === "ADMIN";

        if (isAdmin) {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            const [totalEmployees, todayAttendance, pendingLeaves] = await Promise.all([
                Employee.countDocuments({ isDeleted: { $ne: true } }),
                Attendance.countDocuments({
                    date: {
                        $gte: todayStart,
                        $lte: todayEnd,
                    },
                }),
                LeaveApplication.countDocuments({
                    status: "PENDING",
                }),
            ]);

            const validDepartments = DEPARTMENTS.filter(
                (d) => d && d !== "All Departments"
            );

            return res.json({
                success: true,
                role: "ADMIN",
                totalEmployees,
                totalDepartments: validDepartments.length,
                totalDepartmens: validDepartments.length, // Alias for backward compatibility
                todayAttendance,
                pendingLeaves,
            });
        } else {
            const employee = await Employee.findOne({
                userId: user._id || user.userId,
            }).lean();

            if (!employee) {
                return res.status(404).json({ error: "Employee not found" });
            }

            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

            const [currentMonthAttendance, pendingLeaves, latestPayslip] = await Promise.all([
                Attendance.countDocuments({
                    employeeId: employee._id,
                    date: {
                        $gte: startOfMonth,
                        $lte: endOfMonth,
                    },
                }),
                LeaveApplication.countDocuments({
                    employeeId: employee._id,
                    status: "PENDING",
                }),
                Payslip.findOne({ employeeId: employee._id }).sort({ createdAt: -1 }).lean(),
            ]);

            return res.json({
                success: true,
                role: "EMPLOYEE",
                employee: { ...employee, id: employee._id.toString() },
                currentMonthAttendance,
                pendingLeaves,
                latestPayslip: latestPayslip
                    ? { ...latestPayslip, id: latestPayslip._id.toString() }
                    : null,
            });
        }
    } catch (error) {
        console.error("Dashboard error:", error);
        return res.status(500).json({ error: "Failed to fetch dashboard metrics" });
    }
};