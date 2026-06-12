import React, { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { Stage, Layer, Rect } from "react-konva";
import DesignImage from "./DesignImage";
import LineShape from "./LineShape";
import "./NapkinCustomize.css";
//import * as htmlToImage from "html-to-image";

const designs = [
  { id: 1, src: "/images/flo1.png", name: "flower" },
  { id: 2, src: "/images/flo3.png", name: "flower3" },
  { id: 3, src: "/images/flo5.png", name: "flower5" },
  { id: 4, src: "/images/flo6.png", name: "flower6" },
  { id: 5, name: "flower7",
    src: {
      orange: "/images/flo7.png",
      pink: "/images/flo7-1.png",
      purple: "/images/flo7-2.png",
      blue: "/images/flo7-3.png"
     },
     availableColors: ["orange","pink", "purple", "blue"]
    },

  { id: 6, src: "/images/flo8.png", name: "flower8" },
  { id: 7, name: "flower9",
    src: {
      pink: "/images/flo9.png",
      blue: "/images/flo9-1.png",
      orange: "/images/flo9-2.png"
     },
     availableColors: ["pink", "blue", "orange"]
    },

  { id: 8, name: "leaf",
    src: {
      green: "/images/leaf.png",
      yellow:"/images/leaf-1.png"
    },
   availableColors: ["green", "yellow"]
   },

  { id: 9, src: "/images/leaf2.png", name: "leaf2" },
];

export default function NapkinCustomize() {
  const [color, setColor] = useState("#ffffff");
  const [placedDesigns, setPlacedDesigns] = useState([]);
  const [placedLines, setPlacedLines] = useState([]);
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [selectedSavedIndex, setSelectedSavedIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");

  const [lineColor, setLineColor] = useState("#000000");
  const [lineThickness, setLineThickness] = useState(4);

   const [selectedDesign, setSelectedDesign] = useState(null); // currently selected design
  const [selectedDesignColor, setSelectedDesignColor] = useState(null); // currently chosen color for that design

  const stageRef = useRef(null);
  const stageWrapperRef = useRef(null);

  // Load saved designs from localStorage
  useEffect(() => {
  const stored = JSON.parse(localStorage.getItem("napkinDesigns")) || [];
  setSavedDesigns(stored);

  if (stored.length > 0) {
    const last = stored[stored.length - 1];
    setPlacedDesigns(last.data || []);
    setColor(last.color || "#ffffff");
    setSelectedSavedIndex(stored.length - 1);
    setIsEditing(false);
  }
}, []);


  const handleNewDesign = () => {
    setColor("#ffffff");
    setPlacedDesigns([]);
    setPlacedLines([]);
    setSelectedSavedIndex(null);
    setIsEditing(true);
    setMessage("");
  };

  const handleDrop = (design) => {
  if (!isEditing) return;

  let defaultColor = design.availableColors?.[0] || null;; 
  
  setSelectedDesign(design);
  setSelectedDesignColor(defaultColor);

  setPlacedDesigns([
    ...placedDesigns,
    { 
      ...design, 
      x: 200, 
      y: 200, 
      width: 120, 
      height: 120, 
      color: defaultColor,
      srcByColor: design.src,
      src: defaultColor ? design.src[defaultColor] : design.src,
    },
  ]);
};

  const updateDesignPosition = (index, newAttrs) => {
    const updated = placedDesigns.map((d, i) =>
      i === index ? { ...d, ...newAttrs } : d
    );
    setPlacedDesigns(updated);
  };

  const handleAddLine = (orientation) => {
    if (!isEditing) return;
    const newLine = {
      orientation,
      x: orientation === "vertical" ? 250 : 50,
      y: orientation === "horizontal" ? 250 : 50,
      length: 400,
      thickness: lineThickness,
      color: lineColor,
    };
    setPlacedLines([...placedLines, newLine]);
  };

  // ✅ Save design (full size + small preview)
  const handleSave = async () => {
  if (!stageRef.current) return;

  try {
    const stage = stageRef.current;

    await Promise.all(
      placedDesigns.map(d => {
        return new Promise(resolve => {
          const img = new window.Image();
          img.src = d.src;
          img.onload = resolve;
          img.onerror = resolve; // ignore errors
        });
      })
    );

    // Full-size PNG
    const dataUrl = stage.toDataURL({ pixelRatio: 2 });

    // Small preview for sidebar
    const preview = stage.toDataURL({ width: 100, height: 100 });

    const newSaved = {
      preview,
      data: placedDesigns,
      lines: placedLines,
      color,
    };
    const updatedLocal = [...savedDesigns, newSaved];
    setSavedDesigns(updatedLocal);
    localStorage.setItem("napkinDesigns", JSON.stringify(updatedLocal));

    const response = await fetch("http://localhost:5000/designs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "napkin",
        description: "My custom napkin design",
        imageBase64: dataUrl,
      }),
    });

    const result = await response.json();

    if (response.ok) {

    // Download full-size PNG
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `napkin-design-${Date.now()}.png`;
    link.click();

    // Save to backend
    
      setMessage("✅ Design saved successfully!");
      setIsEditing(false);
      setSelectedSavedIndex(updatedLocal.length - 1);
    } else {
      setMessage("❌ Failed to save design.");
      console.error("Backend error : ", result);
    }
  } catch (error) {
    console.error(error);
    setMessage("❌ Error saving design.");
  }
};


  const handleLoadSaved = (saved, index) => {
    setPlacedDesigns(saved.data || []);
    setPlacedLines(saved.lines || []);
    setColor(saved.color || "#ffffff");
    setSelectedSavedIndex(index);
    setIsEditing(false);
    setMessage("");
  };

  const handleEdit = () => {
    if (selectedSavedIndex !== null) {
      const saved = savedDesigns[selectedSavedIndex];
      setPlacedDesigns(saved.data || []);
      setPlacedLines(saved.lines || []);
      setColor(saved.color || "#ffffff");
      setIsEditing(true);
      setMessage("");
    }
  };

  return (
    <div className="customizer-container">
      {/* Left Sidebar */}
      <div className="sidebar">
        <button className="new-btn" onClick={handleNewDesign}>
          + New Design
        </button>

        <h2 className="sidebar-title">Choose Color</h2>
        <HexColorPicker color={color} onChange={setColor} />

        <h2 className="sidebar-title">Designs</h2>
        <div className="designs-container">
          <div className="design-grid">
            {designs.map((d) => (
              <img
                key={d.id}
                src={d.availableColors ? d.src[d.availableColors[0]] : d.src}
                alt="design"
                className="design-item sidebar-thumb"
                onClick={() => handleDrop(d)}
              />
            ))}
          </div>
        </div>
        {selectedDesign && (
  <div className="design-colors">
    <h4>Available Colors:</h4>
    <div className="color-options">
      {selectedDesign?.availableColors?.map((c) => (
        <div
          key={c}
          className="color-circle"
          style={{
            backgroundColor: c,
            border: c === selectedDesignColor ? "2px solid black" : "1px solid gray",
          }}
          onClick={() => {
            setSelectedDesignColor(c);

            // Update the last placed design color
            const updated = placedDesigns.map((d, i) =>
              i === placedDesigns.length - 1 ? { ...d, color: c, src: d.srcByColor?.[c] || d.src} : d
            );
            setPlacedDesigns(updated);
          }}
        />
      ))}
    </div>
  </div>
)}


        <h2 className="sidebar-title">Lines & Controls</h2>
        <div className="line-controls">
          <button onClick={() => handleAddLine("vertical")}>+</button>
          <button onClick={() => handleAddLine("horizontal")}>+ Horizontal Line</button>
          <div className="line-color-thickness">
            <label>Color:</label>
            <input type="color" value={lineColor} onChange={(e) => setLineColor(e.target.value)} />
          </div>
          <div className="line-thickness">
            <label>Thickness:</label>
            <input
              type="range"
              min="2"
              max="20"
              value={lineThickness}
              onChange={(e) => setLineThickness(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="canvas-area" ref={stageWrapperRef}>
        <Stage ref={stageRef} width={500} height={500} className="canvas-stage">
          <Layer>
            <Rect width={500} height={500} fill={color} />
            {placedLines.map((line, i) => (
              <LineShape
                key={i}
                {...line}
                isEditing={isEditing}
                onChange={(newAttrs) => {
                  const updated = placedLines.map((l, idx) =>
                    idx === i ? { ...l, ...newAttrs } : l
                  );
                  setPlacedLines(updated);
                }}
              />
            ))}
            {placedDesigns.map((d, i) => (
              <DesignImage
                key={`${d.src}-${i}`}
                src={d.src}
                x={d.x}
                y={d.y}
                width={d.width}
                height={d.height}
                isEditing={isEditing}
                onChange={(newAttrs) => updateDesignPosition(i, newAttrs)}
              />
            ))}
          </Layer>
        </Stage>

        <button className="save-btn" onClick={handleSave} disabled={!isEditing}>
          Save Design
        </button>

        {message && <p className="message">{message}</p>}
      </div>

      {/* Right Sidebar */}
      <div className="saved-sidebar">
        <h2 className="sidebar-title">Saved Designs</h2>
        <button className="edit-btn" onClick={handleEdit} disabled={selectedSavedIndex === null}>
          Edit
        </button>
        <div className="saved-designs-container">
          <div className="design-grid">
            {savedDesigns.map((d, i) => (
              <img
                key={i}
                src={d.preview}
                alt="saved"
                className={`design-item sidebar-thumb ${i === selectedSavedIndex ? "selected" : ""}`}
                onClick={() => handleLoadSaved(d, i)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
