import mongoose from "mongoose";

const payslipSchema = new mongoose.Schema(
    {
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },
        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12,
        },
        year: {
            type: Number,
            required: true,
        },
        basicSalary: {
            type: Number,
            required: true,
            min: 0,
        },
        allowances: {
            type: Number,
            default: 0,
            min: 0,
        },
        deductions: {
            type: Number,
            default: 0,
            min: 0,
        },
        netSalary: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

// Compound unique index to prevent duplicate payslip generation for the same period
payslipSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

const Payslip = mongoose.model("Payslip", payslipSchema);
export default Payslip;