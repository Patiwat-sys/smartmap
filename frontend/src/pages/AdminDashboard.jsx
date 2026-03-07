import { useState, useEffect } from 'react'
import axios from 'axios'

function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({ username: '', email: '', role: 'User', isActive: true })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users')
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user) => {
    setSelectedUser(user)
    setEditForm({
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    })
    setShowEditModal(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`http://localhost:5000/api/users/${selectedUser.id}`, editForm)
      setShowEditModal(false)
      fetchUsers()
      alert('User updated successfully')
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to update user')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${id}`)
        fetchUsers()
        alert('User deleted successfully')
      } catch (error) {
        console.error('Error deleting user:', error)
        alert('Failed to delete user')
      }
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ color: '#2E5C8A', fontSize: '1.75rem' }}>
          ⚙️ Admin Dashboard
        </h3>
        <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
          Manage users and system settings
        </p>
      </div>

      <div className="card" style={{ borderRadius: '24px', border: 'none' }}>
        <div className="card-header" style={{ 
          background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
          borderRadius: '24px 24px 0 0',
          border: 'none',
          padding: '24px'
        }}>
          <h5 className="mb-0" style={{ color: '#2E5C8A', fontWeight: '600' }}>
            User Management
          </h5>
        </div>
        <div className="card-body" style={{ padding: '24px' }}>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: '600', color: '#6B7280' }}>{user.id}</td>
                    <td style={{ fontWeight: '500' }}>{user.username}</td>
                    <td style={{ color: '#6B7280' }}>{user.email}</td>
                    <td>
                      <span 
                        className={`badge ${user.role === 'Admin' ? 'bg-danger' : 'bg-primary'}`}
                        style={{ borderRadius: '12px', padding: '6px 12px' }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span 
                        className={`badge ${user.isActive ? 'bg-success' : 'bg-secondary'}`}
                        style={{ borderRadius: '12px', padding: '6px 12px' }}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEdit(user)}
                        style={{ borderRadius: '12px', padding: '6px 16px', fontWeight: '500' }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(user.id)}
                        style={{ borderRadius: '12px', padding: '6px 16px', fontWeight: '500' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div 
          className="modal show d-block" 
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)'
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '24px', border: 'none' }}>
              <div className="modal-header" style={{ 
                borderBottom: '1px solid #F3F4F6',
                padding: '24px',
                borderRadius: '24px 24px 0 0'
              }}>
                <h5 className="modal-title" style={{ fontWeight: '600', color: '#2E5C8A' }}>
                  Edit User
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                  style={{ borderRadius: '8px' }}
                ></button>
              </div>
              <form onSubmit={handleUpdate}>
                <div className="modal-body" style={{ padding: '24px' }}>
                  <div className="mb-4">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      required
                      style={{ borderRadius: '16px' }}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      required
                      style={{ borderRadius: '16px' }}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">Role</label>
                    <select
                      className="form-select"
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      style={{ borderRadius: '16px' }}
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <div className="form-check" style={{ paddingLeft: '0' }}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={editForm.isActive}
                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                        id="isActive"
                        style={{ 
                          borderRadius: '6px',
                          width: '20px',
                          height: '20px',
                          marginRight: '12px'
                        }}
                      />
                      <label className="form-check-label" htmlFor="isActive" style={{ fontWeight: '500' }}>
                        Active
                      </label>
                    </div>
                  </div>
                </div>
                <div className="modal-footer" style={{ 
                  borderTop: '1px solid #F3F4F6',
                  padding: '20px 24px',
                  borderRadius: '0 0 24px 24px'
                }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                    style={{ borderRadius: '16px', padding: '10px 24px', fontWeight: '500' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ borderRadius: '16px', padding: '10px 24px', fontWeight: '600' }}
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
