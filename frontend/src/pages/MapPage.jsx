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
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold" style={{ color: '#4682B4' }}>🗺️ Map View</h3>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '+ Add Location'}
        </button>
      </div>

      {showAddForm && (
        <div className="card mb-3 p-3">
          <h5>Add New Location</h5>
          <form onSubmit={handleAddPin}>
            <div className="row">
              <div className="col-md-6 mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Title"
                  value={newPin.title}
                  onChange={(e) => setNewPin({ ...newPin, title: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6 mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Description"
                  value={newPin.description}
                  onChange={(e) => setNewPin({ ...newPin, description: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="mb-2">
              <small className="text-muted">
                Click on the map to set location (Lat: {newPin.lat.toFixed(4)}, Lng: {newPin.lng.toFixed(4)})
              </small>
            </div>
            <button type="submit" className="btn btn-primary">Add Pin</button>
          </form>
        </div>
      )}

      <div className="card" style={{ height: 'calc(100vh - 250px)', minHeight: '400px' }}>
        <MapContainer
          center={[13.7563, 100.5018]}
          zoom={6}
          style={{ height: '100%', width: '100%', borderRadius: '12px', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onMapClick={handleMapClick} />
          {pins.map((pin) => (
            <Marker key={pin.id} position={[pin.latitude, pin.longitude]}>
              <Popup>
                <div>
                  <h6>{pin.title}</h6>
                  <p>{pin.description}</p>
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
