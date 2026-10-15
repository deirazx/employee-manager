import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Download, X, DollarSign, Calendar, User } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { INITIAL_PAYSLIPS } from '../constants/payslips'

const Payslips = () => {
  const navigate = useNavigate()
  const [payslips, setPayslips] = useState(() => {
    const saved = localStorage.getItem('payslips_data')
    return saved ? JSON.parse(saved) : INITIAL_PAYSLIPS
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    employee: 'David Michael',
    period: 'March 2026',
    basicSalary: 2000,
    allowances: 250,
    deductions: 100,
  })

  const handleDownload = (id) => {
    navigate(`/print/payslips/${id}`)
  }

  const handleGeneratePayslip = (e) => {
    e.preventDefault()

    const basic = Number(formData.basicSalary) || 0
    const allow = Number(formData.allowances) || 0
    const deduct = Number(formData.deductions) || 0
    const net = basic + allow - deduct

    const newPayslip = {
      id: `PAY-${Date.now().toString().slice(-6)}`,
      employee: formData.employee,
      period: formData.period,
      basicSalary: `$${basic.toLocaleString()}`,
      netSalary: `$${net.toLocaleString()}`,
      allowances: `$${allow.toLocaleString()}`,
      deductions: `$${deduct.toLocaleString()}`,
      department:
        formData.employee === 'David Michael'
          ? 'IT Support'
          : 'Engineering',
      role:
        formData.employee === 'David Michael'
          ? 'Associate Business Support'
          : formData.employee === 'John Doe'
          ? 'Senior Software Developer'
          : 'Software Developer',
    }

    const updated = [newPayslip, ...payslips]
    setPayslips(updated)
    localStorage.setItem('payslips_data', JSON.stringify(updated))
    toast.success(`Payslip generated for ${formData.employee}!`)
    setIsModalOpen(false)
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Payslips
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate and manage employee payslips
          </p>
        </div>

        {/* Generate Payslip Button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition duration-150 cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Payslip</span>
        </button>
      </div>

      {/* Payslips Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  EMPLOYEE
                </th>
                <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  PERIOD
                </th>
                <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  BASIC SALARY
                </th>
                <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  NET SALARY
                </th>
                <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 tracking-wider uppercase text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {payslips.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Employee Name */}
                  <td className="py-4 px-6 font-semibold text-slate-900 whitespace-nowrap">
                    {item.employee}
                  </td>

                  {/* Period */}
                  <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                    {item.period}
                  </td>

                  {/* Basic Salary */}
                  <td className="py-4 px-6 text-slate-700 font-medium whitespace-nowrap">
                    {item.basicSalary}
                  </td>

                  {/* Net Salary */}
                  <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                    {item.netSalary}
                  </td>

                  {/* Download Action */}
                  <td className="py-4 px-6 whitespace-nowrap text-right">
                    <button
                      type="button"
                      onClick={() => handleDownload(item.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50/80 hover:bg-indigo-100/90 border border-indigo-200/50 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Payslip Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 z-10">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-bold text-slate-900">
                Generate New Payslip
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGeneratePayslip} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Employee *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <select
                    value={formData.employee}
                    onChange={(e) =>
                      setFormData({ ...formData, employee: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer bg-white"
                  >
                    <option value="David Michael">David Michael</option>
                    <option value="Alex Matthew">Alex Matthew</option>
                    <option value="John Doe">John Doe</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pay Period *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={formData.period}
                    onChange={(e) =>
                      setFormData({ ...formData, period: e.target.value })
                    }
                    placeholder="e.g. March 2026"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Basic ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.basicSalary}
                    onChange={(e) =>
                      setFormData({ ...formData, basicSalary: e.target.value })
                    }
                    className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Allowances ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.allowances}
                    onChange={(e) =>
                      setFormData({ ...formData, allowances: e.target.value })
                    }
                    className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Deductions ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.deductions}
                    onChange={(e) =>
                      setFormData({ ...formData, deductions: e.target.value })
                    }
                    className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Total preview */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Calculated Net Pay:</span>
                <span className="font-bold text-slate-900 text-sm">
                  $
                  {(
                    (Number(formData.basicSalary) || 0) +
                    (Number(formData.allowances) || 0) -
                    (Number(formData.deductions) || 0)
                  ).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition cursor-pointer flex items-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Create Payslip</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Payslips