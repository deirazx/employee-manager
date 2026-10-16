import Employee from "../models/Employee.js";

// Get profile
// GET /api/profile
export const getProfile = async (req, res) => {
    try {
        const userId = req.user?._id;
        const employee = await Employee.findOne({ userId });

        if (!employee) {
            // Authenticated user is an admin or not an employee record
            return res.json({
                firstName: "Admin",
                lastName: "",
                email: req.user?.email || ""
            });
        }
        return res.status(200).json(employee);
    } catch (error) {
        console.error("Get profile error:", error);
        return res.status(500).json({ error: "Failed to fetch profile" });
    }
};

// Update profile
// POST /api/profile
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user?._id;
        const employee = await Employee.findOne({ userId });
        if (!employee) return res.status(404).json({ error: "Employee not found" });

        if (employee.isDeleted) {
            return res.status(403).json({ error: "Your account is deactivated. You cannot update your profile." });
        }

        const bio = req.body?.bio ?? "";
        await Employee.findByIdAndUpdate(employee._id, { bio });

        return res.json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({ error: "Failed to update profile." });
    }
};