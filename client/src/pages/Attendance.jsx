import React, { useState } from 'react'
import {
  Calendar,
  Clock,
  AlertCircle,
  LogIn,
  LogOut,
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const INITIAL_RECORDS = [
  {
    id: 1,
    date: 'Mar 15, 2026',
    checkIn: '04:12 PM',
    checkOut: '12:12 AM',
    workingHours: '8h 0m',
    dayType: 'Full Day',
    status: 'PRESENT',
  },
  {
    id: 2,
    date: 'Mar 13, 2026',
    checkIn: '07:18 PM',
    checkOut: '03:18 AM',
    workingHours: '8h 0m',
    dayType: 'Full Day',
    status: 'PRESENT',
  },
]

const Attendance = () => {
  const [records, setRecords] = useState(INITIAL_RECORDS)
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [clockInTime, setClockInTime] = useState(null)

  const handleToggleClock = () => {
    const now = new Date()
    const timeString = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
    const dateString = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    if (!isClockedIn) {
      setIsClockedIn(true)
      setClockInTime(timeString)
      toast.success(`Clocked in at ${timeString}! Have a productive day.`)
    } else {
      setIsClockedIn(false)
      const newRecord = {
        id: Date.now(),
        date: dateString,
        checkIn: clockInTime || '09:00 AM',
        checkOut: timeString,
        workingHours: '8h 15m',
        dayType: 'Full Day',
        status: 'PRESENT',
      }
      setRecords([newRecord, ...records])
      toast.success(`Clocked out at ${timeString}! Good work today.`)
    }
  }

  const daysPresentCount = records.length + (isClockedIn ? 1 : 0)

  return (
    <div className="max-w-7xl mx-auto pb-24 relative">
      {/* Header Area */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Attendance
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Track your work hours and daily check-ins
        </p>
      </div>

      {/* Stats Cards (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-8">
        {/* Card 1: Days Present */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Days Present</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">
              {daysPresentCount}
            </p>
          </div>
        </div>

        {/* Card 2: Late Arrivals */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Late Arrivals</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">
              0
            </p>
          </div>
        </div>

        {/* Card 3: Avg. Work Hrs */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Avg. Work Hrs</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">
              8.5 Hrs
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4 tracking-tight">
          Recent Activity
        </h2>

        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    DATE
                  </th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    CHECK IN
                  </th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    CHECK OUT
                  </th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    WORKING HOURS
                  </th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    DAY TYPE
                  </th>
                  <th className="py-3.5 px-6 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    STATUS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {records.map((rec) => (
                  <tr
                    key={rec.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-4 px-6 font-semibold text-slate-900 whitespace-nowrap">
                      {rec.date}
                    </td>
                    <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                      {rec.checkIn}
                    </td>
                    <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                      {rec.checkOut}
                    </td>
                    <td className="py-4 px-6 text-slate-600 whitespace-nowrap font-medium">
                      {rec.workingHours}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md">
                        {rec.dayType}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 rounded-md tracking-wider">
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Floating Clock In / Clock Out Action Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          type="button"
          onClick={handleToggleClock}
          className={`flex items-center gap-3.5 px-5 py-3.5 rounded-2xl shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer text-white ${
            isClockedIn
              ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
            {isClockedIn ? (
              <LogOut className="w-4 h-4 text-white" />
            ) : (
              <LogIn className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="text-left">
            <span className="block font-bold text-sm leading-tight">
              {isClockedIn ? 'Clock Out' : 'Clock In'}
            </span>
            <span className="block text-[10px] text-white/80 font-normal">
              {isClockedIn ? 'end your work day' : 'start your work day'}
            </span>
          </div>
        </button>
      </div>
    </div>
  )
}

export default Attendance