import React from 'react'

const LoginLeftSide = () => {
  return (
    <div className="hidden md:flex w-1/2 min-h-screen bg-indigo-950 relative overflow-hidden flex-col justify-center items-center px-8 sm:px-12 lg:px-16 border-r border-slate-200">
      {/* Soft Ambient Glow in Top-Left */}
      <div className="absolute -top-28 -left-28 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content: centered in the left column */}
      <div className="relative z-10 max-w-md w-full">
        <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
          Employee <br /> Management System
        </h1>
        <p className="mt-4 text-slate-300 text-sm lg:text-base leading-relaxed">
          Streamline your workforce operations, track attendance, manage payroll, and empower your team securely.
        </p>
      </div>
    </div>
  )
}

export default LoginLeftSide