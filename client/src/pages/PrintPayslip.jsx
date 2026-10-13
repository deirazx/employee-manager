import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer, Building2, CheckCircle2 } from 'lucide-react'
import { INITIAL_PAYSLIPS } from '../constants/payslips'

const PrintPayslip = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  // Retrieve payslip data from localStorage or fallback to default dataset
  const savedData = localStorage.getItem('payslips_data')
  const allPayslips = savedData ? JSON.parse(savedData) : INITIAL_PAYSLIPS
  const item =
    allPayslips.find((p) => p.id === id) ||
    allPayslips[0] || {
      id: 'PAY-2026-02-01',
      employee: 'David Michael',
      period: 'February 2026',
      basicSalary: '$2,000',
      netSalary: '$2,180',
      department: 'IT Support',
      role: 'Associate Business Support',
      allowances: '$280',
      deductions: '$100',
    }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 print:bg-white print:p-0">
      {/* Top Action Bar (Hidden during printing) */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <button
          type="button"
          onClick={() => navigate('/payslips')}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Payslips</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition cursor-pointer shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Payslip Voucher Card */}
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 flex items-center justify-center text-white font-bold">
              <Building2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                QuickEMS Solutions Inc.
              </h1>
              <p className="text-xs text-slate-500">
                100 Enterprise Way, Silicon Valley, CA 94025
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60 tracking-wider mb-1">
              Salary Payslip
            </span>
            <p className="text-xs text-slate-500 font-mono">Ref: {item.id}</p>
          </div>
        </div>

        {/* Employee & Pay Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100 text-xs">
          <div>
            <p className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              Employee Name
            </p>
            <p className="font-bold text-slate-900 mt-1 text-sm">{item.employee}</p>
          </div>
          <div>
            <p className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              Designation
            </p>
            <p className="font-medium text-slate-800 mt-1">{item.role || 'Staff Member'}</p>
          </div>
          <div>
            <p className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              Department
            </p>
            <p className="font-medium text-slate-800 mt-1">{item.department || 'Operations'}</p>
          </div>
          <div>
            <p className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              Pay Period
            </p>
            <p className="font-bold text-indigo-600 mt-1">{item.period}</p>
          </div>
        </div>

        {/* Salary Breakdown (Earnings & Deductions) */}
        <div className="py-6 border-b border-slate-200">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Compensation Breakdown
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Earnings Table */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 font-semibold text-xs text-slate-700 border-b border-slate-200">
                Earnings
              </div>
              <div className="p-4 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Basic Salary</span>
                  <span className="font-semibold text-slate-900">{item.basicSalary}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">House Rent Allowance (HRA)</span>
                  <span className="font-semibold text-slate-900">
                    {item.allowances || '$180'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Special Allowances</span>
                  <span className="font-semibold text-slate-900">$100</span>
                </div>
              </div>
            </div>

            {/* Deductions Table */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 font-semibold text-xs text-slate-700 border-b border-slate-200">
                Deductions
              </div>
              <div className="p-4 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Provident Fund (PF)</span>
                  <span className="font-semibold text-slate-900">
                    {item.deductions || '$60'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Professional Tax (PT)</span>
                  <span className="font-semibold text-slate-900">$40</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>TDS / Income Tax</span>
                  <span>$0.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Net Salary Summary Box */}
        <div className="my-6 p-5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Net Salary Disbursed</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Transferred directly via Corporate Payroll account
            </p>
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-950 tracking-tight">
            {item.netSalary}
          </div>
        </div>

        {/* Authorization & Footer */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            <p className="font-medium text-slate-700">QuickEMS HR & Payroll System</p>
            <p className="text-[11px]">This document is computer generated and valid without signature.</p>
          </div>
          <div className="text-right">
            <div className="h-8 border-b border-dashed border-slate-300 w-36 mb-1" />
            <span className="text-[10px] uppercase font-semibold text-slate-500">
              Authorized Signatory
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrintPayslip