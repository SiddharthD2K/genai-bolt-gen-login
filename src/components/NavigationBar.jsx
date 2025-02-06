import React from 'react'
import { Link } from 'react-router-dom'

function NavigationBar() {
  return (
    <nav className="navigation-bar">
      <div className="nav-logo">
        <Link to="/">Auth App</Link>
      </div>
      <div className="nav-links">
        <Link to="/">Login</Link>
        <Link to="/dashboard">Dashboard</Link>
      </div>
    </nav>
  )
}

export default NavigationBar
