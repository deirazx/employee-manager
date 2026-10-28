import React, { useEffect, useState } from 'react'
import {
  User,
  Save,
  Mail,
  Phone,
  Briefcase,
  Building2,
  FileText,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSelector, useDispatch } from 'react-redux'
import api from '../../api/axios'
import { setUser } from '../../app/slices/auth'

const ProfileSettings = () => {
  const dispatch = useDispatch()
  const { user: authUser } = useSelector((state) => state.auth)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    bio: '',
    role: 'EMPLOYEE',
    employmentStatus: 'ACTIVE',
  })

  // Fetch real profile from backend
  const loadProfile = async () => {
    try {
      setLoading(true)
      const res = await api.get('/profile')
      const data = res.data || {}
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        position: data.position || '',
        department: data.department || '',
        bio: data.bio || '',
        role: data.role || 'EMPLOYEE',
        employmentStatus: data.employmentStatus || 'ACTIVE',
      })
    } catch (error) {
      console.error('Fetch profile error:', error)
      toast.error('Failed to load profile details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const isAdmin = formData.role?.toUpperCase() === 'ADMIN'

    if (!isAdmin && (!formData.firstName.trim() || !formData.lastName.trim())) {
      toast.error('First Name and Last Name are required')
      return
    }

    try {
      setSaving(true)
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
        email: formData.email.trim(),
      }

      const res = await api.post('/profile', payload)

      if (res.data?.success) {
        toast.success(res.data.message || 'Profile saved successfully!')
        if (res.data.profile) {
          dispatch(setUser(res.data.profile))
        }
      }
    } catch (error) {
      console.error('Save profile error:', error)
      const msg = error.response?.data?.error || 'Failed to save profile changes'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const isAdmin = formData.role?.toUpperCase() === 'ADMIN'
  const displayName = `${formData.firstName} ${formData.lastName}`.trim() || (isAdmin ? 'Admin' : 'Employee')
  const initials =
    `${formData.firstName?.[0] || (isAdmin ? 'A' : 'E')}${formData.lastName?.[0] || ''}`.toUpperCase()

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-8 flex items-center justify-center text-slate-500 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
        <span className="text-sm font-medium">Loading profile settings...</span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 border-2 border-white/20 flex items-center justify-center font-bold text-xl text-white shadow-md">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                {displayName}
              </h2>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                  isAdmin
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                }`}
              >
                {formData.role}
              </span>
            </div>
            <p className="text-xs text-indigo-200/80 mt-1">
              {formData.position || (isAdmin ? 'System Administrator' : 'Staff Member')}
              {formData.department ? ` • ${formData.department}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 text-xs text-white/90 border border-white/10 backdrop-blur-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Account {formData.employmentStatus}</span>
          </span>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base pb-3 border-b border-slate-100">
          <User className="w-5 h-5 text-indigo-600" />
          <span>Personal Information</span>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              First Name {!isAdmin && <span className="text-rose-500">*</span>}
            </label>
            <input
              type="text"
              required={!isAdmin}
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              placeholder="e.g. John"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Last Name {!isAdmin && <span className="text-rose-500">*</span>}
            </label>
            <input
              type="text"
              required={!isAdmin}
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              placeholder="e.g. Doe"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Contact Info (Email & Phone) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={!isAdmin}
                placeholder="name@company.com"
                className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition ${
                  !isAdmin ? 'bg-slate-50 cursor-not-allowed text-slate-500' : 'bg-white'
                }`}
              />
            </div>
            {!isAdmin && (
              <p className="text-[11px] text-slate-400 mt-1">
                Official employee email address is managed by organization admin.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="e.g. +1 555-0199"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Job Title & Department (Read-only badges for employee) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Position / Designation
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                disabled
                value={formData.position || (isAdmin ? 'System Administrator' : 'Employee')}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Department
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                disabled
                value={formData.department || (isAdmin ? 'Executive Management' : 'Operations')}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            About / Bio
          </label>
          <textarea
            rows="3"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Share a brief overview about yourself, skills, or projects..."
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Visible on your company team profile and attendance roster.
          </p>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition duration-150 cursor-pointer disabled:opacity-60"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProfileSettings
