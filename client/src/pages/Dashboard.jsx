import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  Users,
  Building2,
  Calendar,
  FileText,
  DollarSign,
  ArrowRight,
  Check,
} from 'lucide-react'

const Dashboard = () => {
  const navigate = useNavigate()
  const role = localStorage.getItem('userRole') || 'employee'
  const userName =
    localStorage.getItem('userName') || (role === 'admin' ? 'Admin' : 'John')
  const firstName = userName.split(' ')[0]

  const [attendanceMarked, setAttendanceMarked] = useState(false)

  const handleMarkAttendance = () => {
    if (attendanceMarked) {
      toast('Attendance already marked for today', { icon: 'ℹ️' })
      return
    }
    setAttendanceMarked(true)
    toast.success('Attendance marked successfully for today!')
  }

  const handleApplyLeave = () => {
    navigate('/leave')
  }

  // Admin stats cards (4 cards)
  const adminStats = [
    { title: 'Total Employees', value: '3', icon: Users },
    { title: 'Departments', value: '10', icon: Building2 },
    { title: "Today's Attendance", value: '1', icon: Calendar },
    { title: 'Pending Leaves', value: '1', icon: FileText },
  ]

  // Employee stats cards (3 cards)
  const employeeStats = [
    { title: 'Days Present', value: attendanceMarked ? '21' : '20', icon: Calendar },
    { title: 'Pending Leaves', value: '2', icon: FileText },
    { title: 'Latest Payslip', value: '$2,000', icon: DollarSign },
  ]

  const stats = role === 'admin' ? adminStats : employeeStats

  return (
    <div className="max-w-7xl mx-auto">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {role === 'admin' ? 'Dashboard' : `Welcome, ${firstName}!`}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {role === 'admin'
            ? "Welcome back, Admin — here's your overview"
            : 'Software Engineer • Engineering'}
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${
          role === 'admin' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
        } gap-5 sm:gap-6 mb-8`}
      >
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div
              key={idx}
              className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-2xs flex items-center justify-between"
            >
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500">
                  {stat.title}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight">
                  {stat.value}
                </p>
              </div>
              <div className="text-slate-400">
                <Icon className="w-7 h-7 stroke-[1.75]" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions (Employee Only) */}
      {role === 'employee' && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleMarkAttendance}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition duration-200 flex items-center gap-2 cursor-pointer shadow-xs ${
              attendanceMarked
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {attendanceMarked ? (
              <>
                <Check className="w-4 h-4" />
                <span>Attendance Marked</span>
              </>
            ) : (
              <>
                <span>Mark Attendance</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleApplyLeave}
            className="px-5 py-2.5 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition duration-200 cursor-pointer shadow-2xs"
          >
            Apply for Leave
          </button>
        </div>
      )}
    </div>
  )
}

export default Dashboard