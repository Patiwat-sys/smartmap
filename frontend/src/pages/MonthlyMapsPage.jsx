import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

function MonthlyMapsPage() {
  const [maps, setMaps] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedMap, setSelectedMap] = useState(null)
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    file: null,
    eastMin: '',
    eastMax: '',
    northMin: '',
    northMax: '',
    description: ''
  })
  const [uploading, setUploading] = useState(false)
  const [filterYear, setFilterYear] = useState('')
  const [filterMonth, setFilterMonth] = useState('')

  useEffect(() => {
    fetchMonthlyMaps()
  }, [])

  const fetchMonthlyMaps = async () => {
    try {
      const params = new URLSearchParams()
      if (filterYear) params.append('year', filterYear)
      if (filterMonth) params.append('month', filterMonth)
      
      const url = `${API_BASE_URL}/monthlymaps${params.toString() ? '?' + params.toString() : ''}`
      const response = await axios.get(url)
      setMaps(response.data)
    } catch (error) {
      console.error('Error fetching monthly maps:', error)
      alert('Failed to load monthly maps')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMonthlyMaps()
  }, [filterYear, filterMonth])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    if (!formData.file) {
      alert('Please select an image file')
      return
    }

    setUploading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('month', formData.month)
      formDataToSend.append('year', formData.year)
      formDataToSend.append('file', formData.file)
      formDataToSend.append('eastMin', formData.eastMin)
      formDataToSend.append('eastMax', formData.eastMax)
      formDataToSend.append('northMin', formData.northMin)
      formDataToSend.append('northMax', formData.northMax)
      formDataToSend.append('uploadedBy', user.id || 1)
      if (formData.description) {
        formDataToSend.append('description', formData.description)
      }

      await axios.post(`${API_BASE_URL}/monthlymaps`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      alert('Monthly map uploaded successfully!')
      setShowAddForm(false)
      setFormData({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        file: null,
        eastMin: '',
        eastMax: '',
        northMin: '',
        northMax: '',
        description: ''
      })
      fetchMonthlyMaps()
    } catch (error) {
      console.error('Error uploading monthly map:', error)
      alert(error.response?.data?.message || 'Failed to upload monthly map')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && !file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    setFormData({ ...formData, file })
  }

  const handleViewDetails = async (year, month) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/monthlymaps/${year}/${month}`)
      setSelectedMap(response.data)
    } catch (error) {
      console.error('Error fetching monthly map details:', error)
      alert('Failed to load details')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this monthly map?')) {
      try {
        await axios.delete(`${API_BASE_URL}/monthlymaps/${id}`)
        alert('Monthly map deleted successfully')
        fetchMonthlyMaps()
      } catch (error) {
        console.error('Error deleting monthly map:', error)
        alert('Failed to delete monthly map')
      }
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '-'
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getMonthName = (month) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']
    return months[month - 1] || ''
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: '#2E5C8A', fontSize: '1.75rem' }}>
            🗺️ Monthly Maps
          </h3>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Upload and manage monthly maps with coordinates
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ borderRadius: '16px', padding: '12px 24px', fontWeight: '600' }}
        >
          {showAddForm ? '✕ Cancel' : '+ Upload Map'}
        </button>
      </div>

      {showAddForm && (
        <div
          className="card mb-4"
          style={{
            borderRadius: '24px',
            padding: '28px',
            background: 'linear-gradient(135deg, #F5FAFF 0%, #E3F2FD 100%)'
          }}
        >
          <h5 className="mb-4" style={{ color: '#2E5C8A', fontWeight: '600' }}>
            Upload Monthly Map
          </h5>
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="form-label fw-semibold">Month *</label>
                <select
                  className="form-select"
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                  required
                  style={{ borderRadius: '16px' }}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {getMonthName(m)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Year *</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="2026"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  required
                  min="2000"
                  max="2100"
                  style={{ borderRadius: '16px' }}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Map Image *</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  style={{ borderRadius: '16px' }}
                />
                <small className="text-muted">
                  {formData.file ? `Selected: ${formData.file.name}` : 'Please select an image file'}
                </small>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">East Min *</label>
                <input
                  type="number"
                  step="0.001"
                  className="form-control"
                  placeholder="0.000"
                  value={formData.eastMin}
                  onChange={(e) => setFormData({ ...formData, eastMin: e.target.value })}
                  required
                  style={{ borderRadius: '16px' }}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">East Max *</label>
                <input
                  type="number"
                  step="0.001"
                  className="form-control"
                  placeholder="0.000"
                  value={formData.eastMax}
                  onChange={(e) => setFormData({ ...formData, eastMax: e.target.value })}
                  required
                  style={{ borderRadius: '16px' }}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">North Min *</label>
                <input
                  type="number"
                  step="0.001"
                  className="form-control"
                  placeholder="0.000"
                  value={formData.northMin}
                  onChange={(e) => setFormData({ ...formData, northMin: e.target.value })}
                  required
                  style={{ borderRadius: '16px' }}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">North Max *</label>
                <input
                  type="number"
                  step="0.001"
                  className="form-control"
                  placeholder="0.000"
                  value={formData.northMax}
                  onChange={(e) => setFormData({ ...formData, northMax: e.target.value })}
                  required
                  style={{ borderRadius: '16px' }}
                />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Enter description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ borderRadius: '16px' }}
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={uploading}
              style={{ borderRadius: '16px', padding: '10px 24px', fontWeight: '600' }}
            >
              {uploading ? 'Uploading...' : 'Upload Map'}
            </button>
          </form>
        </div>
      )}

      {/* Filter Section */}
      <div className="card mb-4" style={{ borderRadius: '24px', border: 'none', padding: '20px' }}>
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label fw-semibold">Filter by Year</label>
            <input
              type="number"
              className="form-control"
              placeholder="All years"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              style={{ borderRadius: '16px' }}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">Filter by Month</label>
            <select
              className="form-select"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              style={{ borderRadius: '16px' }}
            >
              <option value="">All months</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {getMonthName(m)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card" style={{ borderRadius: '24px', border: 'none' }}>
        <div className="card-header" style={{
          background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
          borderRadius: '24px 24px 0 0',
          border: 'none',
          padding: '24px'
        }}>
          <h5 className="mb-0" style={{ color: '#2E5C8A', fontWeight: '600' }}>
            Monthly Maps List
          </h5>
        </div>
        <div className="card-body" style={{ padding: '24px' }}>
          {maps.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No monthly maps found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Month/Year</th>
                    <th>File Name</th>
                    <th>File Size</th>
                    <th>East Min</th>
                    <th>East Max</th>
                    <th>North Min</th>
                    <th>North Max</th>
                    <th>Uploaded By</th>
                    <th>Uploaded At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {maps.map((map) => (
                    <tr key={map.id}>
                      <td style={{ fontWeight: '600' }}>
                        {getMonthName(map.month)} {map.year}
                      </td>
                      <td>
                        <span className="text-truncate d-inline-block" style={{ maxWidth: '150px' }}>
                          {map.fileName}
                        </span>
                      </td>
                      <td>{formatFileSize(map.fileSize)}</td>
                      <td>{map.eastMin.toFixed(3)}</td>
                      <td>{map.eastMax.toFixed(3)}</td>
                      <td>{map.northMin.toFixed(3)}</td>
                      <td>{map.northMax.toFixed(3)}</td>
                      <td>{map.uploadedByUsername || '-'}</td>
                      <td>{formatDate(map.uploadedAt)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewDetails(map.year, map.month)}
                            style={{ borderRadius: '12px', padding: '6px 16px', fontWeight: '500' }}
                          >
                            View
                          </button>
                          <a
                            href={`http://localhost:5000${map.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-success"
                            style={{ borderRadius: '12px', padding: '6px 16px', fontWeight: '500' }}
                          >
                            Open
                          </a>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(map.id)}
                            style={{ borderRadius: '12px', padding: '6px 16px', fontWeight: '500' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedMap && (
        <div
          className="modal show d-block"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setSelectedMap(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ borderRadius: '24px', border: 'none' }}>
              <div className="modal-header" style={{
                borderBottom: '1px solid #F3F4F6',
                padding: '24px',
                borderRadius: '24px 24px 0 0'
              }}>
                <h5 className="modal-title" style={{ fontWeight: '600', color: '#2E5C8A' }}>
                  Monthly Map - {getMonthName(selectedMap.month)} {selectedMap.year}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedMap(null)}
                  style={{ borderRadius: '8px' }}
                ></button>
              </div>
              <div className="modal-body" style={{ padding: '24px' }}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>File Name:</strong> {selectedMap.fileName}
                  </div>
                  <div className="col-md-6">
                    <strong>File Size:</strong> {formatFileSize(selectedMap.fileSize)}
                  </div>
                  <div className="col-md-3 mt-2">
                    <strong>East Min:</strong> {selectedMap.eastMin.toFixed(3)}
                  </div>
                  <div className="col-md-3 mt-2">
                    <strong>East Max:</strong> {selectedMap.eastMax.toFixed(3)}
                  </div>
                  <div className="col-md-3 mt-2">
                    <strong>North Min:</strong> {selectedMap.northMin.toFixed(3)}
                  </div>
                  <div className="col-md-3 mt-2">
                    <strong>North Max:</strong> {selectedMap.northMax.toFixed(3)}
                  </div>
                  <div className="col-md-6 mt-2">
                    <strong>Uploaded By:</strong> {selectedMap.uploadedByUsername || '-'}
                  </div>
                  <div className="col-md-6 mt-2">
                    <strong>Uploaded At:</strong> {formatDate(selectedMap.uploadedAt)}
                  </div>
                </div>
                {selectedMap.description && (
                  <div className="mb-3">
                    <strong>Description:</strong>
                    <p className="text-muted mb-0">{selectedMap.description}</p>
                  </div>
                )}
                <div className="mt-3">
                  <img
                    src={`http://localhost:5000${selectedMap.fileUrl}`}
                    alt={selectedMap.fileName}
                    className="img-fluid rounded"
                    style={{ borderRadius: '12px', maxHeight: '400px', width: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div className="mt-3">
                  <a
                    href={`http://localhost:5000${selectedMap.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ borderRadius: '16px', padding: '10px 24px', fontWeight: '600' }}
                  >
                    🖼️ Open Full Image
                  </a>
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
                  onClick={() => setSelectedMap(null)}
                  style={{ borderRadius: '16px', padding: '10px 24px', fontWeight: '500' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MonthlyMapsPage
