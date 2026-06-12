import React, { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { Stage, Layer, Rect } from "react-konva";
import DesignImage from "../NapkinCustomize/DesignImage";
import "./BedSheets.css";

const designs = [
  { id: 1, src: "/images/flo1.png", name: "flower" },
  { id: 2, src: "/images/flo3.png", name: "flower3" },
  { id: 3, src: "/images/flo5.png", name: "flower5" },
  { id: 4, src: "/images/flo6.png", name: "flower6" },
  { id: 5, src: "/images/flo7.png", name: "flower7" },
  { id: 6, src: "/images/flo8.png", name: "flower8" },
  { id: 7, src: "/images/flo9.png", name: "flower9" },
  { id: 8, src: "/images/leaf.png", name: "leaf" },
  { id: 9, src: "/images/leaf2.png", name: "leaf2" },
];

export default function BedsheetCustomize() {
  const [color, setColor] = useState("#ffffff");
  const [placedDesigns, setPlacedDesigns] = useState([]);
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [selectedSavedIndex, setSelectedSavedIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(true);
  const [message, setMessage] = useState("");

  const stageRef = useRef(null);

  // Load saved designs from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("bedsheetDesigns")) || [];
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
    setSelectedSavedIndex(null);
    setIsEditing(true);
    setMessage("");
  };

  const handleDrop = (design) => {
    if (!isEditing) {
      setIsEditing(true);
    }
    setPlacedDesigns([
      ...placedDesigns,
      { ...design, x: 200, y: 200, width: 150, height: 150 },
    ]);
  };

  const updateDesignPosition = (index, newAttrs) => {
    const updated = placedDesigns.map((d, i) =>
      i === index ? { ...d, ...newAttrs } : d
    );
    setPlacedDesigns(updated);
  };

  // Save design (full + preview + DB + download)
const handleSave = async () => {
  if (!stageRef.current) return;
  try {
    const stage = stageRef.current;

    // Full canvas PNG using Konva output for reliable stage capture
    const dataUrl = stage.toDataURL({ mimeType: "image/png", pixelRatio: 2 });

    // Small preview for sidebar
    const preview = stage.toDataURL({ mimeType: "image/png", pixelRatio: 0.2 });

    const newSaved = {
      preview,
      data: placedDesigns,
      color,
    };

    const updatedLocal =
      selectedSavedIndex !== null
        ? savedDesigns.map((d, i) => (i === selectedSavedIndex ? newSaved : d))
        : [...savedDesigns, newSaved];

    if (selectedSavedIndex === null) {
      setSelectedSavedIndex(updatedLocal.length - 1);
    }

    setSavedDesigns(updatedLocal);
    localStorage.setItem("bedsheetDesigns", JSON.stringify(updatedLocal));

    // ✅ Download in browser
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `bedsheet-design-${Date.now()}.png`;
    link.click();

    // ✅ Save to backend
    const response = await fetch("http://localhost:5000/designs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "bedsheet",
        description: "My custom bedsheet design",
        imageBase64: dataUrl,
      }),
    });

    if (response.ok) {
      setMessage("✅ Bedsheet design saved!");
      setIsEditing(false);
      setSelectedSavedIndex(updatedLocal.length - 1);
    } else {
      setMessage("❌ Failed to save design.");
      console.error(await response.json());
    }
  } catch (error) {
    console.error(error);
    setMessage("❌ Error saving design.");
  }
};


  const handleLoadSaved = (saved, index) => {
    setPlacedDesigns(saved.data || []);
    setColor(saved.color || "#ffffff");
    setSelectedSavedIndex(index);
    setIsEditing(false);
    setMessage("");
  };

  const handleEdit = () => {
    if (selectedSavedIndex !== null) {
      setIsEditing(true);
      setMessage("Editing saved design...");
    }
  };

  const handleDeleteSaved = (index) => {
    const updatedSaved = savedDesigns.filter((_, i) => i !== index);
    localStorage.setItem("bedsheetDesigns", JSON.stringify(updatedSaved));
    setSavedDesigns(updatedSaved);

    if (selectedSavedIndex === index) {
      setSelectedSavedIndex(null);
      setPlacedDesigns([]);
      setColor("#ffffff");
      setIsEditing(true);
      setMessage("Saved design deleted.");
    } else if (selectedSavedIndex !== null && selectedSavedIndex > index) {
      setSelectedSavedIndex(selectedSavedIndex - 1);
    }
  };

  return (
    <div className="bedsheet-customizer customizer-container">
      {/* Left Sidebar */}
      <div className="sidebar">
        <button className="new-btn" onClick={handleNewDesign}>
          + New Design
        </button>

        <h2 className="sidebar-title">Choose Bedsheet Color</h2>
        <HexColorPicker color={color} onChange={setColor} />

        <h2 className="sidebar-title">Designs</h2>
        <div className="designs-container">
          <div className="design-grid">
            {designs.map((d) => (
              <img
                key={d.id}
                src={d.src}
                alt="design"
                className="design-item sidebar-thumb"
                onClick={() => handleDrop(d)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="canvas-area">
        <div className="canvas-stage-wrapper">
          <Stage
            ref={stageRef}
            width={740}
            height={620}
            className="canvas-stage"
            style={{ width: "100%", height: "auto" }}
          >
            <Layer>
              {/* Bedsheet Background */}
              <Rect width={740} height={500} fill={color} />

              {/* Placed Designs */}
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
        </div>

        <button className="save-btn" onClick={handleSave}>
          Save Bedsheet
        </button>

        {message && <p className="message">{message}</p>}
      </div>

      {/* Right Sidebar */}
      <div className="saved-sidebar">
        <h2 className="sidebar-title">Saved Designs</h2>
        <button
          className="edit-btn"
          onClick={handleEdit}
          disabled={selectedSavedIndex === null}
        >
          Edit
        </button>
        <div className="saved-designs-container">
          <div className="design-grid">
            {savedDesigns.map((d, i) => (
              <div
                key={i}
                className={`saved-design-card ${
                  i === selectedSavedIndex ? "selected" : ""
                }`}
                onClick={() => handleLoadSaved(d, i)}
              >
                <img
                  src={d.preview}
                  alt="saved"
                  className="design-item sidebar-thumb"
                />
                <button
                  type="button"
                  className="delete-saved-btn"
                  aria-label="Delete saved design"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSaved(i);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
