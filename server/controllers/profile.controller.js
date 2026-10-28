import Employee from "../models/Employee.js";
import User from "../models/User.js";

// Get profile
// GET /api/profile
export const getProfile = async (req, res) => {
    try {
        const userId = req.user?._id;
        const employee = await Employee.findOne({ userId });

        if (!employee) {
            // Authenticated user is an admin without an employee record
            return res.status(200).json({
                firstName: "Admin",
                lastName: "",
                email: req.user?.email || "",
                role: req.user?.role || "ADMIN",
            });
        }
        return res.status(200).json({
            ...employee.toObject(),
            role: req.user?.role || "EMPLOYEE",
        });
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

        if (!employee) {
            // Admin user without an Employee document
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ error: "User not found" });

            const { email } = req.body;
            if (email && email.trim() && email !== user.email) {
                user.email = email.trim();
                await user.save();
            }

            return res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                profile: {
                    firstName: "Admin",
                    lastName: "",
                    email: user.email,
                    role: user.role || "ADMIN",
                },
            });
        }

        if (employee.isDeleted) {
            return res.status(403).json({ error: "Your account is deactivated. You cannot update your profile." });
        }

        const { firstName, lastName, phone, bio } = req.body;
        const updateData = {};
        if (firstName !== undefined) updateData.firstName = firstName.trim();
        if (lastName !== undefined) updateData.lastName = lastName.trim();
        if (phone !== undefined) updateData.phone = phone.trim();
        if (bio !== undefined) updateData.bio = bio;

        const updated = await Employee.findByIdAndUpdate(employee._id, updateData, { new: true });

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            profile: {
                ...updated.toObject(),
                role: req.user?.role || "EMPLOYEE",
            },
        });
    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({ error: "Failed to update profile." });
    }
};
