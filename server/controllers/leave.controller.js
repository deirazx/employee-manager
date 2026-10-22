import { inngest } from "../inggest/index.js";
import Employee from "../models/Employee.js";
import LeaveApplication from "../models/LeaveApplication.js";

// POST /api/leaves
// Create leave application
export const createLeave = async (req, res) => {
    try {
        const user = req.user;
        const employee = await Employee.findOne({ userId: user._id });

        if (!employee) {
            return res.status(400).json({
                error: user.role === "ADMIN"
                    ? "Admins cannot apply for employee leaves. Please login with an Employee account to apply."
                    : "Employee record not found for this account",
            });
        }

        if (employee.isDeleted) {
            return res.status(403).json({
                error: "Your account is deactivated. You cannot apply for leave.",
            });
        }

        const { type, startDate, endDate, reason } = req.body;
        if (!type || !startDate || !endDate || !reason) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);

        if (start < today || end < today) {
            return res.status(400).json({ error: "Leave dates cannot be in the past" });
        }

        if (end < start) {
            return res.status(400).json({ error: "End date cannot be before start date" });
        }

        const leave = await LeaveApplication.create({
            employeeId: employee._id,
            type: type.toUpperCase(),
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            reason,
            status: "PENDING",
        });

        // Background notification (wrapped so inngest network failures don't block DB save)
        try {
            await inngest.send({
                name: "leave/pending",
                data: { leaveApplicationId: leave._id },
            });
        } catch (inngestErr) {
            console.warn("Inngest event warning:", inngestErr.message);
        }

        return res.status(201).json({ success: true, data: leave });
    } catch (error) {
        console.error("Create leave error:", error);
        return res.status(500).json({ error: "Failed to create leave application" });
    }
};

// GET /api/leaves
// Get leaves (Admin gets all, Employee gets their own)
export const getLeaves = async (req, res) => {
    try {
        const user = req.user;
        const isAdmin = user.role?.toUpperCase() === "ADMIN";

        if (isAdmin) {
            const status = req.query.status;
            const where = status ? { status: status.toUpperCase() } : {};
            const leaves = await LeaveApplication.find(where)
                .populate("employeeId")
                .sort({ createdAt: -1 });

            const data = leaves.map((l) => {
                const obj = l.toObject ? l.toObject() : l;
                const emp = obj.employeeId;
                const employeeName = emp
                    ? `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || emp.name || "Employee"
                    : "Employee";

                return {
                    ...obj,
                    id: obj._id.toString(),
                    employee: employeeName,
                    employeeName,
                    employeeEmail: emp?.email || "",
                    employeePhone: emp?.phone || "",
                    department: emp?.department || "General",
                    role: emp?.position || "Employee",
                    employeeId: emp?._id?.toString() || emp?.toString(),
                };
            });

            return res.json({ success: true, data });
        } else {
            const employee = await Employee.findOne({ userId: user._id }).lean();
            if (!employee) {
                return res.status(404).json({ error: "Employee record not found" });
            }

            const leaves = await LeaveApplication.find({ employeeId: employee._id })
                .populate("employeeId")
                .sort({ createdAt: -1 });

            const data = leaves.map((l) => {
                const obj = l.toObject ? l.toObject() : l;
                const emp = obj.employeeId || employee;
                const employeeName = `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "Employee";

                return {
                    ...obj,
                    id: obj._id.toString(),
                    employee: employeeName,
                    employeeName,
                    employeeEmail: emp?.email || "",
                    employeePhone: emp?.phone || "",
                    department: emp?.department || "General",
                    role: emp?.position || "Employee",
                };
            });

            return res.json({
                success: true,
                data,
                employee: { ...employee, id: employee._id.toString() },
            });
        }
    } catch (error) {
        console.error("Get leaves error:", error);
        return res.status(500).json({ error: "Failed to fetch leaves" });
    }
};

// PATCH /api/leaves/:id
// Update leave status (Admin only)
export const updateLeaveStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const formattedStatus = status?.toUpperCase();

        if (!["APPROVED", "REJECTED", "PENDING"].includes(formattedStatus)) {
            return res.status(400).json({ error: "Invalid status value" });
        }

        const leave = await LeaveApplication.findByIdAndUpdate(
            req.params.id,
            { status: formattedStatus },
            { new: true }
        );

        if (!leave) {
            return res.status(404).json({ error: "Leave application not found" });
        }

        return res.json({ success: true, data: leave });
    } catch (error) {
        console.error("Update leave status error:", error);
        return res.status(500).json({ error: "Failed to update leave status" });
    }
};