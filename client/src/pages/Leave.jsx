import React, { useEffect, useState } from 'react'
import {
  Calendar,
  Clock,
  Check,
  X,
  Search,
  Mail,
  Phone,
  User,
  Plus,
  CheckCircle2,
  XCircle,
  FileText,
  Thermometer,
  Umbrella,
  Palmtree,
  Clock3,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import api from '../api/axios'

const Leave = () => {
  const { user, loading: authLoading } = useSelector((state) => state.auth)
  const role = (user?.role_type || user?.role || 'employee').toLowerCase()
  const isAdmin = role === 'admin'

  const [leaves, setLeaves] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    type: 'CASUAL',
    startDate: '',
    endDate: '',
    reason: '',
  })

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const d = new Date(dateString)
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  const calculateDays = (start, end) => {
    if (!start || !end) return 1
    try {
      const s = new Date(start)
      const e = new Date(end)
      const diff = Math.abs(e - s)
      return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1
    } catch {
      return 1
    }
  }

  const fetchLeaves = async () => {
    try {
      setDataLoading(true)
      const res = await api.get('/leaves')
      setLeaves(res.data?.data || [])
    } catch (error) {
      console.error('Fetch leaves error:', error)
      toast.error(error.response?.data?.error || 'Failed to fetch leave applications')
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      fetchLeaves()
    }
  }, [authLoading, user])

  const handleApproveLeave = async (leaveId) => {
    try {
      setActionLoadingId(leaveId)
      await api.patch(`/leaves/${leaveId}`, { status: 'APPROVED' })
      toast.success('Leave request approved successfully!')
      fetchLeaves()
    } catch (error) {
      console.error('Approve error:', error)
      toast.error(error.response?.data?.error || 'Failed to approve leave')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDenyLeave = async (leaveId) => {
    try {
      setActionLoadingId(leaveId)
      await api.patch(`/leaves/${leaveId}`, { status: 'REJECTED' })
      toast.error('Leave request denied')
      fetchLeaves()
    } catch (error) {
      console.error('Deny error:', error)
      toast.error(error.response?.data?.error || 'Failed to deny leave')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleApplyLeave = async (e) => {
    e.preventDefault()

    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error('End date cannot be earlier than start date')
      return
    }

    try {
      setIsSubmitting(true)
      await api.post('/leaves', {
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason.trim(),
      })

      toast.success('Leave application submitted for approval!')
      setIsModalOpen(false)
      setFormData({ type: 'CASUAL', startDate: '', endDate: '', reason: '' })
      fetchLeaves()
    } catch (error) {
      console.error('Apply leave error:', error)
      toast.error(error.response?.data?.error || 'Failed to submit leave application')
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayedLeaves = leaves.filter((item) => {
    const query = searchQuery.toLowerCase()
    const empName = (item.employeeName || item.employee || '').toLowerCase()
    const empEmail = (item.employeeEmail || '').toLowerCase()
    const reasonText = (item.reason || '').toLowerCase()

    const matchesSearch =
      !query ||
      empName.includes(query) ||
      empEmail.includes(query) ||
      reasonText.includes(query)

    const matchesStatus =
      statusFilter === 'ALL' || item.status === statusFilter

    const matchesType =
      typeFilter === 'ALL' || item.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            APPROVED
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-md bg-rose-50 text-rose-700 border border-rose-200 tracking-wider">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            REJECTED
          </span>
        )
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200 tracking-wider">
            <Clock3 className="w-3.5 h-3.5 text-amber-600" />
            PENDING
          </span>
        )
    }
  }

  const totalApplications = leaves.length
  const pendingCount = leaves.filter((l) => l.status === 'PENDING').length
  const approvedCount = leaves.filter((l) => l.status === 'APPROVED').length
  const rejectedCount = leaves.filter((l) => l.status === 'REJECTED').length

  const sickTaken = leaves.filter(
    (l) => l.type === 'SICK' && l.status === 'APPROVED'
  ).length
  const casualTaken = leaves.filter(
    (l) => l.type === 'CASUAL' && l.status === 'APPROVED'
  ).length
  const annualTaken = leaves.filter(
    (l) => l.type === 'ANNUAL' && l.status === 'APPROVED'
  ).length

  if (authLoading || (dataLoading && leaves.length === 0)) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse pb-20">
        <div>
          <div className="h-8 bg-slate-200 rounded-lg w-48 mb-2" />
          <div className="h-4 bg-slate-200/70 rounded w-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 p-5" />
          ))}
        </div>
        <div className="h-96 bg-white rounded-xl border border-slate-200" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {isAdmin ? 'Leave Management' : 'My Leave Requests'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin
              ? 'Review, approve, or deny employee leave applications'
              : 'Track your leave balance and apply for time off'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchLeaves}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {!isAdmin && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition duration-150 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Applications</p>
              <p className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                {totalApplications}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Pending Review</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-2xl font-bold text-amber-600 tracking-tight">
                  {pendingCount}
                </p>
                {pendingCount > 0 && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                  </span>
                )}
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/60">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Approved Leaves</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1 tracking-tight">
                {approvedCount}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/60">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Denied Leaves</p>
              <p className="text-2xl font-bold text-rose-600 mt-1 tracking-tight">
                {rejectedCount}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100/60">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100/60 flex items-center justify-center text-rose-600 shrink-0">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Sick Leave</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-bold text-slate-900 tracking-tight">
                  {sickTaken}
                </span>
                <span className="text-xs text-slate-400 font-medium">taken</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100/60 flex items-center justify-center text-amber-600 shrink-0">
              <Umbrella className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Casual Leave</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-bold text-slate-900 tracking-tight">
                  {casualTaken}
                </span>
                <span className="text-xs text-slate-400 font-medium">taken</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100/60 flex items-center justify-center text-indigo-600 shrink-0">
              <Palmtree className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Annual Leave</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-bold text-slate-900 tracking-tight">
                  {annualTaken}
                </span>
                <span className="text-xs text-slate-400 font-medium">taken</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-6 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Employee name, email, or reason..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending Only</option>
              <option value="APPROVED">Approved Only</option>
              <option value="REJECTED">Denied Only</option>
            </select>
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Leave Types</option>
              <option value="CASUAL">Casual Leave</option>
              <option value="SICK">Sick Leave</option>
              <option value="ANNUAL">Annual Leave</option>
              <option value="MATERNITY">Maternity Leave</option>
              <option value="PATERNITY">Paternity Leave</option>
            </select>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            {isAdmin ? 'Employee Leave Applications' : 'Leave History'}
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Showing {displayedLeaves.length}{' '}
            {displayedLeaves.length === 1 ? 'application' : 'applications'}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {isAdmin && (
                    <>
                      <th className="py-3.5 px-6 text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                        EMPLOYEE
                      </th>
                      <th className="py-3.5 px-6 text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                        CONTACT
                      </th>
                    </>
                  )}
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                    TYPE
                  </th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                    DURATION & DATES
                  </th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                    REASON
                  </th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                    STATUS
                  </th>
                  {isAdmin && (
                    <th className="py-3.5 px-6 text-[11px] font-bold text-slate-500 tracking-wider uppercase text-right">
                      ACTIONS
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {displayedLeaves.length > 0 ? (
                  displayedLeaves.map((item) => {
                    const empName = item.employeeName || item.employee || 'Employee'
                    const initials = empName
                      ? empName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      : 'EM'

                    const daysCount =
                      item.daysCount || calculateDays(item.startDate, item.endDate)

                    const isUpdating = actionLoadingId === (item._id || item.id)

                    return (
                      <tr
                        key={item._id || item.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        {isAdmin && (
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0">
                                {initials}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 leading-tight">
                                  {empName}
                                </p>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  {item.role || 'Employee'} •{' '}
                                  <span className="text-slate-600 font-medium">
                                    {item.department || 'General'}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </td>
                        )}

                        {isAdmin && (
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="space-y-1">
                              {item.employeeEmail && (
                                <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{item.employeeEmail}</span>
                                </div>
                              )}
                              {item.employeePhone && (
                                <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{item.employeePhone}</span>
                                </div>
                              )}
                            </div>
                          </td>
                        )}

                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className="inline-block px-2.5 py-1 text-[11px] font-semibold rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            {item.type}
                          </span>
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap">
                          <p className="font-semibold text-slate-900">
                            {formatDate(item.startDate)} – {formatDate(item.endDate)}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {daysCount} {daysCount === 1 ? 'day' : 'days'} total
                          </p>
                        </td>

                        <td className="py-4 px-6 text-slate-700 max-w-xs">
                          <p className="line-clamp-2">{item.reason}</p>
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap">
                          {renderStatusBadge(item.status)}
                        </td>

                        {isAdmin && (
                          <td className="py-4 px-6 whitespace-nowrap text-right">
                            {item.status === 'PENDING' ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() =>
                                    handleApproveLeave(item._id || item.id)
                                  }
                                  title="Approve Leave"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold text-xs transition shadow-2xs cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() =>
                                    handleDenyLeave(item._id || item.id)
                                  }
                                  title="Deny Leave"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 disabled:opacity-60 text-rose-700 border border-rose-200 font-semibold text-xs transition cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Deny</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs italic">
                                Action taken ({item.status?.toLowerCase()})
                              </span>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={isAdmin ? 7 : 4}
                      className="py-12 text-center text-slate-500"
                    >
                      <User className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700 text-sm">
                        No leave applications found
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isAdmin
                          ? 'No leave requests match your search or filters.'
                          : 'You have not submitted any leave requests yet.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 z-10">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-bold text-slate-900">
                Apply for Leave
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Leave Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer bg-white"
                >
                  <option value="CASUAL">Casual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="ANNUAL">Annual Leave</option>
                  <option value="MATERNITY">Maternity Leave</option>
                  <option value="PATERNITY">Paternity Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Leave *
                </label>
                <textarea
                  rows="3"
                  required
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  placeholder="Explain why you are taking leave..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
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
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg shadow-sm transition cursor-pointer"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Leave