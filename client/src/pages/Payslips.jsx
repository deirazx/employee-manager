import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Plus,
  Printer,
  Download,
  X,
  DollarSign,
  Calendar,
  User,
  Search,
  Filter,
  RefreshCw,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  TrendingUp,
  Eye,
  Briefcase,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../api/axios'
import { DEPARTMENTS } from '../constants/departments'

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

const Payslips = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useSelector((state) => state.auth)
  const role = (user?.role_type || user?.role || 'employee').toLowerCase()
  const isAdmin = role === 'admin'

  // Data states
  const [payslips, setPayslips] = useState([])
  const [employees, setEmployees] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('ALL')
  const [selectedYear, setSelectedYear] = useState('ALL')
  const [selectedDept, setSelectedDept] = useState('All Departments')

  // Generate Payslip Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    employeeId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: '',
    allowances: '',
    deductions: '',
  })

  // Quick View Modal
  const [viewPayslip, setViewPayslip] = useState(null)

  // Fetch Payslips from Backend
  const fetchPayslips = async () => {
    try {
      setDataLoading(true)
      const res = await api.get('/payslips')
      setPayslips(res.data?.data || [])
    } catch (error) {
      console.error('Fetch payslips error:', error)
      toast.error(error.response?.data?.message || 'Failed to fetch payslips')
    } finally {
      setDataLoading(false)
    }
  }

  // Fetch Employees for Admin dropdown
  const fetchEmployees = async () => {
    if (!isAdmin) return
    try {
      const res = await api.get('/employees')
      setEmployees(res.data || [])
    } catch (error) {
      console.error('Fetch employees error:', error)
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      fetchPayslips()
      if (isAdmin) {
        fetchEmployees()
      }
    }
  }, [authLoading, user, isAdmin])

  // When Admin selects an employee in Generate modal, auto-fill salary details
  const handleEmployeeChange = (empId) => {
    const selected = employees.find((e) => e._id === empId || e.id === empId)
    setFormData((prev) => ({
      ...prev,
      employeeId: empId,
      basicSalary: selected ? selected.basicSalary ?? '' : '',
      allowances: selected ? selected.allowances ?? 0 : 0,
      deductions: selected ? selected.deductions ?? 0 : 0,
    }))
  }

  // Open Generate Modal and preselect first employee if available
  const handleOpenGenerateModal = () => {
    const firstEmp = employees[0]
    setFormData({
      employeeId: firstEmp ? firstEmp._id : '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      basicSalary: firstEmp ? firstEmp.basicSalary ?? '' : '',
      allowances: firstEmp ? firstEmp.allowances ?? 0 : 0,
      deductions: firstEmp ? firstEmp.deductions ?? 0 : 0,
    })
    setIsModalOpen(true)
  }

  // Generate Payslip Form Submit
  const handleGeneratePayslip = async (e) => {
    e.preventDefault()

    if (!formData.employeeId) {
      toast.error('Please select an employee')
      return
    }

    if (formData.basicSalary === '' || Number(formData.basicSalary) < 0) {
      toast.error('Please enter a valid basic salary')
      return
    }

    const basic = Number(formData.basicSalary) || 0
    const allow = Number(formData.allowances) || 0
    const deduct = Number(formData.deductions) || 0

    if (basic + allow - deduct < 0) {
      toast.error('Deductions cannot exceed total earnings (Basic + Allowances)')
      return
    }

    try {
      setIsSubmitting(true)
      const payload = {
        employeeId: formData.employeeId,
        month: Number(formData.month),
        year: Number(formData.year),
        basicSalary: basic,
        allowances: allow,
        deductions: deduct,
      }

      const res = await api.post('/payslips', payload)
      if (res.data?.success) {
        toast.success('Payslip generated successfully!')
        setIsModalOpen(false)
        fetchPayslips()
      }
    } catch (error) {
      console.error('Create payslip error:', error)
      const msg = error.response?.data?.message || 'Failed to create payslip'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Navigate to Print/Download voucher page
  const handleDownload = (id) => {
    navigate(`/print/payslips/${id}`)
  }

  // Filtered Payslips calculation
  const filteredPayslips = useMemo(() => {
    return payslips.filter((slip) => {
      const emp = slip.employee || {}
      const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim()
      const empRole = emp.position || ''
      const empDept = emp.department || ''
      const empEmail = emp.email || ''
      const periodStr = `${MONTH_NAMES[(slip.month || 1) - 1]} ${slip.year || ''}`

      // Search matching
      const matchesSearch =
        searchQuery === '' ||
        fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        empRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        empDept.toLowerCase().includes(searchQuery.toLowerCase()) ||
        empEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        periodStr.toLowerCase().includes(searchQuery.toLowerCase())

      // Month filter
      const matchesMonth =
        selectedMonth === 'ALL' || Number(slip.month) === Number(selectedMonth)

      // Year filter
      const matchesYear =
        selectedYear === 'ALL' || Number(slip.year) === Number(selectedYear)

      // Department filter
      const matchesDept =
        selectedDept === 'All Departments' || empDept === selectedDept

      return matchesSearch && matchesMonth && matchesYear && matchesDept
    })
  }, [payslips, searchQuery, selectedMonth, selectedYear, selectedDept])

  // Dynamic Metrics & Stats
  const stats = useMemo(() => {
    const totalCount = payslips.length
    const totalDisbursed = payslips.reduce(
      (sum, p) => sum + (Number(p.netSalary) || 0),
      0
    )
    const avgSalary = totalCount > 0 ? Math.round(totalDisbursed / totalCount) : 0

    // Latest payslip
    const latest = payslips[0]
    const latestPeriod = latest
      ? `${MONTH_NAMES[(latest.month || 1) - 1]?.slice(0, 3)} ${latest.year}`
      : 'N/A'

    return {
      totalCount,
      totalDisbursed,
      avgSalary,
      latestPeriod,
    }
  }, [payslips])

  // Unique years present in payslips for the year filter dropdown
  const availableYears = useMemo(() => {
    const years = new Set([
      new Date().getFullYear(),
      new Date().getFullYear() - 1,
      new Date().getFullYear() + 1,
    ])
    payslips.forEach((p) => {
      if (p.year) years.add(Number(p.year))
    })
    return Array.from(years).sort((a, b) => b - a)
  }, [payslips])

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Payslips
            </h1>
            <span
              className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                isAdmin
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {isAdmin ? 'Admin View' : 'Employee View'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin
              ? 'Issue, review, and manage monthly compensation and employee vouchers'
              : 'View, track, and download your monthly compensation slips'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchPayslips}
            disabled={dataLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition disabled:opacity-50 cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${dataLoading ? 'animate-spin text-indigo-600' : ''}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Generate Payslip Button (Admin only) */}
          {isAdmin && (
            <button
              type="button"
              onClick={handleOpenGenerateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition duration-150 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Payslip</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">
              {isAdmin ? 'Total Disbursed' : 'Total Earnings'}
            </p>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            ${stats.totalDisbursed.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Across all issued payslips</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">
              {isAdmin ? 'Total Payslips' : 'My Payslips'}
            </p>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            {stats.totalCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Generated payroll vouchers</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">
              {isAdmin ? 'Average Net Payout' : 'Latest Net Salary'}
            </p>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            $
            {isAdmin
              ? stats.avgSalary.toLocaleString()
              : payslips[0]?.netSalary
              ? Number(payslips[0].netSalary).toLocaleString()
              : '0'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {isAdmin ? 'Per employee payslip' : 'Most recent period'}
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Latest Cycle</p>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            {stats.latestPeriod}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Latest payroll disbursed</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, role, dept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          {/* Month Filter */}
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
            >
              <option value="ALL">All Months</option>
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
            >
              <option value="ALL">All Years</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter (Admin) or Reset */}
          {isAdmin ? (
            <div className="relative">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center">
              {(searchQuery || selectedMonth !== 'ALL' || selectedYear !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedMonth('ALL')
                    setSelectedYear('ALL')
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Clear Filters indicator for Admin */}
        {isAdmin &&
          (searchQuery ||
            selectedMonth !== 'ALL' ||
            selectedYear !== 'ALL' ||
            selectedDept !== 'All Departments') && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
              <span>Showing {filteredPayslips.length} filtered results</span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedMonth('ALL')
                  setSelectedYear('ALL')
                  setSelectedDept('All Departments')
                }}
                className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
              >
                Reset all filters
              </button>
            </div>
          )}
      </div>

      {/* Payslips Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {dataLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium">Loading payslip records...</p>
          </div>
        ) : filteredPayslips.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">No payslips found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {isAdmin
                ? 'No payslips match your search or filter parameters. Click "Generate Payslip" to create one.'
                : 'No payslip records have been generated for your account yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    EMPLOYEE
                  </th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    PAY PERIOD
                  </th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    BASIC SALARY
                  </th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    ALLOWANCES / DEDUCTIONS
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
                {filteredPayslips.map((item) => {
                  const emp = item.employee || {}
                  const fullName =
                    `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee'
                  const period = `${MONTH_NAMES[(item.month || 1) - 1]} ${item.year}`
                  const slipId = item._id || item.id

                  return (
                    <tr key={slipId} className="hover:bg-slate-50/70 transition-colors">
                      {/* Employee Info */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-2xs">
                            {emp.firstName ? emp.firstName[0] : 'E'}
                            {emp.lastName ? emp.lastName[0] : ''}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 leading-tight">
                              {fullName}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-slate-500">
                                {emp.position || 'Staff Member'}
                              </span>
                              {emp.department && (
                                <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                  {emp.department}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Period */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{period}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                          Ref: {String(slipId).slice(-6).toUpperCase()}
                        </span>
                      </td>

                      {/* Basic Salary */}
                      <td className="py-4 px-6 text-slate-700 font-medium whitespace-nowrap">
                        ${Number(item.basicSalary || 0).toLocaleString()}
                      </td>

                      {/* Allowances / Deductions */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-xs space-y-0.5">
                          <span className="text-emerald-600 font-medium block">
                            +${Number(item.allowances || 0).toLocaleString()} Allowances
                          </span>
                          <span className="text-rose-500 font-medium block">
                            -${Number(item.deductions || 0).toLocaleString()} Deductions
                          </span>
                        </div>
                      </td>

                      {/* Net Salary */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-bold text-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>${Number(item.netSalary || 0).toLocaleString()}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-2">
                          {/* Quick View Button */}
                          <button
                            type="button"
                            onClick={() => setViewPayslip(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                            title="Quick View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Print / Download Button */}
                          <button
                            type="button"
                            onClick={() => handleDownload(slipId)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50/80 hover:bg-indigo-100/90 border border-indigo-200/50 transition cursor-pointer shadow-2xs"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Voucher</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* GENERATE PAYSLIP MODAL (Admin Only) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border border-slate-200 z-10 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Generate Employee Payslip
                  </h3>
                  <p className="text-xs text-slate-500">
                    Create and issue an official monthly salary slip
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGeneratePayslip} className="space-y-4">
              {/* Select Employee */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Employee <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <select
                    required
                    value={formData.employeeId}
                    onChange={(e) => handleEmployeeChange(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer bg-white"
                  >
                    <option value="" disabled>
                      -- Choose an employee --
                    </option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.firstName} {emp.lastName} ({emp.position || 'Staff'} •{' '}
                        {emp.department || 'Engineering'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pay Period: Month & Year */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Pay Month <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={formData.month}
                      onChange={(e) =>
                        setFormData({ ...formData, month: Number(e.target.value) })
                      }
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer bg-white"
                    >
                      {MONTH_NAMES.map((name, idx) => (
                        <option key={name} value={idx + 1}>
                          {name} ({idx + 1})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Pay Year <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max="2100"
                    required
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Earnings & Deductions Grid */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Basic Salary ($) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="e.g. 3000"
                    value={formData.basicSalary}
                    onChange={(e) =>
                      setFormData({ ...formData, basicSalary: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Allowances ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={formData.allowances}
                    onChange={(e) =>
                      setFormData({ ...formData, allowances: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Deductions ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={formData.deductions}
                    onChange={(e) =>
                      setFormData({ ...formData, deductions: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Live Net Pay Calculation Preview */}
              {(() => {
                const b = Number(formData.basicSalary) || 0
                const a = Number(formData.allowances) || 0
                const d = Number(formData.deductions) || 0
                const net = b + a - d
                const isInvalid = net < 0

                return (
                  <div
                    className={`p-3.5 rounded-xl border transition-colors ${
                      isInvalid
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : 'bg-indigo-50/60 border-indigo-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-600">
                        Total Earnings (Basic + Allowances):
                      </span>
                      <span className="font-semibold text-slate-900">
                        ${(b + a).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-medium text-slate-600">
                        Total Deductions:
                      </span>
                      <span className="font-semibold text-rose-600">
                        -${d.toLocaleString()}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                        Calculated Net Salary:
                      </span>
                      <span
                        className={`text-base font-extrabold ${
                          isInvalid ? 'text-rose-600' : 'text-indigo-900'
                        }`}
                      >
                        ${net.toLocaleString()}
                      </span>
                    </div>

                    {isInvalid && (
                      <p className="text-[11px] text-rose-600 mt-2 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        Deductions cannot exceed the total earnings
                      </p>
                    )}
                  </div>
                )
              })()}

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Generate Payslip</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK VIEW PAYSLIP MODAL */}
      {viewPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setViewPayslip(null)}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Payslip Details
                </h3>
                <p className="text-xs text-slate-500">
                  Ref: {viewPayslip._id || viewPayslip.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewPayslip(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Details */}
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900 text-sm">
                    {viewPayslip.employee?.firstName} {viewPayslip.employee?.lastName}
                  </p>
                  <p className="text-slate-500">
                    {viewPayslip.employee?.position || 'Staff'} •{' '}
                    {viewPayslip.employee?.department || 'Engineering'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 font-bold uppercase rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px]">
                    {MONTH_NAMES[(viewPayslip.month || 1) - 1]} {viewPayslip.year}
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                <div className="p-3 flex justify-between bg-slate-50/50">
                  <span className="text-slate-600">Basic Salary</span>
                  <span className="font-semibold text-slate-900">
                    ${Number(viewPayslip.basicSalary || 0).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-600">Allowances (HRA / Special)</span>
                  <span className="font-semibold text-emerald-600">
                    +${Number(viewPayslip.allowances || 0).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-600">Deductions (Tax / PF)</span>
                  <span className="font-semibold text-rose-600">
                    -${Number(viewPayslip.deductions || 0).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 flex justify-between bg-emerald-50/60 font-bold text-emerald-950">
                  <span>Net Disbursed Pay</span>
                  <span className="text-sm">
                    ${Number(viewPayslip.netSalary || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setViewPayslip(null)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = viewPayslip._id || viewPayslip.id
                    setViewPayslip(null)
                    navigate(`/print/payslips/${id}`)
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Voucher</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Payslips
