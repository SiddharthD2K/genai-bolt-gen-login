import React, { useState } from 'react'
import { supabase, validatePassword, checkPasswordStrength } from '../lib/supabase'

function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(null)

  const handlePasswordChange = async (value) => {
    setPassword(value)
    if (value.length > 0 && !isLogin) {
      const isStrong = await checkPasswordStrength(value)
      setPasswordStrength(isStrong)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Additional password validation for registration
      if (!isLogin && !validatePassword(password)) {
        setError('Password does not meet security requirements.')
        setLoading(false)
        return
      }

      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          switch (error.message) {
            case 'Invalid login credentials':
              setError('Incorrect email or password. Please try again.')
              break
            case 'Email not confirmed':
              setError('Please confirm your email before logging in.')
              break
            default:
              setError('An unexpected error occurred. Please try again.')
          }
          throw error
        }

        console.log('User logged in:', data.user)
      } else {
        // Enhanced registration with password strength check
        const isStrongPassword = await checkPasswordStrength(password)
        if (!isStrongPassword) {
          setError('Password is too weak. Please choose a stronger password.')
          setLoading(false)
          return
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username
            }
          }
        })

        if (authError) {
          switch (authError.message) {
            case 'User already exists':
              setError('An account with this email already exists.')
              break
            case 'Password is too weak':
              setError('Password is too weak. Use a stronger password.')
              break
            default:
              setError('Registration failed. Please try again.')
          }
          throw authError
        }

        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              email: authData.user.email,
              username: username,
              created_at: new Date().toISOString()
            }, {
              onConflict: 'id'
            })

          if (profileError) throw profileError

          console.log('User registered and profile created:', authData.user)
        }
      }
    } catch (err) {
      console.error('Registration/Login Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        {!isLogin && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="auth-input"
            required
            minLength="3"
          />
        )}
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          className="auth-input"
          required
          minLength="12"
        />
        
        {!isLogin && passwordStrength === false && (
          <div className="password-strength-warning">
            Password is weak. It must:
            <ul>
              <li>Be at least 12 characters long</li>
              <li>Contain uppercase and lowercase letters</li>
              <li>Include numbers</li>
              <li>Have special characters</li>
            </ul>
          </div>
        )}
        
        <button 
          type="submit" 
          className="auth-button" 
          disabled={loading || (!isLogin && passwordStrength === false)}
        >
          {loading 
            ? (isLogin ? 'Logging in...' : 'Registering...') 
            : (isLogin ? 'Login' : 'Register')
          }
        </button>
        
        <div 
          className="auth-toggle"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin 
            ? 'Need an account? Register' 
            : 'Already have an account? Login'}
        </div>
      </form>
    </div>
  )
}

export default AuthForm
