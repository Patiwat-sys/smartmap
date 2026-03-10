import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

function VerifySeamPage() {
  const [verifySeams, setVerifySeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedSeam, setSelectedSeam] = useState(null)
  const [formData, setFormData] = useState({
    blockName: '',
    easting: '',
    northing: '',
    elevation: '',
    verifyDate: new Date().toISOString().split('T')[0],
    notes: '',
    photos: []
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchVerifySeams()
  }, [])

  const fetchVerifySeams = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/verifyseams`)
      setVerifySeams(response.data)
    } catch (error) {
      console.error('Error fetching verify seams:', error)
      alert('Failed to load verify seams')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    if (!formData.photos || formData.photos.length === 0) {
      alert('Please select at least one photo')
      return
    }

    setUploading(true)

    try {
      // Step 1: Create verify seam
      const createResponse = await axios.post(`${API_BASE_URL}/verifyseams`, {
        blockName: formData.blockName,
        easting: parseFloat(formData.easting),
        northing: parseFloat(formData.northing),
        elevation: formData.elevation ? parseFloat(formData.elevation) : null,
        verifyDate: formData.verifyDate,
        createdBy: user.id || 1,
        notes: formData.notes || null
      })

      const verifySeamId = createResponse.data.verifySeam.id

      // Step 2: Upload photos
      const formDataToSend = new FormData()
      formData.photos.forEach((photo) => {
        formDataToSend.append('files', photo)
      })
      if (formData.notes) {
        formDataToSend.append('description', formData.notes)
      }

      await axios.post(`${API_BASE_URL}/verifyseams/${verifySeamId}/photos/multiple`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      alert('Verify seam created successfully!')
      setShowAddForm(false)
      setFormData({
        blockName: '',
        easting: '',
        northing: '',
        elevation: '',
        verifyDate: new Date().toISOString().split('T')[0],
        notes: '',
        photos: []
      })
      fetchVerifySeams()
    } catch (error) {
      console.error('Error creating verify seam:', error)
      alert(error.response?.data?.message || 'Failed to create verify seam')
    } finally {
      setUploading(false)
    }
  }

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData({ ...formData, photos: files })
  }

  const handleViewDetails = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/verifyseams/${id}`)
      setSelectedSeam(response.data)
    } catch (error) {
      console.error('Error fetching verify seam details:', error)
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
            🔍 Verify Seam
          </h3>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Manage verify seam data and photos
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ borderRadius: '16px', padding: '12px 24px', fontWeight: '600' }}
        >
          {showAddForm ? '✕ Cancel' : '+ Add Verify Seam'}
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
            Add New Verify Seam
          </h5>
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Block Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter block name"
                  value={formData.blockName}
                  onChange={(e) => setFormData({ ...formData, blockName: e.target.value })}
                  required
                  style={{ borderRadius: '16px' }}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Verify Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.verifyDate}
                  onChange={(e) => setFormData({ ...formData, verifyDate: e.target.value })}
                  required
                  style={{ borderRadius: '16px' }}
                />
              </div>
              <div className="col-md-4">
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
              <div className="col-md-4">
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
              <div className="col-md-4">
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
                <label className="form-label fw-semibold">Photos *</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  required
                  style={{ borderRadius: '16px' }}
                />
                <small className="text-muted">
                  Selected: {formData.photos.length} file(s)
                </small>
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Notes</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Enter notes or description"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
              {uploading ? 'Uploading...' : 'Create Verify Seam'}
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
            Verify Seam List
          </h5>
        </div>
        <div className="card-body" style={{ padding: '24px' }}>
          {verifySeams.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No verify seams found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Block Name</th>
                    <th>Easting</th>
                    <th>Northing</th>
                    <th>Elevation</th>
                    <th>Verify Date</th>
                    <th>Photos</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {verifySeams.map((seam) => (
                    <tr key={seam.id}>
                      <td style={{ fontWeight: '600' }}>{seam.blockName}</td>
                      <td>{seam.easting.toFixed(3)}</td>
                      <td>{seam.northing.toFixed(3)}</td>
                      <td>{seam.elevation ? seam.elevation.toFixed(3) : '-'}</td>
                      <td>{formatDate(seam.verifyDate)}</td>
                      <td>
                        <span className="badge bg-info" style={{ borderRadius: '12px', padding: '6px 12px' }}>
                          {seam.photoCount} photo(s)
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewDetails(seam.id)}
                          style={{ borderRadius: '12px', padding: '6px 16px', fontWeight: '500' }}
                        >
                          View
                        </button>
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
      {selectedSeam && (
        <div
          className="modal show d-block"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setSelectedSeam(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ borderRadius: '24px', border: 'none' }}>
              <div className="modal-header" style={{
                borderBottom: '1px solid #F3F4F6',
                padding: '24px',
                borderRadius: '24px 24px 0 0'
              }}>
                <h5 className="modal-title" style={{ fontWeight: '600', color: '#2E5C8A' }}>
                  Verify Seam Details - {selectedSeam.blockName}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedSeam(null)}
                  style={{ borderRadius: '8px' }}
                ></button>
              </div>
              <div className="modal-body" style={{ padding: '24px' }}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Easting:</strong> {selectedSeam.easting.toFixed(3)}
                  </div>
                  <div className="col-md-6">
                    <strong>Northing:</strong> {selectedSeam.northing.toFixed(3)}
                  </div>
                  <div className="col-md-6 mt-2">
                    <strong>Elevation:</strong> {selectedSeam.elevation ? selectedSeam.elevation.toFixed(3) : '-'}
                  </div>
                  <div className="col-md-6 mt-2">
                    <strong>Verify Date:</strong> {formatDate(selectedSeam.verifyDate)}
                  </div>
                </div>
                {selectedSeam.notes && (
                  <div className="mb-3">
                    <strong>Notes:</strong>
                    <p className="text-muted mb-0">{selectedSeam.notes}</p>
                  </div>
                )}
                {selectedSeam.photos && selectedSeam.photos.length > 0 && (
                  <div>
                    <strong className="mb-2 d-block">Photos ({selectedSeam.photos.length}):</strong>
                    <div className="row g-2">
                      {selectedSeam.photos.map((photo) => (
                        <div key={photo.id} className="col-md-4">
                          <img
                            src={`http://localhost:5000${photo.fileUrl}`}
                            alt={photo.fileName}
                            className="img-fluid rounded"
                            style={{ borderRadius: '12px', maxHeight: '150px', objectFit: 'cover', width: '100%' }}
                          />
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
                  onClick={() => setSelectedSeam(null)}
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

export default VerifySeamPage
