import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  // Global state
  const [currentUser, setCurrentUser] = useState(null)
  const [currentPage, setCurrentPage] = useState('events')

  // Auth state
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  const [registerData, setRegisterData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  })

  // Events state
  const [events, setEvents] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: ''
  })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState([])
  const [users, setUsers] = useState([])

  // Load current user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser))
      setCurrentPage('events')
    }
  }, [])

  // Fetch events when user logs in
  useEffect(() => {
    if (currentUser && currentPage === 'events') {
      fetchEvents()
      fetchUpcomingEvents()
    }
  }, [currentUser, currentPage, searchTerm])

  // API Calls
  const fetchEvents = async () => {
    try {
      setLoading(true)
      const url = searchTerm
        ? `/api/events?search=${encodeURIComponent(searchTerm)}`
        : '/api/events'
      const response = await axios.get(url)
      setEvents(response.data)
    } catch (err) {
      setError('Failed to fetch events')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUpcomingEvents = async () => {
    try {
      const response = await axios.get('/api/events/upcoming')
      setUpcomingEvents(response.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users?adminKey=admin123')
      setUsers(response.data)
    } catch (err) {
      console.error('Failed to fetch users:', err)
    }
  }

  // Auth handlers
  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      
      // Call backend login endpoint
      const response = await axios.post('/api/auth/login', {
        username: loginData.username,
        password: loginData.password
      })
      
      const user = response.data
      setCurrentUser(user)
      localStorage.setItem('currentUser', JSON.stringify(user))
      setLoginData({ username: '', password: '' })
      
      // Fetch users and events after login
      await fetchUsers()
      await fetchEvents()
      await fetchUpcomingEvents()
      
      setCurrentPage('events')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await axios.post('/api/auth/register', registerData)
      setError('')
      setRegisterData({ username: '', email: '', password: '', confirmPassword: '' })
      setCurrentPage('login')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('currentUser')
    setCurrentPage('login')
    setEvents([])
    setUpcomingEvents([])
  }

  // Event handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setValidationErrors([])
  }

  const handleAuthInputChange = (e, isRegister = false) => {
    const { name, value } = e.target
    if (isRegister) {
      setRegisterData(prev => ({
        ...prev,
        [name]: value
      }))
    } else {
      setLoginData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    setError('')
  }

  const handleSubmitEvent = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setValidationErrors([])

      if (editingId) {
        await axios.put(`/api/events/${editingId}`, formData)
        setEditingId(null)
      } else {
        await axios.post('/api/events', formData)
      }

      setFormData({
        title: '',
        description: '',
        event_date: '',
        location: ''
      })
      setError('')
      await fetchEvents()
      await fetchUpcomingEvents()
    } catch (err) {
      if (err.response?.data?.details) {
        setValidationErrors(err.response.data.details)
      } else {
        setError(err.response?.data?.error || 'Failed to save event')
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditEvent = (event) => {
    setFormData({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date.slice(0, 16),
      location: event.location || ''
    })
    setEditingId(event.id)
    setValidationErrors([])
  }

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return
    }

    try {
      await axios.delete(`/api/events/${id}`)
      await fetchEvents()
      await fetchUpcomingEvents()
    } catch (err) {
      setError('Failed to delete event')
      console.error(err)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setFormData({ title: '', description: '', event_date: '', location: '' })
    setValidationErrors([])
  }

  // Render functions
  const renderAdminPanel = () => (
    <div className="admin-container">
      <header>
        <h1>Admin Panel - Event Management</h1>
      </header>
      
      {error && <div className="error-message">{error}</div>}
      {validationErrors.length > 0 && (
        <div className="validation-errors">
          <strong>Please fix the following errors:</strong>
          <ul>
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <section className="admin-section">
        <h2>Create/Edit Event</h2>
        <form onSubmit={handleSubmitEvent}>
          <input
            type="text"
            name="title"
            placeholder="Event Title *"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="description"
            placeholder="Event Description (max 1000 chars)"
            value={formData.description}
            onChange={handleInputChange}
            maxLength={1000}
          />
          <input
            type="datetime-local"
            name="event_date"
            value={formData.event_date}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="location"
            placeholder="Location (max 255 chars)"
            value={formData.location}
            onChange={handleInputChange}
            maxLength={255}
          />
          <div className="form-buttons">
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : editingId ? 'Update Event' : 'Create Event'}
            </button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="admin-section">
        <h2>Search Events</h2>
        <input
          type="text"
          placeholder="Search events by title, description, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </section>

      <section className="admin-section">
        <h3>Users Management ({users.length})</h3>
        {users.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Admin</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.is_admin ? '✓' : '-'}</td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p>No users found</p>}
      </section>

      <section className="admin-section">
        <h3>All Events {searchTerm && `(Search: "${searchTerm}")`} ({events.length})</h3>
        {events.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Location</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.id}>
                  <td>{event.title}</td>
                  <td>{new Date(event.event_date).toLocaleString()}</td>
                  <td>{event.location || '-'}</td>
                  <td>{new Date(event.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEditEvent(event)} title="Edit event">
                      ✎ Edit
                    </button>
                    <button className="btn-delete" onClick={() => handleDeleteEvent(event.id)} title="Delete event">
                      ✕ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p>No events found</p>}
      </section>
    </div>
  )

  const renderLoginPage = () => (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Admin Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLogin}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={loginData.username}
            onChange={(e) => handleAuthInputChange(e, false)}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={loginData.password}
            onChange={(e) => handleAuthInputChange(e, false)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          Demo credentials: admin / 12345678
        </p>
      </div>
    </div>
  )

  // Main render
  if (!currentUser) {
    return renderLoginPage()
  }

  if (currentPage === 'admin') {
    return renderAdminPanel()
  }

  return renderAdminPanel()
}

export default App
