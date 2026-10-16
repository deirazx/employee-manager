import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Login for employee and admin
// POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password, role_type } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        if (role_type) {
            const normalizedRoleType = role_type.trim().toUpperCase();
            const userRole = (user.role || "").toUpperCase();

            if (normalizedRoleType !== userRole) {
                return res.status(403).json({ error: `Not authorized as ${role_type}` });
            }
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const payload = {
            userId: user._id.toString(),
            role: user.role,
            email: user.email
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

        const isProduction = process.env.NODE_ENV === "production";
        return res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        }).json({ user: payload, token });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Login failed" });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        // 1. Validation
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ error: "All fields are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }

        // 2. Auth check
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized! Please login" });
        }

        const userId = req.user._id || req.user.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 3. Old password verify karein bcrypt ke sath
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Incorrect old password" });
        }

        // 4. New password hash karke update karein
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: "Password updated successfully" });

    } catch (error) {
        console.error("Change password error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};