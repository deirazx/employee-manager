import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff, Shield, User } from 'lucide-react'
import { useDispatch } from "react-redux"
import { setUser } from '../app/slices/auth'
import api from '../api/axios'

const LoginRightSide = ({ initialRole = 'admin', title, subtitle }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [role, setRole] = useState(initialRole || 'admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole)
  }

  const loginUser = async () => {
    try {
      setLoading(true)
      const result = await api.post("/auth/login", { email, password, role_type: role })

      // Save user to Redux
      dispatch(setUser(result.data.user))

      toast.success(
        `Logged in successfully as ${role === 'admin' ? 'Administrator' : 'Employee'}`
      )

      navigate('/dashboard')
    } catch (error) {
      console.error("Error while logging in user:", error)
      toast.error(error.response?.data?.error || 'Invalid credentials or login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password')
      return
    }

    loginUser()
  }

  const currentTitle =
    title || (role === 'admin' ? 'Admin Portal' : 'Employee Portal')
  const currentSubtitle =
    subtitle ||
    (role === 'admin'
      ? 'Sign in to manage the organization'
      : 'Sign in to access your account')

  return (
    <div className="w-full md:w-1/2 min-h-screen bg-white flex flex-col justify-center items-center px-6 sm:px-12 md:px-10 lg:px-16 xl:px-24 py-12">
      <div className="w-full max-w-md">
        {/* Role Selector: Admin or Employee */}
        <div className="bg-slate-100 p-1.5 rounded-xl flex items-center mb-8 border border-slate-200">
          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${role === 'admin'
              ? 'bg-indigo-950 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('employee')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${role === 'employee'
              ? 'bg-indigo-950 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <User className="w-4 h-4" />
            <span>Employee</span>
          </button>
        </div>

        {/* Heading & Subtitle */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {currentTitle}
          </h2>
          <p className="mt-2 text-sm text-slate-500">{currentSubtitle}</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email / ID Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {role === 'admin' ? 'Email Address' : 'Email or Employee ID'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  role === 'admin'
                    ? 'admin@company.com'
                    : 'employee@company.com'
                }
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-950/20 focus:border-indigo-950 transition"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => toast('Password reset link will be sent to your email')}
                className="text-xs font-medium text-indigo-950 hover:text-indigo-800 transition cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-950/20 focus:border-indigo-950 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-950 focus:ring-indigo-950 cursor-pointer"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-xs text-slate-600 cursor-pointer select-none"
            >
              Remember this device
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-white text-sm font-semibold shadow-sm transition duration-200 cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <span>Sign In as {role === 'admin' ? 'Admin' : 'Employee'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginRightSide
