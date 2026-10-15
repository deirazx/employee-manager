import React from 'react'
import ProfileSettings from '../components/settings/ProfileSettings'
import PasswordSettings from '../components/settings/PasswordSettings'

const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        <ProfileSettings />
        <PasswordSettings />
      </div>
    </div>
  )
}

export default Settings