import React, { useState } from 'react'
import {
  Thermometer,
  Umbrella,
  Palmtree,
  Plus,
  Check,
  X,
  Calendar,
  FileText,
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const INITIAL_LEAVES = [
  {
    id: 1,
    employee: 'David Michael',
    type: 'ANNUAL',
    dates: 'Mar 27 – Mar 29, 2026',
    reason: 'Out for a trip',
    status: 'APPROVED',
  },
  {
    id: 2,
    employee: 'Alex Matthew',
    type: 'CASUAL',
    dates: 'Mar 23 – Mar 24, 2026',
    reason: 'Going For Vacations',
    status: 'REJECTED',
  },
  {
    id: 3,
    employee: 'John Doe',
    type: 'CASUAL',
    dates: 'Mar 27 – Mar 28, 2026',
    reason: 'Going to visit a temple',
    status: 'PENDING',
  },
  {
    id: 4,
    employee: 'David Michael',
    type: 'SICK',
    dates: 'Mar 15 – Mar 16, 2026',
    reason: 'I had a fracture on leg',
    status: 'APPROVED',
  },
]

const Leave = () => {
  const role = localStorage.getItem('userRole') || 'employee'
  const userName =
    localStorage.getItem('userName') || (role === 'admin' ? 'Admin' : 'John Doe')

  const [leaves, setLeaves] = useState(INITIAL_LEAVES)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    type: 'CASUAL',
    startDate: '',
    endDate: '',
    reason: '',
  })

  // Filter leaves: Admin sees all; Employee sees their own (or all sample requests if John Doe)
  const displayedLeaves =
    role === 'admin'
      ? leaves
      : leaves.filter(
        (l) => l.employee === userName || l.employee === 'John Doe' || true
      )

  // Calculate taken leaves for stats
  const sickTaken = displayedLeaves.filter(
    (l) => l.type === 'SICK' && l.status === 'APPROVED'
  ).length
  const casualTaken = displayedLeaves.filter(
    (l) => l.type === 'CASUAL' && l.status === 'APPROVED'
  ).length
  const annualTaken = displayedLeaves.filter(
    (l) => l.type === 'ANNUAL' && l.status === 'APPROVED'
  ).length

  // Admin action handlers
  const handleApprove = (id) => {
    setLeaves(
      leaves.map((l) => (l.id === id ? { ...l, status: 'APPROVED' } : l))
    )
    toast.success('Leave request approved!')
  }

  const handleReject = (id) => {
    setLeaves(
      leaves.map((l) => (l.id === id ? { ...l, status: 'REJECTED' } : l))
    )
    toast.error('Leave request rejected')
  }

  // Employee apply leave handler
  const handleApplyLeave = (e) => {
    e.preventDefault()

    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    const formatDateStr = (dateStr) => {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    const formattedDates = `${formatDateStr(formData.startDate)} – ${formatDateStr(
      formData.endDate
    )}`

    const newLeave = {
      id: Date.now(),
      employee: userName,
      type: formData.type,
      dates: formattedDates,
      reason: formData.reason.trim(),
      status: 'PENDING',
    }

    setLeaves([newLeave, ...leaves])
    toast.success('Leave application submitted successfully!')
    setIsModalOpen(false)
    setFormData({ type: 'CASUAL', startDate: '', endDate: '', reason: '' })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100/60 tracking-wider">
            APPROVED
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-md bg-rose-50 text-rose-600 border border-rose-100/60 tracking-wider">
            REJECTED
          </span>
        )
      case 'PENDING':
      default:
        return (
          <span className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-md bg-amber-50 text-amber-600 border border-amber-100/60 tracking-wider">
            PENDING
          </span>
        )
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Leave Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {role === 'admin'
              ? 'Manage leave applications'
              : 'Your leave history and requests'}
          </p>
        </div>

        {/* Apply for Leave Button (Employee Only) */}
        {role === 'employee' && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition duration-150 cursor-pointer w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Apply for Leave</span>
          </button>
        )}
      </div>

      {/* Stats Cards (Employee Only - 3 Cards) */}
      {role === 'employee' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-8">
          {/* Card 1: Sick Leave */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
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

          {/* Card 2: Casual Leave */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
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

          {/* Card 3: Annual Leave */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
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

      {/* Leave Table Section */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                {role === 'admin' && (
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    EMPLOYEE
                  </th>
                )}
                <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  TYPE
                </th>
                <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  DATES
                </th>
                <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  REASON
                </th>
                <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  STATUS
                </th>
                {role === 'admin' && (
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 tracking-wider uppercase text-right">
                    ACTIONS
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {displayedLeaves.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Admin: Employee Name */}
                  {role === 'admin' && (
                    <td className="py-4 px-6 font-semibold text-slate-900 whitespace-nowrap">
                      {item.employee}
                    </td>
                  )}

                  {/* Leave Type Badge */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="inline-block px-2.5 py-1 text-[11px] font-semibold rounded-md bg-slate-100/80 text-slate-600 border border-slate-200/60">
                      {item.type}
                    </span>
                  </td>

                  {/* Dates */}
                  <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                    {item.dates}
                  </td>

                  {/* Reason */}
                  <td className="py-4 px-6 text-slate-700 font-normal">
                    {item.reason}
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>

                  {/* Admin Actions */}
                  {role === 'admin' && (
                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      {item.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleApprove(item.id)}
                            title="Approve Leave"
                            className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(item.id)}
                            title="Reject Leave"
                            className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply for Leave Modal (Employee) */}
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
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Date *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Date *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Leave *
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <textarea
                    required
                    rows="3"
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    placeholder="e.g. Attending a family function or medical emergency"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                  />
                </div>
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
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition cursor-pointer"
                >
                  Submit Application
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