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
  Edit2,
  Trash2,
  FileText,
  Activity,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { DEPARTMENTS } from '../constants/departments'
import api from '../api/axios'
import { useSelector } from 'react-redux'

const Employees = () => {
  const { user, loading } = useSelector((state) => state.auth)
  const isAdmin = (user?.role_type || user?.role || 'employee').toLowerCase() === 'admin'

  const [employees, setEmployees] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDept, setSelectedDept] = useState('All Departments')

  // Add Employee Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false)
  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: '',
    department: 'Engineering',
    basicSalary: '',
    allowances: '',
    deductions: '',
    bio: '',
  })

  // Edit Employee Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)
  const [editingEmployeeId, setEditingEmployeeId] = useState(null)
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: 'Engineering',
    basicSalary: '',
    allowances: '',
    deductions: '',
    employmentStatus: 'ACTIVE',
    bio: '',
    password: '',
  })

  // Fetch all employees from backend
  const fetchEmployees = async () => {
    try {
      setDataLoading(true)
      const result = await api.get('/employees')
      setEmployees(result.data || [])
    } catch (error) {
      console.error('Fetch employees error: ', error)
      toast.error(error.response?.data?.error || 'Failed to fetch employees')
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
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
      (emp.email && emp.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (emp.phone && emp.phone.includes(searchQuery))

    const matchesDept =
      selectedDept === 'All Departments' || emp.department === selectedDept

    return matchesSearch && matchesDept
  })

  // 1. ADD EMPLOYEE HANDLER
  const handleAddEmployee = async (e) => {
    e.preventDefault()

    if (
      !addFormData.name.trim() ||
      !addFormData.email.trim() ||
      !addFormData.password.trim() ||
      !addFormData.role.trim()
    ) {
      toast.error('Please fill in all required fields (Name, Email, Password, Role)')
      return
    }

    const nameParts = addFormData.name.trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Employee'

    const payload = {
      firstName,
      lastName,
      email: addFormData.email.trim(),
      password: addFormData.password.trim(),
      phone: addFormData.phone.trim() || '0000000000',
      position: addFormData.role.trim(),
      department: addFormData.department,
      basicSalary: Number(addFormData.basicSalary) || 0,
      allowances: Number(addFormData.allowances) || 0,
      deductions: Number(addFormData.deductions) || 0,
      bio: addFormData.bio.trim(),
      joinDate: new Date().toISOString(),
      role: 'EMPLOYEE',
    }

    try {
      setIsSubmittingAdd(true)
      const res = await api.post('/employees', payload)

      if (res.status === 201 || res.data?.success) {
        toast.success(`${addFormData.name.trim()} added successfully!`)
        setIsAddModalOpen(false)
        setAddFormData({
          name: '',
          email: '',
          password: '',
          phone: '',
          role: '',
          department: 'Engineering',
          basicSalary: '',
          allowances: '',
          deductions: '',
          bio: '',
        })
        fetchEmployees()
      }
    } catch (error) {
      console.error('Create employee error: ', error)
      toast.error(error.response?.data?.error || 'Failed to create employee')
    } finally {
      setIsSubmittingAdd(false)
    }
  }

  // 2. OPEN EDIT MODAL WITH POPULATED DATA
  const handleOpenEditModal = (emp) => {
    setEditingEmployeeId(emp.id || emp._id)
    setEditFormData({
      firstName: emp.firstName || emp.name?.split(' ')[0] || '',
      lastName: emp.lastName || emp.name?.split(' ').slice(1).join(' ') || '',
      email: emp.email || '',
      phone: emp.phone || '',
      position: emp.position || emp.role || '',
      department: emp.department || 'Engineering',
      basicSalary: emp.basicSalary !== undefined ? String(emp.basicSalary) : '',
      allowances: emp.allowances !== undefined ? String(emp.allowances) : '',
      deductions: emp.deductions !== undefined ? String(emp.deductions) : '',
      employmentStatus: emp.employmentStatus || 'ACTIVE',
      bio: emp.bio || '',
      password: '', // Optional for password change
    })
    setIsEditModalOpen(true)
  }

  // 3. UPDATE EMPLOYEE HANDLER
  const handleUpdateEmployee = async (e) => {
    e.preventDefault()

    if (!editFormData.firstName.trim() || !editFormData.email.trim() || !editFormData.position.trim()) {
      toast.error('First Name, Email, and Position are required')
      return
    }

    const payload = {
      firstName: editFormData.firstName.trim(),
      lastName: editFormData.lastName.trim(),
      email: editFormData.email.trim(),
      phone: editFormData.phone.trim() || '0000000000',
      position: editFormData.position.trim(),
      department: editFormData.department,
      basicSalary: Number(editFormData.basicSalary) || 0,
      allowances: Number(editFormData.allowances) || 0,
      deductions: Number(editFormData.deductions) || 0,
      employmentStatus: editFormData.employmentStatus,
      bio: editFormData.bio.trim(),
    }

    // Only include password if user entered a new one
    if (editFormData.password && editFormData.password.trim()) {
      payload.password = editFormData.password.trim()
    }

    try {
      setIsSubmittingEdit(true)
      const res = await api.put(`/employees/${editingEmployeeId}`, payload)

      if (res.status === 200 || res.status === 201 || res.data?.success) {
        toast.success('Employee details updated successfully!')
        setIsEditModalOpen(false)
        setEditingEmployeeId(null)
        fetchEmployees()
      }
    } catch (error) {
      console.error('Update employee error: ', error)
      toast.error(error.response?.data?.error || 'Failed to update employee')
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  // 4. DELETE / DEACTIVATE EMPLOYEE HANDLER
  const handleDeleteEmployee = async (empId, empName) => {
    if (!window.confirm(`Are you sure you want to deactivate ${empName || 'this employee'}?`)) {
      return
    }

    try {
      await api.delete(`/employees/${empId}`)
      toast.success(`${empName || 'Employee'} deactivated successfully`)
      fetchEmployees()
    } catch (error) {
      console.error('Delete employee error: ', error)
      toast.error(error.response?.data?.error || 'Failed to delete employee')
    }
  }

  return (
    <div className="max-w-7xl mx-auto pb-16">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Employees
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your organization's team members, roles, and profiles
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition duration-150 cursor-pointer w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        )}
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
            placeholder="Search employees by name, role, email, or phone..."
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

      {/* Loading Skeleton */}
      {dataLoading && employees.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 h-64 space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-5 bg-slate-200 rounded w-20" />
                <div className="h-5 bg-slate-200 rounded w-16" />
              </div>
              <div className="w-16 h-16 rounded-full bg-slate-200 mx-auto my-4" />
              <div className="h-4 bg-slate-200 rounded w-32 mx-auto" />
              <div className="h-3 bg-slate-200/80 rounded w-24 mx-auto" />
            </div>
          ))}
        </div>
      ) : filteredEmployees.length > 0 ? (
        /* Employees Grid */
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

            const isActive = emp.employmentStatus !== 'INACTIVE'

            return (
              <div
                key={emp.id || emp._id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
              >
                {/* Card Top Area */}
                <div className="p-5 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-block px-2.5 py-1 text-[11px] font-semibold bg-slate-100/90 border border-slate-200/70 rounded-md text-slate-600">
                      {emp.department || 'General'}
                    </span>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {emp.employmentStatus || 'ACTIVE'}
                      </span>

                      {/* Admin Edit & Delete Actions */}
                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(emp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                            title="Edit Employee Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEmployee(emp.id || emp._id, empName)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Deactivate Employee"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Avatar Initial Circle */}
                  <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center font-bold text-lg mx-auto my-3 shadow-2xs">
                    {empInitials}
                  </div>

                  <div className="text-center">
                    <h3 className="font-bold text-slate-900 text-base tracking-tight truncate">
                      {empName}
                    </h3>
                    <p className="text-xs text-indigo-600 font-medium mt-0.5 truncate">
                      {empRole}
                    </p>
                  </div>
                </div>

                {/* Card Bottom Area: Contact and Salary info */}
                <div className="p-4 bg-slate-50/60 border-t border-slate-100 text-xs space-y-1.5">
                  {emp.email && (
                    <div className="flex items-center gap-2 text-slate-600 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                  )}
                  {emp.phone && emp.phone !== '0000000000' && (
                    <div className="flex items-center gap-2 text-slate-600 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{emp.phone}</span>
                    </div>
                  )}
                  {emp.basicSalary !== undefined && emp.basicSalary > 0 && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>₹{Number(emp.basicSalary).toLocaleString()} / month</span>
                    </div>
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

      {/* ======================================================== */}
      {/* 1. ADD NEW EMPLOYEE MODAL */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsAddModalOpen(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-bold text-slate-900">
                Add New Employee
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
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
                    value={addFormData.name}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, name: e.target.value })
                    }
                    placeholder="e.g. Sarah Connor"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={addFormData.email}
                      onChange={(e) =>
                        setAddFormData({ ...addFormData, email: e.target.value })
                      }
                      placeholder="sarah@example.com"
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
                      value={addFormData.phone}
                      onChange={(e) =>
                        setAddFormData({ ...addFormData, phone: e.target.value })
                      }
                      placeholder="e.g. 9876543210"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
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
                    value={addFormData.password}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, password: e.target.value })
                    }
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Job Role / Position *
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={addFormData.role}
                      onChange={(e) =>
                        setAddFormData({ ...addFormData, role: e.target.value })
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
                      value={addFormData.department}
                      onChange={(e) =>
                        setAddFormData({ ...addFormData, department: e.target.value })
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Basic Salary (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={addFormData.basicSalary}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, basicSalary: e.target.value })
                    }
                    placeholder="e.g. 50000"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Allowances (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={addFormData.allowances}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, allowances: e.target.value })
                    }
                    placeholder="e.g. 5000"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Deductions (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={addFormData.deductions}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, deductions: e.target.value })
                    }
                    placeholder="e.g. 2000"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bio / Notes
                </label>
                <textarea
                  rows="2"
                  value={addFormData.bio}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, bio: e.target.value })
                  }
                  placeholder="Optional brief description or experience..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg shadow-sm transition cursor-pointer"
                >
                  {isSubmittingAdd ? 'Saving...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. EDIT / UPDATE EMPLOYEE MODAL (ADMIN ONLY) */}
      {/* ======================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsEditModalOpen(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    Update Employee Details
                  </h3>
                  <p className="text-xs text-slate-500">
                    Edit employee profile, department, status, and compensation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateEmployee} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.firstName}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, firstName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.lastName}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, lastName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, phone: e.target.value })
                    }
                    placeholder="9876543210"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Position / Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.position}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, position: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department *
                  </label>
                  <select
                    value={editFormData.department}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, department: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer bg-white"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Employment Status
                  </label>
                  <select
                    value={editFormData.employmentStatus}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        employmentStatus: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer bg-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reset Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={editFormData.password}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, password: e.target.value })
                    }
                    placeholder="Leave empty to keep unchanged"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Basic Salary (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.basicSalary}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, basicSalary: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Allowances (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.allowances}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, allowances: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Deductions (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.deductions}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, deductions: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bio / Notes
                </label>
                <textarea
                  rows="2"
                  value={editFormData.bio}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, bio: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg shadow-sm transition cursor-pointer"
                >
                  {isSubmittingEdit ? 'Updating...' : 'Update Employee'}
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
