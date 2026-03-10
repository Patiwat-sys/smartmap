import { useState, useEffect, useRef } from 'react'
import { fabric } from 'fabric'

function ImageEditorModal({ isOpen, imageFile, onClose, onSave }) {
  const [canvas, setCanvas] = useState(null)
  const [selectedTool, setSelectedTool] = useState('select')
  const [strokeColor, setStrokeColor] = useState('#000000')
  const [fillColor, setFillColor] = useState('#FF0000')
  const [fontSize, setFontSize] = useState(20)
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [strokeStyle, setStrokeStyle] = useState('solid') // solid, dashed, dotted
  const [zoomLevel, setZoomLevel] = useState(1)
  const [hasActiveObject, setHasActiveObject] = useState(false) // Track if object is selected
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const isDrawingRef = useRef(false)
  const startPointRef = useRef(null)
  const currentShapeRef = useRef(null)
  const selectedToolRef = useRef('select') // Use ref to avoid closure issues

  // Update ref when selectedTool changes
  useEffect(() => {
    selectedToolRef.current = selectedTool
  }, [selectedTool])

  // Get stroke dash array based on style
  const getStrokeDashArray = (style) => {
    switch (style) {
      case 'dashed':
        return [10, 5]
      case 'dotted':
        return [2, 2]
      default:
        return []
    }
  }

  useEffect(() => {
    if (!isOpen || !imageFile) return

    // Initialize Fabric.js canvas
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#f5f5f5'
    })

    // Load image
    const reader = new FileReader()
    reader.onload = (e) => {
      fabric.Image.fromURL(e.target.result, (img) => {
        // Scale image to fit canvas
        const scale = Math.min(
          (fabricCanvas.width - 20) / img.width,
          (fabricCanvas.height - 20) / img.height
        )
        img.scale(scale)
        img.set({
          left: (fabricCanvas.width - img.width * scale) / 2,
          top: (fabricCanvas.height - img.height * scale) / 2,
          selectable: false,
          evented: false
        })
        
        // Use setTimeout to ensure canvas context is ready
        setTimeout(() => {
          try {
            if (fabricCanvas && fabricCanvas.getContext()) {
              fabricCanvas.setBackgroundImage(img, () => {
                try {
                  if (fabricCanvas && fabricCanvas.getContext()) {
                    fabricCanvas.renderAll()
                  }
                } catch (err) {
                  console.error('Error rendering canvas:', err)
                }
              })
            }
          } catch (err) {
            console.error('Error setting background image:', err)
          }
        }, 100)
      })
    }
    reader.readAsDataURL(imageFile)

    // Mouse events for drawing shapes - use ref to avoid closure issues
    const handleMouseDown = (options) => {
      const tool = selectedToolRef.current
      if (tool === 'line' || tool === 'rect' || tool === 'circle') {
        isDrawingRef.current = true
        const pointer = fabricCanvas.getPointer(options.e)
        startPointRef.current = pointer
        
        const dashArray = getStrokeDashArray(strokeStyle)
        
        if (tool === 'line') {
          const line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            stroke: strokeColor,
            strokeWidth: strokeWidth,
            strokeDashArray: dashArray,
            selectable: false
          })
          fabricCanvas.add(line)
          currentShapeRef.current = line
        } else if (tool === 'rect') {
          const rect = new fabric.Rect({
            left: pointer.x,
            top: pointer.y,
            width: 0,
            height: 0,
            fill: 'transparent',
            stroke: strokeColor,
            strokeWidth: strokeWidth,
            strokeDashArray: dashArray,
            selectable: false
          })
          fabricCanvas.add(rect)
          currentShapeRef.current = rect
        } else if (tool === 'circle') {
          const circle = new fabric.Circle({
            left: pointer.x,
            top: pointer.y,
            radius: 0,
            fill: 'transparent',
            stroke: strokeColor,
            strokeWidth: strokeWidth,
            strokeDashArray: dashArray,
            selectable: false
          })
          fabricCanvas.add(circle)
          currentShapeRef.current = circle
        }
      }
    }

    const handleMouseMove = (options) => {
      if (isDrawingRef.current && currentShapeRef.current && startPointRef.current) {
        const pointer = fabricCanvas.getPointer(options.e)
        const tool = selectedToolRef.current
        
        if (tool === 'line') {
          currentShapeRef.current.set({
            x2: pointer.x,
            y2: pointer.y
          })
        } else if (tool === 'rect') {
          const width = Math.abs(pointer.x - startPointRef.current.x)
          const height = Math.abs(pointer.y - startPointRef.current.y)
          currentShapeRef.current.set({
            left: Math.min(startPointRef.current.x, pointer.x),
            top: Math.min(startPointRef.current.y, pointer.y),
            width: width,
            height: height
          })
        } else if (tool === 'circle') {
          const radius = Math.sqrt(
            Math.pow(pointer.x - startPointRef.current.x, 2) +
            Math.pow(pointer.y - startPointRef.current.y, 2)
          ) / 2
          currentShapeRef.current.set({
            left: Math.min(startPointRef.current.x, pointer.x),
            top: Math.min(startPointRef.current.y, pointer.y),
            radius: radius
          })
        }
        try {
          if (fabricCanvas && fabricCanvas.getContext()) {
            fabricCanvas.renderAll()
          }
        } catch (err) {
          console.error('Error rendering during mouse move:', err)
        }
      }
    }

    const handleMouseUp = () => {
      if (isDrawingRef.current && currentShapeRef.current) {
        try {
          currentShapeRef.current.set({
            selectable: true
          })
          fabricCanvas.setActiveObject(currentShapeRef.current)
          isDrawingRef.current = false
          currentShapeRef.current = null
          startPointRef.current = null
          
        // Switch back to select mode after drawing
        setSelectedTool('select')
        selectedToolRef.current = 'select'
        fabricCanvas.defaultCursor = 'default'
        fabricCanvas.isDrawingMode = false
        setHasActiveObject(true) // Object is now selected, disable width/style
        
        if (fabricCanvas && fabricCanvas.getContext()) {
          fabricCanvas.renderAll()
        }
        } catch (err) {
          console.error('Error in mouse up:', err)
        }
      }
    }

    // Double-click to edit text
    const handleDoubleClick = (options) => {
      const activeObject = fabricCanvas.getActiveObject()
      if (activeObject && activeObject.type === 'i-text') {
        activeObject.enterEditing()
        activeObject.selectAll()
      }
    }

    // Track selection state for disabling width/style controls
    const handleSelectionCreated = () => {
      setHasActiveObject(true)
    }

    const handleSelectionUpdated = () => {
      setHasActiveObject(true)
    }

    const handleSelectionCleared = () => {
      setHasActiveObject(false)
    }

    fabricCanvas.on('mouse:down', handleMouseDown)
    fabricCanvas.on('mouse:move', handleMouseMove)
    fabricCanvas.on('mouse:up', handleMouseUp)
    fabricCanvas.on('mouse:dblclick', handleDoubleClick)
    fabricCanvas.on('selection:created', handleSelectionCreated)
    fabricCanvas.on('selection:updated', handleSelectionUpdated)
    fabricCanvas.on('selection:cleared', handleSelectionCleared)

    setCanvas(fabricCanvas)

    return () => {
      fabricCanvas.off('mouse:down', handleMouseDown)
      fabricCanvas.off('mouse:move', handleMouseMove)
      fabricCanvas.off('mouse:up', handleMouseUp)
      fabricCanvas.off('mouse:dblclick', handleDoubleClick)
      fabricCanvas.off('selection:created', handleSelectionCreated)
      fabricCanvas.off('selection:updated', handleSelectionCreated)
      fabricCanvas.off('selection:cleared', handleSelectionCleared)
      fabricCanvas.dispose()
    }
  }, [isOpen, imageFile, strokeColor, strokeWidth, strokeStyle])

  const handleToolSelect = (tool) => {
    setSelectedTool(tool)
    selectedToolRef.current = tool
    
    if (canvas) {
      try {
        // Clear selection when switching tools
        canvas.discardActiveObject()
        setHasActiveObject(false)
        
        canvas.isDrawingMode = false
        canvas.defaultCursor = 'default'
        canvas.selection = true

        if (tool === 'draw') {
          canvas.isDrawingMode = true
          if (canvas.freeDrawingBrush) {
            canvas.freeDrawingBrush.width = strokeWidth
            canvas.freeDrawingBrush.color = strokeColor
          }
        } else if (tool === 'line') {
          canvas.defaultCursor = 'crosshair'
          canvas.isDrawingMode = false
        } else if (tool === 'rect' || tool === 'circle' || tool === 'polygon') {
          canvas.defaultCursor = 'crosshair'
          canvas.isDrawingMode = false
        } else if (tool === 'text') {
          canvas.defaultCursor = 'text'
          canvas.isDrawingMode = false
        } else if (tool === 'select') {
          canvas.defaultCursor = 'default'
          canvas.isDrawingMode = false
        }
        
        canvas.renderAll()
      } catch (error) {
        console.error('Error setting tool:', error)
      }
    }
  }
  
  // Check if width/style controls should be disabled
  const isDrawingTool = ['draw', 'line', 'rect', 'circle'].includes(selectedTool)
  const isWidthStyleDisabled = hasActiveObject || !isDrawingTool

  // These functions are now handled by mouse events
  const handleAddLine = () => {
    // Tool selection is handled by handleToolSelect
  }

  const handleAddRect = () => {
    // Tool selection is handled by handleToolSelect
  }

  const handleAddCircle = () => {
    // Tool selection is handled by handleToolSelect
  }

  const handleAddText = () => {
    if (!canvas) return
    // Use IText instead of Text for editable text
    const text = new fabric.IText('Label', {
      left: 100,
      top: 100,
      fontSize: fontSize,
      fill: strokeColor,
      selectable: true,
      editable: true
    })
    canvas.add(text)
    canvas.setActiveObject(text)
    text.enterEditing()
    text.selectAll()
    
    // Switch back to select mode after adding text
    setSelectedTool('select')
    selectedToolRef.current = 'select'
    canvas.defaultCursor = 'default'
    canvas.isDrawingMode = false
    setHasActiveObject(true) // Text is now selected, disable width/style
    
    canvas.renderAll()
  }

  // Update free drawing brush width/style when in draw mode
  useEffect(() => {
    if (!canvas) return
    
    // Only update free drawing brush when in draw mode
    if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = strokeWidth
      canvas.freeDrawingBrush.color = strokeColor
    }
  }, [canvas, strokeWidth, strokeColor])

  const handleZoomIn = () => {
    if (!canvas) return
    const zoom = Math.min(zoomLevel * 1.2, 5)
    setZoomLevel(zoom)
    canvas.setZoom(zoom)
  }

  const handleZoomOut = () => {
    if (!canvas) return
    const zoom = Math.max(zoomLevel / 1.2, 0.1)
    setZoomLevel(zoom)
    canvas.setZoom(zoom)
  }

  const handleResetZoom = () => {
    if (!canvas) return
    setZoomLevel(1)
    canvas.setZoom(1)
  }

  const handleCrop = () => {
    if (!canvas) return
    alert('Crop feature: Select area and crop (Implementation can be added)')
  }

  const handleDelete = () => {
    if (!canvas) return
    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      canvas.remove(activeObject)
      canvas.renderAll()
    }
  }

  const handleSave = () => {
    if (!canvas) return
    
    // Export canvas as image
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1
    })

    // Convert dataURL to File
    fetch(dataURL)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], imageFile.name, { type: 'image/png' })
        onSave(file)
        onClose()
      })
  }

  const handleColorChange = (color, type) => {
    if (type === 'stroke') {
      setStrokeColor(color)
      if (canvas && canvas.isDrawingMode && canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = color
      }
    } else {
      setFillColor(color)
    }
    
    // Update selected object color
    if (canvas) {
      try {
        const activeObject = canvas.getActiveObject()
        if (activeObject) {
          if (type === 'stroke') {
            if (activeObject.stroke !== undefined) {
              activeObject.set('stroke', color)
            }
            if (activeObject.type === 'i-text') {
              activeObject.set('fill', color) // Text uses fill, not stroke
            }
          } else if (type === 'fill' && activeObject.fill !== undefined) {
            activeObject.set('fill', color)
          }
          
          // Use requestAnimationFrame to ensure canvas context is ready
          requestAnimationFrame(() => {
            if (canvas && canvas.getContext()) {
              canvas.renderAll()
            }
          })
        }
      } catch (error) {
        console.error('Error updating color:', error)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="modal show d-block"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 2000
      }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-xl modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '95vw', height: '95vh' }}
      >
        <div
          className="modal-content"
          style={{
            borderRadius: '24px',
            border: 'none',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div
            className="modal-header"
            style={{
              borderBottom: '1px solid #F3F4F6',
              padding: '20px 24px',
              borderRadius: '24px 24px 0 0'
            }}
          >
            <h5
              className="modal-title"
              style={{ fontWeight: '600', color: '#2E5C8A' }}
            >
              ✏️ Edit Image
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              style={{ borderRadius: '8px' }}
            ></button>
          </div>

          {/* Toolbar */}
          <div
            className="px-3 py-2"
            style={{
              borderBottom: '1px solid #F3F4F6',
              background: '#F9FAFB',
              overflowX: 'auto'
            }}
          >
            <div className="d-flex flex-wrap gap-2 align-items-center">
              {/* Drawing Tools */}
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={`btn btn-sm ${selectedTool === 'select' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleToolSelect('select')}
                  style={{ borderRadius: '12px', padding: '6px 12px' }}
                  title="Select/Move"
                >
                  👆 Select
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${selectedTool === 'draw' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleToolSelect('draw')}
                  style={{ borderRadius: '12px', padding: '6px 12px' }}
                  title="Free Draw"
                >
                  ✏️ Draw
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${selectedTool === 'line' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleToolSelect('line')}
                  style={{ borderRadius: '12px', padding: '6px 12px' }}
                  title="Draw Line (Click and drag)"
                >
                  ➖ Line
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${selectedTool === 'rect' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleToolSelect('rect')}
                  style={{ borderRadius: '12px', padding: '6px 12px' }}
                  title="Draw Rectangle (Click and drag)"
                >
                  ⬜ Rect
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${selectedTool === 'circle' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleToolSelect('circle')}
                  style={{ borderRadius: '12px', padding: '6px 12px' }}
                  title="Draw Circle (Click and drag)"
                >
                  ⭕ Circle
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${selectedTool === 'text' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => {
                    handleToolSelect('text')
                    handleAddText()
                  }}
                  style={{ borderRadius: '12px', padding: '6px 12px' }}
                  title="Add Text/Label"
                >
                  📝 Text
                </button>
              </div>

              {/* Colors */}
              <div className="d-flex gap-2 align-items-center">
                <label className="small fw-semibold">Stroke:</label>
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => handleColorChange(e.target.value, 'stroke')}
                  style={{ width: '40px', height: '30px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                <label className="small fw-semibold">Fill:</label>
                <input
                  type="color"
                  value={fillColor}
                  onChange={(e) => handleColorChange(e.target.value, 'fill')}
                  style={{ width: '40px', height: '30px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>

              {/* Stroke Width */}
              <div className="d-flex gap-2 align-items-center">
                <label className="small fw-semibold" style={{ opacity: isWidthStyleDisabled ? 0.5 : 1 }}>
                  Width:
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={strokeWidth}
                  onChange={(e) => {
                    const newWidth = parseInt(e.target.value) || 1
                    setStrokeWidth(newWidth)
                    
                    // Update free drawing brush if in draw mode
                    if (canvas && canvas.isDrawingMode && canvas.freeDrawingBrush) {
                      canvas.freeDrawingBrush.width = newWidth
                    }
                  }}
                  disabled={isWidthStyleDisabled}
                  className="form-control form-control-sm"
                  style={{ 
                    width: '60px', 
                    borderRadius: '8px',
                    opacity: isWidthStyleDisabled ? 0.5 : 1,
                    cursor: isWidthStyleDisabled ? 'not-allowed' : 'text'
                  }}
                  title={isWidthStyleDisabled ? 'Width can only be set before drawing' : 'Set stroke width'}
                />
              </div>

              {/* Stroke Style */}
              <div className="d-flex gap-2 align-items-center">
                <label className="small fw-semibold" style={{ opacity: isWidthStyleDisabled ? 0.5 : 1 }}>
                  Style:
                </label>
                <select
                  className="form-select form-select-sm"
                  value={strokeStyle}
                  onChange={(e) => {
                    setStrokeStyle(e.target.value)
                  }}
                  disabled={isWidthStyleDisabled}
                  style={{ 
                    width: '100px', 
                    borderRadius: '8px',
                    opacity: isWidthStyleDisabled ? 0.5 : 1,
                    cursor: isWidthStyleDisabled ? 'not-allowed' : 'pointer'
                  }}
                  title={isWidthStyleDisabled ? 'Style can only be set before drawing' : 'Set stroke style'}
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
              </div>

              {/* Font Size */}
              <div className="d-flex gap-2 align-items-center">
                <label className="small fw-semibold">Font:</label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={fontSize}
                  onChange={(e) => {
                    const newSize = parseInt(e.target.value) || 20
                    setFontSize(newSize)
                    // Update selected text font size
                    if (canvas) {
                      const activeObject = canvas.getActiveObject()
                      if (activeObject && activeObject.type === 'i-text') {
                        activeObject.set('fontSize', newSize)
                        canvas.renderAll()
                      }
                    }
                  }}
                  className="form-control form-control-sm"
                  style={{ width: '60px', borderRadius: '8px' }}
                />
              </div>

              {/* Zoom */}
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleZoomOut}
                  style={{ borderRadius: '12px', padding: '6px 12px' }}
                  title="Zoom Out"
                >
                  ➖
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleResetZoom}
                  style={{ borderRadius: '12px', padding: '6px 12px' }}
                  title="Reset Zoom"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleZoomIn}
                  style={{ borderRadius: '12px', padding: '6px 12px' }}
                  title="Zoom In"
                >
                  ➕
                </button>
              </div>

              {/* Actions */}
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={handleDelete}
                  style={{ borderRadius: '12px', padding: '6px 12px' }}
                  title="Delete Selected"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Container */}
          <div
            ref={containerRef}
            className="modal-body flex-grow-1"
            style={{
              padding: '20px',
              overflow: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#f5f5f5'
            }}
          >
            <canvas ref={canvasRef} style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
          </div>

          {/* Footer */}
          <div
            className="modal-footer"
            style={{
              borderTop: '1px solid #F3F4F6',
              padding: '20px 24px',
              borderRadius: '0 0 24px 24px'
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ borderRadius: '16px', padding: '10px 24px', fontWeight: '500' }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              style={{ borderRadius: '16px', padding: '10px 24px', fontWeight: '600' }}
            >
              ✓ Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageEditorModal
