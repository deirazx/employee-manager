import React, { useEffect, useState } from 'react'
import {
  Calendar,
  Clock,
  AlertCircle,
  LogIn,
  LogOut,
  Search,
  Building2,
  Phone,
  Mail,
  User,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import api from '../api/axios'
import { DEPARTMENTS } from '../constants/departments'

const Attendance = () => {
  const { user, loading: authLoading } = useSelector((state) => state.auth)
  const role = (user?.role_type || user?.role || 'employee').toLowerCase()
  const isAdmin = role === 'admin'

  // Data states
  const [records, setRecords] = useState([])
  const [stats, setStats] = useState(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [isClocking, setIsClocking] = useState(false)
  const [todayRecord, setTodayRecord] = useState(null)

  // Filter states for Admin
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDept, setSelectedDept] = useState('All Departments')
  const [selectedDate, setSelectedDate] = useState('')

  // Time format helper (HH:MM AM/PM)
  const formatTime = (timeVal) => {
    if (!timeVal) return null
    try {
      const d = new Date(timeVal)
      if (isNaN(d.getTime())) return timeVal
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return timeVal
    }
  }

  // Date format helper (Oct 22, 2026)
  const formatDate = (dateVal) => {
    if (!dateVal) return 'N/A'
    try {
      const d = new Date(dateVal)
      if (isNaN(d.getTime())) return dateVal
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateVal
    }
  }

  // Fetch Attendance data from Backend API
  const fetchAttendance = async () => {
    try {
      setDataLoading(true)
      const params = {}
      if (isAdmin) {
        if (selectedDate) params.date = selectedDate
        if (selectedDept && selectedDept !== 'All Departments')
          params.department = selectedDept
        if (searchQuery.trim()) params.search = searchQuery.trim()
      }

      const res = await api.get('/attendance', { params })

      if (isAdmin) {
        setRecords(res.data?.data || [])
        setStats(res.data?.stats || null)
      } else {
        setRecords(res.data?.data || [])
        setTodayRecord(res.data?.todayAttendance || null)
      }
    } catch (error) {
      console.error('Fetch attendance error:', error)
      toast.error(error.response?.data?.error || 'Failed to load attendance records')
    } finally {
      setDataLoading(false)
    }
  }

  // Trigger fetch on mount or when admin filters change
  useEffect(() => {
    if (!authLoading && user) {
      fetchAttendance()
    }
  }, [authLoading, user, selectedDate, selectedDept])

  // Employee Clock In / Clock Out handler
  const handleToggleClock = async () => {
    if (isClocking) return
    try {
      setIsClocking(true)
      const res = await api.post('/attendance/clock')

      if (res.data?.type === 'CHECK_IN') {
        toast.success('Clocked in successfully! Have a productive day.')
      } else if (res.data?.type === 'CHECK_OUT') {
        toast.success('Clocked out successfully! Good work today.')
      } else if (res.data?.type === 'ALREADY_CHECKED_OUT') {
        toast('Already completed work for today', { icon: 'ℹ️' })
      } else {
        toast.success('Attendance updated successfully!')
      }

      // Refresh records after clocking
      fetchAttendance()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Clock action failed')
    } finally {
      setIsClocking(false)
    }
  }

  // Filter records in client-side search (for fast typing feedback)
  const filteredRecords = records.filter((rec) => {
    if (!isAdmin) return true // Employee already gets their own records

    const emp = rec.employeeId
    if (!emp) return false

    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase()
    const email = (emp.email || '').toLowerCase()
    const phone = (emp.phone || '').toLowerCase()
    const dept = (emp.department || '').toLowerCase()
    const query = searchQuery.toLowerCase()

    const matchesSearch =
      !query ||
      fullName.includes(query) ||
      email.includes(query) ||
      phone.includes(query)

    const matchesDept =
      selectedDept === 'All Departments' ||
      dept === selectedDept.toLowerCase()

    return matchesSearch && matchesDept
  })

  // Employee specific helpers
  const isEmployeeClockedIn = Boolean(
    todayRecord && todayRecord.checkIn && !todayRecord.checkOut
  )
  const isEmployeeAlreadyDone = Boolean(
    todayRecord && todayRecord.checkIn && todayRecord.checkOut
  )

  const employeeDaysPresent = records.filter(
    (r) => r.status === 'PRESENT' || r.status === 'LATE'
  ).length
  const employeeLateDays = records.filter((r) => r.status === 'LATE').length

  // Loading skeleton state
  if (authLoading || (dataLoading && records.length === 0)) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse pb-24">
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
    <div className="max-w-7xl mx-auto pb-24 relative">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {isAdmin ? 'Attendance Management' : 'My Attendance'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin
              ? "Track daily employee check-ins, check-outs, contact details and working hours"
              : 'Track your daily check-ins, working hours and monthly history'}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAttendance}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-2xs w-fit cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ================= ADMIN OVERVIEW STATS CARDS ================= */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-8">
          {/* Card 1: Today's Present */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Present Today</p>
              <p className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                {stats?.todayPresent ?? 0}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/60">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Currently Active / Working */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Currently Working</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-2xl font-bold text-emerald-600 tracking-tight">
                  {stats?.currentlyActive ?? 0}
                </p>
                {stats?.currentlyActive > 0 && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                )}
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/60">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Completed Work (Checked Out) */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Completed Work</p>
              <p className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                {stats?.completedWork ?? 0}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/60">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Late Arrivals */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Late Arrivals</p>
              <p className="text-2xl font-bold text-amber-600 mt-1 tracking-tight">
                {stats?.lateArrivals ?? 0}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/60">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* ================= EMPLOYEE OVERVIEW STATS CARDS ================= */}
      {!isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100/60 flex items-center justify-center text-indigo-600 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Days Present</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">
                {employeeDaysPresent}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100/60 flex items-center justify-center text-amber-600 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Late Arrivals</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">
                {employeeLateDays}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100/60 flex items-center justify-center text-emerald-600 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Today's Status</p>
              <p className="text-sm font-bold text-slate-900 mt-1 tracking-tight">
                {isEmployeeAlreadyDone
                  ? 'Checked Out'
                  : isEmployeeClockedIn
                  ? 'Active / Clocked In'
                  : 'Not Clocked In'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADMIN SEARCH & FILTER CONTROLS ================= */}
      {isAdmin && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-6 flex flex-col md:flex-row items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Employee name, email, or phone..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          {/* Department Filter */}
          <div className="w-full md:w-auto">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full md:w-auto px-3.5 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="w-full md:w-auto flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full md:w-auto px-3 py-1.5 bg-slate-50/70 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            />
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 whitespace-nowrap px-2 py-1 rounded bg-indigo-50"
              >
                Clear Date
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================= ATTENDANCE RECORDS TABLE ================= */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            {isAdmin ? 'All Employee Attendance Records' : 'Recent Activity'}
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'}
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
                        CONTACT DETAILS
                      </th>
                    </>
                  )}
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                    DATE
                  </th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                    CHECK IN
                  </th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                    CHECK OUT
                  </th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                    WORK HOURS
                  </th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                    DAY TYPE
                  </th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                    STATUS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((rec) => {
                    const emp = rec.employeeId || {}
                    const empName = emp.firstName
                      ? `${emp.firstName} ${emp.lastName || ''}`.trim()
                      : 'Employee'
                    const initials = (
                      (emp.firstName?.[0] || 'E') + (emp.lastName?.[0] || '')
                    ).toUpperCase()

                    const checkInFormatted = formatTime(rec.checkIn) || 'N/A'
                    const checkOutFormatted = formatTime(rec.checkOut)
                    const isWorkingNow = Boolean(rec.checkIn && !rec.checkOut)

                    return (
                      <tr
                        key={rec._id || rec.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        {/* Admin specific: Employee name + dept */}
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
                                  {emp.position || 'Employee'} •{' '}
                                  <span className="text-slate-600 font-medium">
                                    {emp.department || 'General'}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </td>
                        )}

                        {/* Admin specific: Email & Phone */}
                        {isAdmin && (
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="space-y-1">
                              {emp.email && (
                                <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{emp.email}</span>
                                </div>
                              )}
                              {emp.phone && (
                                <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{emp.phone}</span>
                                </div>
                              )}
                            </div>
                          </td>
                        )}

                        {/* Date */}
                        <td className="py-4 px-6 font-semibold text-slate-900 whitespace-nowrap">
                          {formatDate(rec.date)}
                        </td>

                        {/* Check In */}
                        <td className="py-4 px-6 text-slate-700 whitespace-nowrap font-medium">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{checkInFormatted}</span>
                          </div>
                        </td>

                        {/* Check Out */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          {checkOutFormatted ? (
                            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              <span>{checkOutFormatted}</span>
                            </div>
                          ) : isWorkingNow ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Working Now
                            </span>
                          ) : (
                            <span className="text-slate-400">--</span>
                          )}
                        </td>

                        {/* Working Hours */}
                        <td className="py-4 px-6 text-slate-700 whitespace-nowrap font-medium">
                          {rec.workingHours || (isWorkingNow ? 'In Progress' : '--')}
                        </td>

                        {/* Day Type */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          {rec.dayType ? (
                            <span className="inline-block px-2.5 py-1 text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 rounded-md">
                              {rec.dayType}
                            </span>
                          ) : (
                            <span className="text-slate-400">--</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded-md tracking-wider ${
                              rec.status === 'LATE'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : rec.status === 'ABSENT'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {rec.status || 'PRESENT'}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={isAdmin ? 8 : 6}
                      className="py-12 text-center text-slate-500"
                    >
                      <User className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700 text-sm">
                        No attendance records found
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isAdmin
                          ? 'Try adjusting your search query, date, or department filter.'
                          : 'You have not checked in for any days yet.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= EMPLOYEE FLOATING CLOCK IN / CLOCK OUT BUTTON ================= */}
      {!isAdmin && (
        <div className="fixed bottom-6 right-6 z-30">
          <button
            type="button"
            disabled={isClocking || isEmployeeAlreadyDone}
            onClick={handleToggleClock}
            className={`flex items-center gap-3.5 px-5 py-3.5 rounded-2xl shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer text-white disabled:opacity-70 disabled:cursor-not-allowed ${
              isEmployeeAlreadyDone
                ? 'bg-slate-700 shadow-slate-700/20'
                : isEmployeeClockedIn
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              {isEmployeeAlreadyDone ? (
                <CheckCircle2 className="w-4 h-4 text-white" />
              ) : isEmployeeClockedIn ? (
                <LogOut className="w-4 h-4 text-white" />
              ) : (
                <LogIn className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="text-left">
              <span className="block font-bold text-sm leading-tight">
                {isClocking
                  ? 'Updating...'
                  : isEmployeeAlreadyDone
                  ? 'Done for Today'
                  : isEmployeeClockedIn
                  ? 'Clock Out'
                  : 'Clock In'}
              </span>
              <span className="block text-[10px] text-white/80 font-normal">
                {isEmployeeAlreadyDone
                  ? 'Shift completed'
                  : isEmployeeClockedIn
                  ? 'end your work day'
                  : 'start your work day'}
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}

export default Attendance