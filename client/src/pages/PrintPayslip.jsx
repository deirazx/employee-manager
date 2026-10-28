import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer, Building2, CheckCircle2, Loader2 } from 'lucide-react'
import api from '../api/axios'
import { INITIAL_PAYSLIPS } from '../constants/payslips'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const PrintPayslip = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [payslip, setPayslip] = useState(null)

  useEffect(() => {
    const fetchPayslip = async () => {
      try {
        setLoading(true)
        const res = await api.get(`/payslips/${id}`)
        if (res.data?.data) {
          setPayslip(res.data.data)
        }
      } catch (err) {
        console.warn('API payslip fetch failed, falling back to initial dataset:', err)
        const matched = INITIAL_PAYSLIPS.find((p) => p.id === id || p._id === id) || INITIAL_PAYSLIPS[0]
        setPayslip(matched)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPayslip()
    }
  }, [id])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-slate-600 font-medium">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span>Loading payslip voucher...</span>
        </div>
      </div>
    )
  }

  // Normalize details
  const emp = payslip?.employee || {}
  const employeeName =
    typeof emp === 'object' && (emp.firstName || emp.lastName)
      ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim()
      : payslip?.employee || 'Employee'

  const designation = emp.position || payslip?.role || 'Staff Member'
  const department = emp.department || payslip?.department || 'Engineering'

  const period =
    payslip?.month && payslip?.year
      ? `${MONTH_NAMES[payslip.month - 1]} ${payslip.year}`
      : payslip?.period || 'Current Period'

  const basicSalary =
    typeof payslip?.basicSalary === 'number'
      ? `$${payslip.basicSalary.toLocaleString()}`
      : payslip?.basicSalary || '$0'

  const allowances =
    typeof payslip?.allowances === 'number'
      ? `$${payslip.allowances.toLocaleString()}`
      : payslip?.allowances || '$0'

  const deductions =
    typeof payslip?.deductions === 'number'
      ? `$${payslip.deductions.toLocaleString()}`
      : payslip?.deductions || '$0'

  const netSalary =
    typeof payslip?.netSalary === 'number'
      ? `$${payslip.netSalary.toLocaleString()}`
      : payslip?.netSalary || '$0'

  const slipRef = payslip?._id || payslip?.id || id

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
            <p className="text-xs text-slate-500 font-mono">Ref: {slipRef}</p>
          </div>
        </div>

        {/* Employee & Pay Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100 text-xs">
          <div>
            <p className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              Employee Name
            </p>
            <p className="font-bold text-slate-900 mt-1 text-sm">{employeeName}</p>
          </div>
          <div>
            <p className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              Designation
            </p>
            <p className="font-medium text-slate-800 mt-1">{designation}</p>
          </div>
          <div>
            <p className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              Department
            </p>
            <p className="font-medium text-slate-800 mt-1">{department}</p>
          </div>
          <div>
            <p className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              Pay Period
            </p>
            <p className="font-bold text-indigo-600 mt-1">{period}</p>
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
                  <span className="font-semibold text-slate-900">{basicSalary}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Allowances (HRA / Special)</span>
                  <span className="font-semibold text-slate-900">{allowances}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-slate-100 text-slate-900">
                  <span>Total Earnings</span>
                  <span>
                    $
                    {(
                      (Number(payslip?.basicSalary) || 0) + (Number(payslip?.allowances) || 0)
                    ).toLocaleString()}
                  </span>
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
                  <span className="text-slate-600">Tax / PF / Other Deductions</span>
                  <span className="font-semibold text-slate-900">{deductions}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Unpaid Leave Deductions</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-slate-100 text-rose-600">
                  <span>Total Deductions</span>
                  <span>-{deductions}</span>
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
            {netSalary}
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
