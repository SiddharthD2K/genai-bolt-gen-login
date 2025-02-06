import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      // Redirect to login page or refresh the app state
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="dashboard">
      <h1>Welcome to Your Dashboard</h1>
      {user ? (
        <div>
          <p>Email: {user.email}</p>
          <p>User ID: {user.id}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <p>Please log in to view your dashboard</p>
      )}
    </div>
  )
}

export default Dashboard
