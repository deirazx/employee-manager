import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { Menu, User } from 'lucide-react'
import { useSelector } from 'react-redux'

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, loading } = useSelector((state) => state.auth)
  const role = user?.role?.toLowerCase() || 'employee'
  const userName = user?.firstName || user?.email?.split('@')[0] || (loading ? '' : 'User')
  const userInitial = userName ? userName.charAt(0).toUpperCase() : '?'

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 overflow-hidden">
      {/* Mobile Top Navbar (Visible on screens < md) */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0B1120] text-white border-b border-slate-800/80 shrink-0 z-30 select-none">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full border border-slate-700/80 flex items-center justify-center text-slate-300">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-wide leading-none block">
                Employee MS
              </span>
              <span className="text-[10px] text-slate-400 font-medium block">
                Management System
              </span>
            </div>
          </div>
        </div>

        {/* Mobile user badge on right */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
            {role}
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#1c263d] text-slate-200 font-semibold text-xs flex items-center justify-center border border-slate-700/50">
            {userInitial}
          </div>
        </div>
      </header>

      {/* Sidebar Component (Desktop Sidebar + Mobile Drawer) */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50/60 p-4 sm:p-6 md:p-8 lg:p-10">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout