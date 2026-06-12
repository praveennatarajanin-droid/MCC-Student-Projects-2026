import React, { useState } from 'react';

import './Customization.css';

// Image sources — use URLs or local imports
const sidebarItems = [
  { id: 'gray', type: 'color', label: 'Gray Napkin', src: '/images/gray.png'},
  {id: 'sandal', type: 'color', label: 'Sandal Napkin', src: '/images/sandal.png'},
    { id: 'floral', type: 'design', label: 'Floral Design', src: '/images/flo1.png' },


];

const CustomizationPage = () => {
  const [napkinColor, setNapkinColor] = useState(null); 
  const [droppedItems, setDroppedItems] = useState([]);

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('drag-item', JSON.stringify(item));
    e.dataTransfer.setData("drag-item-index", "")
  };

  const handleDesignDragStart = (e, index) => {
    e.dataTransfer.setData("drag-item-index", index);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const index = e.dataTransfer.getData('drag-item-index');
    const rawData = e.dataTransfer.getData('drag-item');

    const napkinArea = e.currentTarget.querySelector(".napkin-area");
    const areaRect = napkinArea.getBoundingClientRect();
     const x = e.clientX - areaRect.left - 40;
    const y = e.clientY - areaRect.top - 40;

    if (index !== "" && index !== null) {
    // Move existing design
    const updatedItems = [...droppedItems];
    updatedItems[index].position = { x, y };
    setDroppedItems(updatedItems);
    return;
  }
  
  if (!rawData) return; 
    const item = JSON.parse(rawData);

    if (item.type === "color") {
      // Replace napkin background
      setNapkinColor(item);
    }

  else if (item.type === 'design') {
    item.position = { x, y };
    setDroppedItems(prev => [...prev, item]);
  }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSaveDesign = () => {
    const designData = {
      napkinColor,
      designs: droppedItems,
    };

   
  const blob = new Blob([JSON.stringify(designData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "napkin_design.json";
  link.click();
  URL.revokeObjectURL(url);
  };


  return (
    <div className="customization-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h3>Choose Color</h3>
        {sidebarItems.filter(item => item.type === 'color').map(item => (
          <div
            key={item.id}
            className="sidebar-item"
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
          >
            <img src={item.src} alt={item.label} className="sidebar-image" />
            <p>{item.label}</p>
          </div>
        ))}

        <h3>Choose Design</h3>
        {sidebarItems
          .filter((item) => item.type === "design")
          .map((item) => (
          <div
            key={item.id}
            className="sidebar-item"
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
          >
            <img src={item.src} alt={item.label} className="sidebar-image" />
            <p>{item.label}</p>
          </div>
        ))}
      </div>

      {/* Canvas */}
      <div className="canvas" onDrop={handleDrop} onDragOver={handleDragOver}>
        <h2 className="canvas-title">Your Napkin Preview</h2>
        <div className="napkin-area">
          {/* Background napkin color */}
          {napkinColor && (
            <img
              src={napkinColor.src}
              alt={napkinColor.label}
              className="napkin-element color"
            />
          )}
        
           {droppedItems.map((item, index) => (
                <img
                  key={index}
                  src={item.src}
                  alt={item.label}
                  className="design-element"
                  draggable
                  onDragStart={(e) => handleDesignDragStart(e, index)}
                  style={{
                    top: item.position?.y,
                    left: item.position?.x,
                    position: 'absolute',
                     width: '80px',
                     height: '80px',
                     cursor: 'move',
                  }}
                />
              ))
            }
        </div>
          <button className="save-button" onClick={handleSaveDesign}>
          Save Design
        </button>
      </div>
    </div>
  );
};

export default CustomizationPage;
