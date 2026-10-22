import React, { useEffect, useState } from 'react'
import {
  Search,
  Plus,
  X,
  Building2,
  User,
  Briefcase,
  Mail,
  Lock,
  Phone,
  DollarSign,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { DEPARTMENTS } from '../constants/departments'
import api from '../api/axios'
import { useSelector } from 'react-redux'

const Employees = () => {
  const { user, loading } = useSelector((state) => state.auth)
  const [employees, setEmployees] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDept, setSelectedDept] = useState('All Departments')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state for creating a new employee
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: '',
    department: 'Engineering',
    basicSalary: '',
  })

  // Backend se employees fetch karne ka function
  const fetchEmployees = async () => {
    try {
      const result = await api.get('/employees')
      console.log('Employees Data:', result.data)
      setEmployees(result.data)
    } catch (error) {
      console.error('Fetch employees error: ', error)
      toast.error(error.response?.data?.error || 'Failed to fetch employees')
    }
  }

  useEffect(() => {
    // Auth check complete hone ke baad hi API call karo
    if (!loading && user) {
      fetchEmployees()
    }
  }, [loading, user])

  // Filtered employees list based on search and department dropdown
  const filteredEmployees = employees.filter((emp) => {
    const fullName = (emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`).trim()
    const roleTitle = emp.position || emp.role || ''

    const matchesSearch =
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.email && emp.email.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesDept =
      selectedDept === 'All Departments' || emp.department === selectedDept

    return matchesSearch && matchesDept
  })

  // Add new employee handler
  const handleAddEmployee = async (e) => {
    e.preventDefault()

    // 1. Client-side validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.role.trim()) {
      toast.error('Please fill in all required fields (Name, Email, Password, Role)')
      return
    }

    // 2. Full Name ko firstName aur lastName mein split karo (backend requirement)
    const nameParts = formData.name.trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Employee'

    // 3. Backend createEmployee controller ke hisaab se payload
    const payload = {
      firstName,
      lastName,
      email: formData.email.trim(),
      password: formData.password.trim(),
      phone: formData.phone.trim() || '0000000000',
      position: formData.role.trim(),
      department: formData.department,
      basicSalary: Number(formData.basicSalary) || 0,
      joinDate: new Date().toISOString(),
      role: 'EMPLOYEE',
    }

    try {
      setIsSubmitting(true)
      const res = await api.post('/employees', payload)

      if (res.status === 201 || res.data?.success) {
        toast.success(`${formData.name.trim()} added successfully!`)
        setIsModalOpen(false)
        setFormData({
          name: '',
          email: '',
          password: '',
          phone: '',
          role: '',
          department: 'Engineering',
          basicSalary: '',
        })
        // Database se fresh employee list reload karo
        fetchEmployees()
      }
    } catch (error) {
      console.error('Create employee error: ', error)
      toast.error(error.response?.data?.error || 'Failed to create employee')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Employees
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your team members
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition duration-150 cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Search and Department Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employees by name, role or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employees Grid */}
      {filteredEmployees.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((emp) => {
            const empName =
              emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee'
            const empRole = emp.position || emp.role || 'Team Member'
            const empInitials =
              emp.initials ||
              (emp.firstName
                ? (emp.firstName[0] + (emp.lastName?.[0] || '')).toUpperCase()
                : empName.slice(0, 2).toUpperCase())

            return (
              <div
                key={emp.id || emp._id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
              >
                {/* Card Top Area */}
                <div className="p-5 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-block px-2.5 py-1 text-[11px] font-semibold bg-slate-100/90 border border-slate-200/70 rounded-md text-slate-600">
                      {emp.department || 'General'}
                    </span>
                    {emp.employmentStatus && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {emp.employmentStatus}
                      </span>
                    )}
                  </div>

                  {/* Avatar Initial Circle */}
                  <div className="w-20 h-20 rounded-full bg-indigo-50/80 border border-indigo-100/60 text-indigo-500 flex items-center justify-center font-bold text-lg mx-auto my-6 shadow-2xs">
                    {empInitials}
                  </div>
                </div>

                {/* Card Bottom Area */}
                <div className="p-5 bg-white border-t border-slate-100">
                  <h3 className="font-bold text-slate-900 text-base tracking-tight truncate">
                    {empName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {empRole}
                  </p>
                  {emp.email && (
                    <p className="text-xs text-slate-400 mt-1 truncate">
                      {emp.email}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <User className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            No employees found
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or department filter, or click "Add Employee" above.
          </p>
        </div>
      )}

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-bold text-slate-900">
                Add New Employee
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Sarah Connor"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="sarah@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password * (for employee login)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="e.g. 9876543210"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Role / Position *
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    placeholder="e.g. Software Engineer"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer bg-white"
                  >
                    {DEPARTMENTS.filter((d) => d !== 'All Departments').map(
                      (dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Basic Monthly Salary (₹)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    min="0"
                    value={formData.basicSalary}
                    onChange={(e) =>
                      setFormData({ ...formData, basicSalary: e.target.value })
                    }
                    placeholder="e.g. 50000"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg shadow-sm transition cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Employees