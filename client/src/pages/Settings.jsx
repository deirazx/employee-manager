import React, { useState } from 'react'
import {
  User,
  KeyRound,
  Sliders,
  Bell,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Globe,
  Database,
  Server,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import ProfileSettings from '../components/settings/ProfileSettings'
import PasswordSettings from '../components/settings/PasswordSettings'
import { toast } from 'react-hot-toast'

const Settings = () => {
  const { user } = useSelector((state) => state.auth)
  const role = (user?.role_type || user?.role || 'employee').toLowerCase()
  const isAdmin = role === 'admin'

  const [activeTab, setActiveTab] = useState('profile')

  // Notification Preferences state
  const [notifications, setNotifications] = useState({
    leaveUpdates: true,
    payslipAlerts: true,
    announcements: true,
    securityAlerts: true,
  })

  const handleToggleNotification = (key) => {
    setNotifications((prev) => {
      const updated = { ...prev, [key]: !prev[key] }
      toast.success('Preferences updated')
      return updated
    })
  }

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Account Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal profile, credentials, and application preferences
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200/90 pb-px overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Security & Password</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'preferences'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>System & Preferences</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'profile' && <ProfileSettings />}

      {activeTab === 'security' && <PasswordSettings />}

      {activeTab === 'preferences' && (
        <div className="space-y-6">
          {/* Notification Preferences */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base mb-1">
              <Bell className="w-5 h-5 text-indigo-600" />
              <span>Notification Preferences</span>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Choose what notifications you want to receive directly in your portal.
            </p>

            <div className="space-y-4 divide-y divide-slate-100">
              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900">
                    Leave Status Updates
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Receive alert when your leave application is approved or rejected
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.leaveUpdates}
                  onChange={() => handleToggleNotification('leaveUpdates')}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900">
                    Payslip Issuance Notifications
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Get informed as soon as your monthly payslip voucher is disbursed
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.payslipAlerts}
                  onChange={() => handleToggleNotification('payslipAlerts')}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900">
                    Company Announcements
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Stay updated with organization-wide news, holidays, and policies
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.announcements}
                  onChange={() => handleToggleNotification('announcements')}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900">
                    Security & Login Alerts
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Notify when your account credentials or password are changed
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.securityAlerts}
                  onChange={() => handleToggleNotification('securityAlerts')}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* System & Organization Info */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base mb-1">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <span>Organization & Environment Details</span>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Details about the current EMS deployment.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">
                  Organization
                </span>
                <span className="font-bold text-slate-900 text-sm mt-1 block">
                  QuickEMS Solutions Inc.
                </span>
                <span className="text-[11px] text-slate-500">
                  Silicon Valley, CA 94025
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">
                  Application Version
                </span>
                <span className="font-bold text-slate-900 text-sm mt-1 block">
                  v2.4.0 (Production Release)
                </span>
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All systems operational
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">
                  Database & API Gateway
                </span>
                <span className="font-bold text-slate-900 text-sm mt-1 block">
                  MongoDB Atlas & Express.js
                </span>
                <span className="text-[11px] text-slate-500">
                  Protected with JWT & bcrypt
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">
                  Timezone & Locale
                </span>
                <span className="font-bold text-slate-900 text-sm mt-1 block">
                  Asia/Kolkata (IST • UTC+05:30)
                </span>
                <span className="text-[11px] text-slate-500">
                  Formatted in USD ($)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
