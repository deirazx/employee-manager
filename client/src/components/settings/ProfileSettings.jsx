import React, { useState } from 'react'
import { User, Save } from 'lucide-react'
import { toast } from 'react-hot-toast'

const ProfileSettings = () => {
  const currentRole = localStorage.getItem('userRole') || 'employee'
  const currentName =
    localStorage.getItem('userName') ||
    (currentRole === 'admin' ? 'Admin' : 'John Doe')

  const [formData, setFormData] = useState({
    fullName: currentName,
    email: currentRole === 'admin' ? 'admin@example.com' : 'johndoe@example.com',
    position:
      currentRole === 'admin'
        ? 'System Administrator'
        : 'Senior Software Developer',
    bio: '',
  })

  const [saving, setSaving] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.fullName.trim() || !formData.email.trim()) {
      toast.error('Name and Email cannot be empty')
      return
    }

    setSaving(true)

    setTimeout(() => {
      setSaving(false)
      localStorage.setItem('userName', formData.fullName.trim())
      toast.success('Profile details saved successfully!')
    }, 500)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 mb-6">
      {/* Section Header */}
      <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base mb-6">
        <User className="w-5 h-5 text-slate-500" />
        <span>Public Profile</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1: Full Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              placeholder="John Doe"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="johndoe@example.com"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Row 2: Position */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Position
          </label>
          <input
            type="text"
            value={formData.position}
            onChange={(e) =>
              setFormData({ ...formData, position: e.target.value })
            }
            placeholder="e.g. Senior Software Developer"
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        {/* Row 3: Bio */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Bio
          </label>
          <textarea
            rows="3"
            value={formData.bio}
            onChange={(e) =>
              setFormData({ ...formData, bio: e.target.value })
            }
            placeholder="Write a brief bio..."
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            This will be displayed on your profile.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition duration-150 cursor-pointer disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProfileSettings
