import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

function ActivityLogsPage() {
  const [logs, setLogs] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [filters, setFilters] = useState({
    userId: '',
    actionType: '',
    entityType: '',
    startDate: '',
    endDate: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    totalCount: 0,
    totalPages: 0
  })
  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    fetchUsers()
    fetchActivityLogs()
  }, [])

  useEffect(() => {
    fetchActivityLogs()
  }, [pagination.page, filters])

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`)
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchActivityLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.userId) params.append('userId', filters.userId)
      if (filters.actionType) params.append('actionType', filters.actionType)
      if (filters.entityType) params.append('entityType', filters.entityType)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      params.append('page', pagination.page)
      params.append('pageSize', pagination.pageSize)

      const response = await axios.get(`${API_BASE_URL}/activitylogs?${params.toString()}`)
      setLogs(response.data.data)
      setPagination({
        ...pagination,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages
      })
    } catch (error) {
      console.error('Error fetching activity logs:', error)
      alert('Failed to load activity logs')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const response = await axios.get(`${API_BASE_URL}/activitylogs/stats?${params.toString()}`)
      setStats(response.data)
      setShowStats(true)
    } catch (error) {
      console.error('Error fetching stats:', error)
      alert('Failed to load statistics')
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value })
    setPagination({ ...pagination, page: 1 }) // Reset to first page when filter changes
  }

  const handleResetFilters = () => {
    setFilters({
      userId: '',
      actionType: '',
      entityType: '',
      startDate: '',
      endDate: ''
    })
    setPagination({ ...pagination, page: 1 })
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Success':
        return 'bg-success'
      case 'Failed':
        return 'bg-danger'
      case 'Error':
        return 'bg-warning'
      default:
        return 'bg-secondary'
    }
  }

  const actionTypes = [
    'Login', 'Logout', 'UploadMap', 'CreateVerifySeam', 'UploadVerifySeamPhoto',
    'UploadGeophysic', 'UpdateUser', 'DeleteUser', 'CreateUser'
  ]

  const entityTypes = [
    'MonthlyMap', 'VerifySeam', 'VerifySeamPhoto', 'GeophysicHole', 'User'
  ]

  if (loading && logs.length === 0) {
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: '#2E5C8A', fontSize: '1.75rem' }}>
            📊 Activity Logs
          </h3>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            View and monitor system activity logs
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={fetchStats}
          style={{ borderRadius: '16px', padding: '12px 24px', fontWeight: '600' }}
        >
          📈 View Statistics
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4" style={{ borderRadius: '24px', border: 'none', padding: '24px' }}>
        <h5 className="mb-3" style={{ color: '#2E5C8A', fontWeight: '600' }}>Filters</h5>
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label fw-semibold">User</label>
            <select
              className="form-select"
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              style={{ borderRadius: '16px' }}
            >
              <option value="">All Users</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">Action Type</label>
            <select
              className="form-select"
              value={filters.actionType}
              onChange={(e) => handleFilterChange('actionType', e.target.value)}
              style={{ borderRadius: '16px' }}
            >
              <option value="">All Actions</option>
              {actionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">Entity Type</label>
            <select
              className="form-select"
              value={filters.entityType}
              onChange={(e) => handleFilterChange('entityType', e.target.value)}
              style={{ borderRadius: '16px' }}
            >
              <option value="">All Entities</option>
              {entityTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">Start Date</label>
            <input
              type="date"
              className="form-control"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              style={{ borderRadius: '16px' }}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">End Date</label>
            <input
              type="date"
              className="form-control"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              style={{ borderRadius: '16px' }}
            />
          </div>
          <div className="col-md-3 d-flex align-items-end">
            <button
              className="btn btn-outline-secondary"
              onClick={handleResetFilters}
              style={{ borderRadius: '16px', padding: '10px 24px', fontWeight: '500' }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Modal */}
      {showStats && stats && (
        <div
          className="modal show d-block"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowStats(false)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ borderRadius: '24px', border: 'none' }}>
              <div className="modal-header" style={{
                borderBottom: '1px solid #F3F4F6',
                padding: '24px',
                borderRadius: '24px 24px 0 0'
              }}>
                <h5 className="modal-title" style={{ fontWeight: '600', color: '#2E5C8A' }}>
                  Activity Statistics
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowStats(false)}
                  style={{ borderRadius: '8px' }}
                ></button>
              </div>
              <div className="modal-body" style={{ padding: '24px' }}>
                <div className="row mb-3">
                  <div className="col-md-12">
                    <h6 className="fw-bold">Total Activities: {stats.totalActivities}</h6>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <h6 className="fw-semibold mb-2">By Action Type</h6>
                    {stats.byActionType.map((item) => (
                      <div key={item.actionType} className="d-flex justify-content-between mb-2">
                        <span>{item.actionType}:</span>
                        <span className="badge bg-primary" style={{ borderRadius: '12px' }}>
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-semibold mb-2">By Status</h6>
                    {stats.byStatus.map((item) => (
                      <div key={item.status} className="d-flex justify-content-between mb-2">
                        <span>{item.status}:</span>
                        <span className={`badge ${getStatusBadgeClass(item.status)}`} style={{ borderRadius: '12px' }}>
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {stats.byEntityType.length > 0 && (
                  <div className="row">
                    <div className="col-md-12">
                      <h6 className="fw-semibold mb-2">By Entity Type</h6>
                      {stats.byEntityType.map((item) => (
                        <div key={item.entityType} className="d-flex justify-content-between mb-2">
                          <span>{item.entityType}:</span>
                          <span className="badge bg-info" style={{ borderRadius: '12px' }}>
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer" style={{
                borderTop: '1px solid #F3F4F6',
                padding: '20px 24px',
                borderRadius: '0 0 24px 24px'
              }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowStats(false)}
                  style={{ borderRadius: '16px', padding: '10px 24px', fontWeight: '500' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Logs Table */}
      <div className="card" style={{ borderRadius: '24px', border: 'none' }}>
        <div className="card-header" style={{
          background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
          borderRadius: '24px 24px 0 0',
          border: 'none',
          padding: '24px'
        }}>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0" style={{ color: '#2E5C8A', fontWeight: '600' }}>
              Activity Logs ({pagination.totalCount} total)
            </h5>
            <div className="d-flex gap-2 align-items-center">
              <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
            </div>
          </div>
        </div>
        <div className="card-body" style={{ padding: '24px' }}>
          {logs.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No activity logs found</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Date/Time</th>
                      <th>User</th>
                      <th>Action</th>
                      <th>Entity</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ fontSize: '0.9rem', color: '#6B7280' }}>
                          {formatDateTime(log.createdAt)}
                        </td>
                        <td style={{ fontWeight: '500' }}>
                          {log.username || `User #${log.userId}`}
                        </td>
                        <td>
                          <span className="badge bg-primary" style={{ borderRadius: '12px', padding: '6px 12px' }}>
                            {log.actionType}
                          </span>
                        </td>
                        <td>
                          {log.entityType ? (
                            <span className="text-muted">
                              {log.entityType}
                              {log.entityId && ` #${log.entityId}`}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <span className="text-truncate d-inline-block" style={{ maxWidth: '300px' }}>
                            {log.description || '-'}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${getStatusBadgeClass(log.status)}`}
                            style={{ borderRadius: '12px', padding: '6px 12px' }}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                          {log.ipAddress || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div>
                    <span className="text-muted">
                      Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
                      {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of{' '}
                      {pagination.totalCount} entries
                    </span>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                      disabled={pagination.page === 1}
                      style={{ borderRadius: '12px', padding: '6px 16px', fontWeight: '500' }}
                    >
                      Previous
                    </button>
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                      disabled={pagination.page >= pagination.totalPages}
                      style={{ borderRadius: '12px', padding: '6px 16px', fontWeight: '500' }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ActivityLogsPage
