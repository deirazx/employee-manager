import "dotenv/config";
import { ConnectDb } from "./config/db.js";
import User from "./models/User.js";
import bcrypt from "bcrypt";

const TempPass = process.env.ADMIN_PASSWORD || "admin123";

async function registerAdmin() {
    try {
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
        if (!ADMIN_EMAIL) {
            console.error("Missing ADMIN_EMAIL environment variable");
            process.exit(1);
        }

        await ConnectDb();

        const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
        if (existingAdmin) {
            console.log("Admin already exists with role:", existingAdmin.role);
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(TempPass, 10);
        await User.create({
            email: ADMIN_EMAIL,
            password: hashedPassword,
            role: "ADMIN"
        });

        console.log("Admin user created successfully");
        console.log("\nEmail:", ADMIN_EMAIL);
        console.log("Password:", TempPass);
        console.log("\nPlease change the password after your initial login.\n");

        process.exit(0);
    } catch (error) {
        console.error("Seed failed:", error);
        process.exit(1);
    }
}

registerAdmin();