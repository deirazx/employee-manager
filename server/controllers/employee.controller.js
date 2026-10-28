import Employee from "../models/Employee.js";
import bcrypt from "bcrypt";
import User from "../models/User.js";

// Get employees
// GET /api/employees
export const getEmployees = async (req, res) => {
    try {
        const { department } = req.query;

        // 1. Dynamic filter object
        const where = { isDeleted: { $ne: true } };
        if (department && department !== "All Departments") where.department = department;

        // 2. Chained Mongoose query
        const employees = await Employee.find(where)
            .sort({ createdAt: -1 })
            .populate("userId", "email role")
            .lean();

        // 3. Response shape formatting
        const result = employees.map((emp) => ({
            ...emp,
            id: emp._id.toString(),
            user: emp.userId ? { email: emp.userId.email, role: emp.userId.role } : null
        }));

        return res.status(200).json(result);
    } catch (error) {
        console.error("Fetch employees error:", error);
        return res.status(500).json({ error: "Failed to fetch employees" });
    }
};

// Create employee
// POST /api/employees
export const createEmployee = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, position, department, basicSalary, allowances, deductions, joinDate, password, role, bio } = req.body;

        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                error: "Missing required fields"
            });
        }

        const hashed = await bcrypt.hash(password, 12);
        const user = await User.create({
            email,
            password: hashed,
            role: role || "Employee"
        });

        const employee = await Employee.create({
            userId: user._id,
            firstName,
            lastName,
            email,
            phone: phone || "0000000000",
            position: position || "Employee",
            department: department || "Engineering",
            basicSalary: Number(basicSalary) || 0,
            allowances: Number(allowances) || 0,
            deductions: Number(deductions) || 0,
            joinDate: joinDate ? new Date(joinDate) : new Date(),
            bio: bio || ""
        });

        return res.status(201).json({ success: true, employee });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                error: "Email already exists"
            });
        }
        console.error("Create employee error:", error);
        return res.status(500).json({ error: "Failed to create employee" });
    }
};

// Update employee
// PUT /api/employees/:id
export const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            firstName,
            lastName,
            email,
            phone,
            position,
            department,
            basicSalary,
            allowances,
            deductions,
            password,
            role,
            bio,
            employmentStatus
        } = req.body;

        const employee = await Employee.findById(id);
        if (!employee) return res.status(404).json({ error: "Employee not found" });

        const updatedEmployee = await Employee.findByIdAndUpdate(
            id,
            {
                firstName,
                lastName,
                email,
                phone: phone || "0000000000",
                position: position || "Employee",
                department: department || "Engineering",
                basicSalary: Number(basicSalary) || 0,
                allowances: Number(allowances) || 0,
                deductions: Number(deductions) || 0,
                employmentStatus: employmentStatus || "ACTIVE",
                bio: bio || ""
            },
            { new: true }
        );

        // Update user record if needed
        const userUpdate = {};
        if (email) userUpdate.email = email;
        if (role) userUpdate.role = role;
        if (password && password.trim()) {
            userUpdate.password = await bcrypt.hash(password.trim(), 12);
        }
        if (Object.keys(userUpdate).length > 0 && employee.userId) {
            await User.findByIdAndUpdate(employee.userId, userUpdate);
        }

        return res.status(200).json({ success: true, employee: updatedEmployee });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                error: "Email already exists"
            });
        }
        console.error("Update employee error:", error);
        return res.status(500).json({ error: "Failed to update employee" });
    }
};

// Delete employee (soft delete)
// DELETE /api/employees/:id
export const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findById(id);
        if (!employee) return res.status(404).json({ error: "Employee not found" });

        employee.isDeleted = true;
        employee.employmentStatus = "INACTIVE";
        await employee.save();
        return res.json({ success: true, message: "Employee deleted successfully" });
    } catch (error) {
        console.error("Delete employee error:", error);
        return res.status(500).json({ error: "Failed to delete employee" });
    }
};
