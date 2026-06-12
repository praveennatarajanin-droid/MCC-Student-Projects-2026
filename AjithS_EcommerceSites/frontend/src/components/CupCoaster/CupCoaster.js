import React, { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { Stage, Layer, Circle, RegularPolygon, Rect } from "react-konva";
import DesignImage from "../NapkinCustomize/DesignImage";
import "./CupCoaster.css";
import * as htmlToImage from "html-to-image";

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

export default function CupCoasterCustomize() {
  const [color, setColor] = useState("#ffffff");
  const [placedDesigns, setPlacedDesigns] = useState([]);
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [selectedSavedIndex, setSelectedSavedIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(true);
  const [message, setMessage] = useState("");
  const [shape, setShape] = useState("circle"); // circle, square, hexagon

  const stageRef = useRef(null);
  const stageWrapperRef = useRef(null);

  // Load saved designs from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cupCoasterDesigns")) || [];
    setSavedDesigns(stored);

    if (stored.length > 0) {
      const last = stored[stored.length - 1];
      setPlacedDesigns(last.data || []);
      setColor(last.color || "#ffffff");
      setShape(last.shape || "circle");
      setSelectedSavedIndex(stored.length - 1);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }, []);

  const handleNewDesign = () => {
    setColor("#ffffff");
    setPlacedDesigns([]);
    setSelectedSavedIndex(null);
    setShape("circle");
    setIsEditing(true);
    setMessage("");
  };

  const handleDrop = (design) => {
    if (!isEditing) return;
    setPlacedDesigns([
      ...placedDesigns,
      { ...design, x: 200, y: 200, width: 120, height: 120 },
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
  if (!stageWrapperRef.current || !stageRef.current) return;
  try {
    const stage = stageRef.current;

    // Full canvas PNG
    const dataUrl = await htmlToImage.toPng(stageWrapperRef.current, {
      width: stage.width(),
      height: stage.height(),
    });

    // Small preview for sidebar
    const preview = await htmlToImage.toPng(stageWrapperRef.current, {
      width: 100,
      height: 100,
    });

    const newSaved = {
      preview,
      data: placedDesigns,
      color,
      shape,
    };

    const updatedLocal = [...savedDesigns, newSaved];
    setSavedDesigns(updatedLocal);
    localStorage.setItem("cupCoasterDesigns", JSON.stringify(updatedLocal));

    // ✅ Download in browser
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `cupcoaster-design-${Date.now()}.png`;
    link.click();

    // ✅ Save to backend
    const response = await fetch("http://localhost:5000/designs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "cupcoaster",
        description: "My custom cupcoaster design",
        imageBase64: dataUrl,
      }),
    });

    if (response.ok) {
      setMessage("✅ Design saved successfully!");
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
    setShape(saved.shape || "circle");
    setSelectedSavedIndex(index);
    setIsEditing(false);
    setMessage("");
  };

  const handleEdit = () => {
    if (selectedSavedIndex !== null) {
      const saved = savedDesigns[selectedSavedIndex];
      setPlacedDesigns(saved.data || []);
      setColor(saved.color || "#ffffff");
      setShape(saved.shape || "circle");
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
                src={d.src}
                alt="design"
                className="design-item sidebar-thumb"
                onClick={() => handleDrop(d)}
              />
            ))}
          </div>
        </div>

        <h2 className="sidebar-title">Shape</h2>
        <select value={shape} onChange={(e) => setShape(e.target.value)}>
          <option value="circle">Circle</option>
          <option value="triangle">Triangle</option>
          <option value="hexagon">Hexagon</option>
           <option value="square">Square</option> 
        </select>
      </div>

      {/* Canvas */}
      <div className="canvas-area" ref={stageWrapperRef}>
        <Stage ref={stageRef} width={500} height={500} className="canvas-stage">
          <Layer>
            {shape === "circle" && (
                <Circle width={500} height={500} fill={color} x={250} y={250} radius={250} />)}
            {shape === "triangle" && (
                <RegularPolygon sides={3} radius={250} fill={color} x={250} y={250} />)}
            {shape === "hexagon" && (
                <RegularPolygon sides={6} radius={250} fill={color} x={250} y={250} />)}
            {shape === "square" && (
                <Rect x={250-250} y={250-250} width={500} height={500} fill={color}/>)}



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
