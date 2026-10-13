import React, { useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  User,
  LayoutDashboard,
  Calendar,
  FileText,
  DollarSign,
  Settings,
  Users,
  ChevronRight,
  LogOut,
  X,
} from 'lucide-react'

const Sidebar = ({ mobileOpen = false, onClose }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const role = localStorage.getItem('userRole') || 'employee'
  const userName =
    localStorage.getItem('userName') || (role === 'admin' ? 'Admin' : 'John Doe')
  const userInitial = userName.charAt(0).toUpperCase()

  // Auto-close mobile drawer when route changes
  useEffect(() => {
    if (onClose) {
      onClose()
    }
  }, [location.pathname, onClose])

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ...(role === 'admin'
      ? [{ name: 'Employees', path: '/employees', icon: Users }]
      : []),
    { name: 'Attendance', path: '/attendance', icon: Calendar },
    { name: 'Leave', path: '/leave', icon: FileText },
    { name: 'Payslips', path: '/payslips', icon: DollarSign },
    { name: 'Settings', path: '/settings', icon: Settings },
  ]

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    localStorage.removeItem('userName')
    toast.success('Logged out successfully')
    navigate('/login')
  }

  // Sidebar content (used for both desktop and mobile drawer)
  const renderSidebarContent = (isMobile = false) => (
    <div className="flex flex-col justify-between h-full p-4 select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 py-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-slate-700/80 flex items-center justify-center text-slate-300">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide leading-tight">
                Employee MS
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                Management System
              </p>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          {isMobile && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User Profile Card */}
        <div className="bg-[#131b2e] border border-slate-800/80 rounded-xl p-3 mb-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#1c263d] text-slate-200 font-semibold text-sm flex items-center justify-center shrink-0 border border-slate-700/50">
            {userInitial}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-white truncate tracking-tight">
              {userName}
            </h2>
            <p className="text-xs text-slate-400 capitalize truncate">{role}</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            NAVIGATION
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (isMobile && onClose) onClose()
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 group cursor-pointer ${
                    isActive
                      ? 'bg-[#162138] text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? 'text-indigo-400'
                          : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <span className="flex-1">{item.name}</span>
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Bottom Part: Log Out */}
      <div className="pt-4 border-t border-slate-800/80">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2.5 w-full rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-150 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar (Permanent on >= md) */}
      <aside className="hidden md:flex w-64 min-w-64 h-screen bg-[#0B1120] text-slate-300 flex-col border-r border-slate-800/60 shrink-0">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Drawer (Visible on < md when mobileOpen is true) */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          mobileOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop overlay */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Slide-over Drawer Panel */}
        <aside
          className={`absolute top-0 bottom-0 left-0 w-72 max-w-[85vw] bg-[#0B1120] text-slate-300 shadow-2xl transition-transform duration-300 ease-out border-r border-slate-800/80 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {renderSidebarContent(true)}
        </aside>
      </div>
    </>
  )
}

export default Sidebar
