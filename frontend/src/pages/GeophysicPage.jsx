import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

function GeophysicPage() {
  const [holes, setHoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedHole, setSelectedHole] = useState(null)
  const [formData, setFormData] = useState({
    holeName: '',
    easting: '',
    northing: '',
    elevation: '',
    file: null,
    description: ''
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchGeophysicHoles()
  }, [])

  const fetchGeophysicHoles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/geophysicholes`)
      setHoles(response.data)
    } catch (error) {
      console.error('Error fetching geophysic holes:', error)
      alert('Failed to load geophysic holes')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    if (!formData.file) {
      alert('Please select a PDF file')
      return
    }

    setUploading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('holeName', formData.holeName)
      formDataToSend.append('easting', formData.easting)
      formDataToSend.append('northing', formData.northing)
      if (formData.elevation) {
        formDataToSend.append('elevation', formData.elevation)
      }
      formDataToSend.append('file', formData.file)
      formDataToSend.append('uploadedBy', user.id || 1)
      if (formData.description) {
        formDataToSend.append('description', formData.description)
      }

      await axios.post(`${API_BASE_URL}/geophysicholes`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      alert('Geophysic hole created successfully!')
      setShowAddForm(false)
      setFormData({
        holeName: '',
        easting: '',
        northing: '',
        elevation: '',
        file: null,
        description: ''
      })
      fetchGeophysicHoles()
    } catch (error) {
      console.error('Error creating geophysic hole:', error)
      alert(error.response?.data?.message || 'Failed to create geophysic hole')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type !== 'application/pdf') {
      alert('Please select a PDF file')
      return
    }
    setFormData({ ...formData, file })
  }

  const handleViewDetails = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/geophysicholes/${id}`)
      setSelectedHole(response.data)
    } catch (error) {
      console.error('Error fetching geophysic hole details:', error)
      alert('Failed to load details')
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
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
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
            📄 Geophysic Holes
          </h3>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Manage geophysic hole data and PDF files
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ borderRadius: '16px', padding: '12px 24px', fontWeight: '600' }}
        >
          {showAddForm ? '✕ Cancel' : '+ Add Geophysic Hole'}
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
            Add New Geophysic Hole
          </h5>
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Hole Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter hole name"
                  value={formData.holeName}
                  onChange={(e) => setFormData({ ...formData, holeName: e.target.value })}
                  required
                  style={{ borderRadius: '16px' }}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label fw-semibold">Easting *</label>
                <input
                  type="number"
                  step="0.001"
                  className="form-control"
                  placeholder="0.000"
                  value={formData.easting}
                  onChange={(e) => setFormData({ ...formData, easting: e.target.value })}
                  required
                  style={{ borderRadius: '16px' }}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label fw-semibold">Northing *</label>
                <input
                  type="number"
                  step="0.001"
                  className="form-control"
                  placeholder="0.000"
                  value={formData.northing}
                  onChange={(e) => setFormData({ ...formData, northing: e.target.value })}
                  required
                  style={{ borderRadius: '16px' }}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label fw-semibold">Elevation</label>
                <input
                  type="number"
                  step="0.001"
                  className="form-control"
                  placeholder="0.000"
                  value={formData.elevation}
                  onChange={(e) => setFormData({ ...formData, elevation: e.target.value })}
                  style={{ borderRadius: '16px' }}
                />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">PDF File *</label>
                <input
                  type="file"
                  className="form-control"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  required
                  style={{ borderRadius: '16px' }}
                />
                <small className="text-muted">
                  {formData.file ? `Selected: ${formData.file.name}` : 'Please select a PDF file'}
                </small>
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
              {uploading ? 'Uploading...' : 'Create Geophysic Hole'}
            </button>
          </form>
        </div>
      )}

      <div className="card" style={{ borderRadius: '24px', border: 'none' }}>
        <div className="card-header" style={{
          background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
          borderRadius: '24px 24px 0 0',
          border: 'none',
          padding: '24px'
        }}>
          <h5 className="mb-0" style={{ color: '#2E5C8A', fontWeight: '600' }}>
            Geophysic Holes List
          </h5>
        </div>
        <div className="card-body" style={{ padding: '24px' }}>
          {holes.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No geophysic holes found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Hole Name</th>
                    <th>Easting</th>
                    <th>Northing</th>
                    <th>Elevation</th>
                    <th>File Name</th>
                    <th>File Size</th>
                    <th>Uploaded By</th>
                    <th>Uploaded At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {holes.map((hole) => (
                    <tr key={hole.id}>
                      <td style={{ fontWeight: '600' }}>{hole.holeName}</td>
                      <td>{hole.easting.toFixed(3)}</td>
                      <td>{hole.northing.toFixed(3)}</td>
                      <td>{hole.elevation ? hole.elevation.toFixed(3) : '-'}</td>
                      <td>
                        <span className="text-truncate d-inline-block" style={{ maxWidth: '150px' }}>
                          {hole.fileName}
                        </span>
                      </td>
                      <td>{formatFileSize(hole.fileSize)}</td>
                      <td>{hole.uploadedByUsername || '-'}</td>
                      <td>{formatDate(hole.uploadedAt)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewDetails(hole.id)}
                            style={{ borderRadius: '12px', padding: '6px 16px', fontWeight: '500' }}
                          >
                            View
                          </button>
                          <a
                            href={`http://localhost:5000${hole.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-success"
                            style={{ borderRadius: '12px', padding: '6px 16px', fontWeight: '500' }}
                          >
                            Open PDF
                          </a>
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
      {selectedHole && (
        <div
          className="modal show d-block"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setSelectedHole(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ borderRadius: '24px', border: 'none' }}>
              <div className="modal-header" style={{
                borderBottom: '1px solid #F3F4F6',
                padding: '24px',
                borderRadius: '24px 24px 0 0'
              }}>
                <h5 className="modal-title" style={{ fontWeight: '600', color: '#2E5C8A' }}>
                  Geophysic Hole Details - {selectedHole.holeName}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedHole(null)}
                  style={{ borderRadius: '8px' }}
                ></button>
              </div>
              <div className="modal-body" style={{ padding: '24px' }}>
                <div className="row mb-3">
                  <div className="col-md-4">
                    <strong>Easting:</strong> {selectedHole.easting.toFixed(3)}
                  </div>
                  <div className="col-md-4">
                    <strong>Northing:</strong> {selectedHole.northing.toFixed(3)}
                  </div>
                  <div className="col-md-4">
                    <strong>Elevation:</strong> {selectedHole.elevation ? selectedHole.elevation.toFixed(3) : '-'}
                  </div>
                  <div className="col-md-6 mt-2">
                    <strong>File Name:</strong> {selectedHole.fileName}
                  </div>
                  <div className="col-md-6 mt-2">
                    <strong>File Size:</strong> {formatFileSize(selectedHole.fileSize)}
                  </div>
                  <div className="col-md-6 mt-2">
                    <strong>Uploaded By:</strong> {selectedHole.uploadedByUsername || '-'}
                  </div>
                  <div className="col-md-6 mt-2">
                    <strong>Uploaded At:</strong> {formatDate(selectedHole.uploadedAt)}
                  </div>
                </div>
                {selectedHole.description && (
                  <div className="mb-3">
                    <strong>Description:</strong>
                    <p className="text-muted mb-0">{selectedHole.description}</p>
                  </div>
                )}
                <div className="mt-3">
                  <a
                    href={`http://localhost:5000${selectedHole.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ borderRadius: '16px', padding: '10px 24px', fontWeight: '600' }}
                  >
                    📄 Open PDF File
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
                  onClick={() => setSelectedHole(null)}
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

export default GeophysicPage
