import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import { Icon } from 'leaflet'
import axios from 'axios'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon
delete Icon.Default.prototype._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng)
    }
  })
  return null
}

function MapPage() {
  const [pins, setPins] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPin, setNewPin] = useState({ title: '', description: '', lat: 0, lng: 0 })

  useEffect(() => {
    fetchPins()
  }, [])

  const fetchPins = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/locationpins')
      setPins(response.data)
    } catch (error) {
      console.error('Error fetching pins:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMapClick = (latlng) => {
    setNewPin({ ...newPin, lat: latlng.lat, lng: latlng.lng })
    setShowAddForm(true)
  }

  const handleAddPin = async (e) => {
    e.preventDefault()
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    
    try {
      await axios.post('http://localhost:5000/api/locationpins', {
        title: newPin.title,
        description: newPin.description,
        latitude: newPin.lat,
        longitude: newPin.lng,
        userId: user.id || 1
      })
      setShowAddForm(false)
      setNewPin({ title: '', description: '', lat: 0, lng: 0 })
      fetchPins()
    } catch (error) {
      console.error('Error adding pin:', error)
      alert('Failed to add location pin')
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: '#2E5C8A', fontSize: '1.75rem' }}>
            🗺️ Map View
          </h3>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Click on the map to add a new location pin
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ borderRadius: '16px', padding: '12px 24px', fontWeight: '600' }}
        >
          {showAddForm ? '✕ Cancel' : '+ Add Location'}
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
            Add New Location
          </h5>
          <form onSubmit={handleAddPin}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter location title"
                  value={newPin.title}
                  onChange={(e) => setNewPin({ ...newPin, title: e.target.value })}
                  required
                  style={{ borderRadius: '16px' }}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter description"
                  value={newPin.description}
                  onChange={(e) => setNewPin({ ...newPin, description: e.target.value })}
                  required
                  style={{ borderRadius: '16px' }}
                />
              </div>
            </div>
            <div className="mt-3 mb-3">
              <small className="text-muted" style={{ fontSize: '0.85rem' }}>
                📍 Location: Lat {newPin.lat.toFixed(4)}, Lng {newPin.lng.toFixed(4)}
              </small>
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ borderRadius: '16px', padding: '10px 24px', fontWeight: '600' }}
            >
              Add Pin
            </button>
          </form>
        </div>
      )}

      <div 
        className="card" 
        style={{ 
          height: 'calc(100vh - 280px)', 
          minHeight: '500px',
          borderRadius: '24px',
          overflow: 'hidden',
          border: 'none'
        }}
      >
        <MapContainer
          center={[13.7563, 100.5018]}
          zoom={6}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onMapClick={handleMapClick} />
          {pins.map((pin) => (
            <Marker key={pin.id} position={[pin.latitude, pin.longitude]}>
              <Popup>
                <div style={{ padding: '8px' }}>
                  <h6 style={{ marginBottom: '8px', fontWeight: '600', color: '#2E5C8A' }}>
                    {pin.title}
                  </h6>
                  <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9rem' }}>
                    {pin.description}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

export default MapPage
