import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({ error: "Access denied. No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found or session expired." });
        }

        req.user = user;
        next();

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token has expired. Please login again." });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token. Authentication failed." });
        }

        console.error("Auth Middleware Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const protectAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized! Please login first" });
        }

        if (req.user.role?.toUpperCase() !== "ADMIN") {
            return res.status(403).json({ error: "Forbidden! Admin access required" });
        }

        next()
    } catch (error) {
        // Server console par error trace print karein debug karne ke liye
        console.error("Admin Authorization Error:", error);

        // Client ko clean error response bhejein
        return res.status(500).json({
            error: "Internal server error during authorization check"
        });
    }
}