import React, { useEffect, useState } from 'react'
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
import { useSelector } from 'react-redux'
import api from '../api/axios'

const Dashboard = () => {
  // 1. Redux se logged-in user aur auth session loading state le rahe hain
  const { user, loading: authLoading } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  // 2. Role ko lowercase mein convert kiya taaki "ADMIN" / "admin" dono match ho sakein
  const role = (user?.role_type || user?.role || 'employee').toLowerCase()

  // 3. States for dashboard API data and loading
  const [dashboardData, setDashboardData] = useState(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [markingAttendance, setMarkingAttendance] = useState(false)
  const [attendanceMarked, setAttendanceMarked] = useState(false)

  // 4. Backend se dashboard data fetch karne ka function
  const fetchDashboardData = async () => {
    try {
      setDataLoading(true)
      // GET /api/dashboard call ho rahi hai (axios baseURL mein /api pehle se hai)
      const res = await api.get('/dashboard')
      setDashboardData(res.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error(error.response?.data?.error || 'Failed to load dashboard metrics')
    } finally {
      setDataLoading(false)
    }
  }

  // 5. useEffect hamesha component ke top-level pe hona chahiye (kisi if condition ke andar nahi!)
  useEffect(() => {
    // Jab auth check complete ho jaye tabhi data fetch karo ya login par bhejo
    if (!authLoading) {
      if (user) {
        fetchDashboardData()
      } else {
        navigate('/login')
      }
    }
  }, [authLoading, user, navigate])

  // 6. Employee attendance mark (Clock-In / Clock-Out) karne ka handler
  const handleMarkAttendance = async () => {
    if (markingAttendance) return
    try {
      setMarkingAttendance(true)
      const res = await api.post('/attendance/clock')

      if (res.data?.type === 'CHECK_IN') {
        setAttendanceMarked(true)
        toast.success('Attendance checked in successfully!')
      } else if (res.data?.type === 'ALREADY_CHECKED_OUT') {
        setAttendanceMarked(true)
        toast('Already checked out for today', { icon: 'ℹ️' })
      } else {
        setAttendanceMarked(true)
        toast.success('Attendance updated successfully!')
      }

      // Attendance lagte hi dashboard data refresh karo taaki card counts update ho sakein
      fetchDashboardData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to mark attendance')
    } finally {
      setMarkingAttendance(false)
    }
  }

  const handleApplyLeave = () => {
    navigate('/leave')
  }

  // 7. Admin ke 4 stats cards (backend data se dynamically bind)
  const adminStats = [
    {
      title: 'Total Employees',
      value: dashboardData?.totalEmployees ?? 0,
      icon: Users,
    },
    {
      title: 'Departments',
      value: dashboardData?.totalDepartments ?? dashboardData?.totalDepartmens ?? 0,
      icon: Building2,
    },
    {
      title: "Today's Attendance",
      value: dashboardData?.todayAttendance ?? 0,
      icon: Calendar,
    },
    {
      title: 'Pending Leaves',
      value: dashboardData?.pendingLeaves ?? 0,
      icon: FileText,
    },
  ]

  // 8. Employee ke 3 stats cards (backend data se dynamically bind)
  const employeeStats = [
    {
      title: 'Days Present',
      value: dashboardData?.currentMonthAttendance ?? (attendanceMarked ? 1 : 0),
      icon: Calendar,
    },
    {
      title: 'Pending Leaves',
      value: dashboardData?.pendingLeaves ?? 0,
      icon: FileText,
    },
    {
      title: 'Latest Payslip',
      value: dashboardData?.latestPayslip?.netSalary
        ? `₹${Number(dashboardData.latestPayslip.netSalary).toLocaleString()}`
        : 'N/A',
      icon: DollarSign,
    },
  ]

  // Role ke hisaab se sahi stats cards choose ho rahe hain
  const stats = role === 'admin' ? adminStats : employeeStats

  // User display name aur position subtitle
  const displayName =
    role === 'admin'
      ? 'Admin'
      : dashboardData?.employee?.firstName || user?.firstName || user?.email?.split('@')[0] || 'Employee'

  const subtitle =
    role === 'admin'
      ? "Welcome back, Admin — here's your overview"
      : `${dashboardData?.employee?.position || 'Employee'} • ${dashboardData?.employee?.department || 'General'}`

  // 9. Jab tak data ya session load ho raha hai tab tak skeleton loader dikhao (no UI flicker)
  if (authLoading || dataLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        <div>
          <div className="h-8 bg-slate-200 rounded-lg w-48 mb-2" />
          <div className="h-4 bg-slate-200/70 rounded w-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 border border-slate-200 h-28 flex justify-between items-center"
            >
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-24" />
                <div className="h-7 bg-slate-200 rounded w-16" />
              </div>
              <div className="w-10 h-10 bg-slate-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {role === 'admin' ? 'Dashboard' : `Welcome, ${displayName}!`}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
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

      {/* Quick Actions (Sirf Employee ke liye) */}
      {role === 'employee' && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={markingAttendance}
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