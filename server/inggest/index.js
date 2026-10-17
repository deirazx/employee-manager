import { Inngest } from "inngest";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

// Create a client to send and receive events
export const inngest = new Inngest({
    id: "fullstack-ems",
});

const autoCheckOut = inngest.createFunction(
    { id: "auto-check-out", event: "employee/checkout-late" },
    async ({ event, step }) => {
        const { employeeId, attendanceId } = event.data;

        // Wait for 9 hours
        await step.sleepUntil("wait-for-the-9-hours", new Date(Date.now() + 9 * 60 * 60 * 1000));

        let attendance = await Attendance.findById(attendanceId);

        if (!attendance?.checkOut) {
            // get Employee data
            const employee = await Employee.findById(employeeId);

            // Send reminder email

            // After 10 hours, mark attendance as checked out with status "LATE"
            await step.sleepUntil("wait-for-the-1-hour", new Date(Date.now() + 1 * 60 * 60 * 1000));

            attendance = await Attendance.findById(attendanceId);
            if (!attendance?.checkOut) {
                attendance.checkOut = new Date(new Date(attendance.checkIn).getTime() + 4 * 60 * 60 * 1000);
                attendance.workingHours = "4 hrs";
                attendance.dayType = "Half Day";
                attendance.status = "LATE";
                await attendance.save();
            }
        }
    },
);

// Create an empty array where we'll export future Inngest functions
export const functions = [autoCheckOut];