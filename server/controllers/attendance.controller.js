import { inngest } from "../inggest/index.js";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

// Clock in/out for employee
// POST /api/attendance/clock
export const clockInOut = async (req, res) => {
    try {
        const user = req.user;
        const employee = await Employee.findOne({ userId: user._id });

        if (!employee) {
            return res.status(404).json({ error: "Employee record not found" });
        }

        if (employee.isDeleted) {
            return res.status(403).json({
                error: "Your account is deactivated. You cannot clock in/out.",
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existing = await Attendance.findOne({
            employeeId: employee._id,
            date: today,
        });

        const now = new Date();

        if (!existing) {
            const isLate = now.getHours() >= 9 && now.getMinutes() > 0;
            const attendance = await Attendance.create({
                employeeId: employee._id,
                date: today,
                checkIn: now,
                status: isLate ? "LATE" : "PRESENT",
            });

            await inngest.send({
                name: "employee/check-out",
                data: {
                    employeeId: employee._id,
                    attendanceId: attendance._id,
                }
            })

            return res.json({ success: true, type: "CHECK_IN", data: attendance });
        } else if (!existing.checkOut) {
            const checkInTime = new Date(existing.checkIn).getTime();
            const diffMs = now.getTime() - checkInTime;
            const diffHours = diffMs / (1000 * 60 * 60);

            existing.checkOut = now;

            // Compute working hours and day type
            const workingHours = parseFloat(diffHours.toFixed(2));
            let dayType = "Half Day";
            if (workingHours >= 8) dayType = "Full Day";
            else if (workingHours >= 6) dayType = "Three Quarter Day";
            else if (workingHours >= 4) dayType = "Half Day";
            else dayType = "Short Day";

            existing.workingHours = `${workingHours} hrs`;
            existing.dayType = dayType;

            await existing.save();
            return res.json({ success: true, type: "CHECK_OUT", data: existing });
        } else {
            return res.json({
                success: true,
                type: "ALREADY_CHECKED_OUT",
                data: existing,
            });
        }
    } catch (error) {
        console.error("Attendance Error:", error);
        return res.status(500).json({ error: "Operation failed" });
    }
};

// Get attendance for employee and admin
// GET /api/attendance
export const getAttendance = async (req, res) => {
    try {
        const user = req.user;
        const isAdmin = user.role?.toUpperCase() === "ADMIN";

        if (isAdmin) {
            const { date, department, search, limit } = req.query;
            let query = {};

            if (date) {
                const startOfDay = new Date(date);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);
                query.date = { $gte: startOfDay, $lte: endOfDay };
            }

            const records = await Attendance.find(query)
                .populate({
                    path: "employeeId",
                    select: "firstName lastName email phone position department isDeleted",
                })
                .sort({ date: -1, checkIn: -1 })
                .limit(parseInt(limit) || 100)
                .lean();

            // Filter out records where employee might have been deleted or missing
            let filtered = records.filter((r) => r.employeeId && !r.employeeId.isDeleted);

            if (department && department !== "All Departments") {
                filtered = filtered.filter(
                    (r) => r.employeeId?.department?.toLowerCase() === department.toLowerCase()
                );
            }

            if (search) {
                const s = search.toLowerCase();
                filtered = filtered.filter((r) => {
                    const empName = `${r.employeeId?.firstName || ""} ${r.employeeId?.lastName || ""}`.toLowerCase();
                    const empEmail = (r.employeeId?.email || "").toLowerCase();
                    const empPhone = (r.employeeId?.phone || "").toLowerCase();
                    return empName.includes(s) || empEmail.includes(s) || empPhone.includes(s);
                });
            }

            // Compute today's summary stats for Admin dashboard
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            const todayRecords = await Attendance.find({
                date: { $gte: todayStart, $lte: todayEnd },
            }).lean();

            const todayPresent = todayRecords.length;
            const currentlyActive = todayRecords.filter((r) => r.checkIn && !r.checkOut).length;
            const completedWork = todayRecords.filter((r) => r.checkOut).length;
            const lateArrivals = todayRecords.filter((r) => r.status === "LATE").length;

            return res.status(200).json({
                success: true,
                role: "ADMIN",
                data: filtered,
                stats: {
                    todayPresent,
                    currentlyActive,
                    completedWork,
                    lateArrivals,
                },
            });
        } else {
            const employee = await Employee.findOne({ userId: user._id });
            if (!employee) return res.status(404).json({ error: "Employee record not found" });

            const limit = parseInt(req.query.limit || 30);
            const records = await Attendance.find({ employeeId: employee._id })
                .sort({ date: -1 })
                .limit(limit)
                .lean();

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const todayRecord = await Attendance.findOne({
                employeeId: employee._id,
                date: today,
            }).lean();

            return res.status(200).json({
                success: true,
                role: "EMPLOYEE",
                data: records,
                todayAttendance: todayRecord,
                employee: {
                    id: employee._id,
                    firstName: employee.firstName,
                    lastName: employee.lastName,
                    email: employee.email,
                    phone: employee.phone,
                    position: employee.position,
                    department: employee.department,
                    isDeleted: employee.isDeleted,
                },
            });
        }
    } catch (error) {
        console.error("Get attendance error:", error);
        return res.status(500).json({ error: "Failed to fetch attendance" });
    }
};