import React from 'react'
import LoginLeftSide from './LoginLeftSide'
import LoginRightSide from './LoginRightSide'

const LoginForm = ({ role = 'admin', title, subtitle }) => {
  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Side: Consistent branding & messaging */}
      <LoginLeftSide />

      {/* Right Side: Role Selector & Login Form */}
      <LoginRightSide initialRole={role} title={title} subtitle={subtitle} />
    </div>
  )
}

export default LoginForm