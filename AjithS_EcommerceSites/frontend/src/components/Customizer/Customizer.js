import React, { useState, useRef, useEffect } from "react";
import "./Customizer.css";
import { toPng } from "html-to-image";
import Draggable from "react-draggable";

export default function Customizer() {
  const [color, setColor] = useState("#6493a4");
  const [pattern, setPattern] = useState("stripes");
  const [prompt, setPrompt] = useState("");
  const [activeStickers, setActiveStickers] = useState([]);
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiImage, setAiImage] = useState(null);
  const [warningMessage, setWarningMessage] = useState('');
  const towelRef = useRef(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  // ------------------ Helper ------------------
  const proxify = (url) =>
    `http://localhost:5000/api/proxy?url=${encodeURIComponent(url)}`;

  // ------------------ Patterns ------------------
  const patterns = [
    { value: "stripes", label: "Stripes", preview: "https://www.transparenttextures.com/patterns/textured-stripes.png" },
    { value: "floral", label: "Floral", preview: "https://www.transparenttextures.com/patterns/flowers.png" },
    { value: "waves", label: "Waves", preview: "https://www.transparenttextures.com/patterns/wavecut.png" },
    { value: "dots", label: "Dots", preview: "https://www.transparenttextures.com/patterns/worn-dots.png" },
    { value: "chevron", label: "Chevron", preview: "https://www.transparenttextures.com/patterns/zig-zag.png" },
    { value: "cubes", label: "Cubes", preview: "https://www.transparenttextures.com/patterns/psychedelic.png" },
    { value: "diamonds", label: "Diamonds", preview: "https://www.transparenttextures.com/patterns/diagmonds-light.png" },
    { value: "abstract", label: "Abstract", preview: "https://www.transparenttextures.com/patterns/triangles.png" },
    { value: "bricks", label: "Bricks", preview: "https://www.transparenttextures.com/patterns/brick-wall.png" },
    { value: "fabric", label: "Fabric", preview: "https://www.transparenttextures.com/patterns/argyle.png" },
    { value: "carbon", label: "Carbon Fiber", preview: "https://www.transparenttextures.com/patterns/carbon-fibre.png" },
    { value: "wood", label: "Wood", preview: "https://www.transparenttextures.com/patterns/wood-pattern.png" },
    { value: "geometric", label: "Geometric", preview: "https://www.transparenttextures.com/patterns/black-thread-light.png" },
    { value: "grid", label: "Grid", preview: "https://www.transparenttextures.com/patterns/grid-me.png" },
    { value: "clouds", label: "Clouds", preview: "https://www.transparenttextures.com/patterns/fresh-snow.png" },
    { value: "brush", label: "Brush", preview: "https://www.transparenttextures.com/patterns/subtle-white-feathers.png" },
  ];

  // ------------------ Stickers ------------------
  const stickers = [
    { id: 1, src: "https://img.icons8.com/color/96/flower.png" },
    { id: 2, src: "https://img.icons8.com/color/96/star.png" },
    { id: 3, src: "https://img.icons8.com/emoji/96/red-heart.png" },
    { id: 4, src: "https://img.icons8.com/color/96/butterfly.png" },
    { id: 5, src: "https://img.icons8.com/color/96/sun.png" },
    { id: 6, src: "https://img.icons8.com/color/96/leaf.png" },
    { id: 7, src: "https://img.icons8.com/color/96/moon.png" },
    { id: 8, src: "https://img.icons8.com/color/96/cloud.png" },
    { id: 9, src: "https://img.icons8.com/color/96/rainbow.png" },
    { id: 10, src: "https://img.icons8.com/color/96/snowflake.png" },
    { id: 11, src: "https://img.icons8.com/color/96/unicorn.png" },
    { id: 12, src: "https://img.icons8.com/color/96/cat.png" },
  ];

  // ------------------ Add sticker ------------------
  const addSticker = (src) => {
    setActiveStickers([...activeStickers, { id: Date.now(), src, x: 50, y: 50 }]);
  };

  // ------------------ Drag stop handler ------------------
  const handleDragStop = (e, data, id) => {
    setActiveStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, x: data.x, y: data.y } : s))
    ); 
  };

  // ------------------ Download + Save Design ------------------
  const handleDownload = async () => {
  const previewEl = towelRef.current;
  if (!previewEl) return;

  const rect = previewEl.getBoundingClientRect();
  const W = rect.width   || 700;
  const H = rect.height  || 420;

  const offscreen = document.createElement("canvas");
  offscreen.width  = W;
  offscreen.height = H;
  const ctx = offscreen.getContext("2d");

  // 1. Fill background color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, H);

  // 2. Draw pattern texture (if not AI)
  if (pattern !== "ai-generated") {
    const patternUrl = patterns.find((p) => p.value === pattern)?.preview;
    if (patternUrl) {
      await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const pat = ctx.createPattern(img, "repeat");
          if (pat) {
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = pat;
            ctx.fillRect(0, 0, W, H);
            ctx.globalAlpha = 1;
          }
          resolve();
        };
        img.onerror = resolve; // skip if CORS fails
        img.src = proxify(patternUrl);
      });
    }
  }

  // 3. Draw AI image (if active)
  if (pattern === "ai-generated" && aiImage) {
    await new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.drawImage(img, 0, 0, W, H);
        resolve();
      };
      img.onerror = resolve;
      img.src = aiImage;
    });
  }

  // 4. Draw each sticker at its current dragged position
  await Promise.all(
    activeStickers.map((sticker) =>
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.drawImage(img, sticker.x, sticker.y, 60, 60);
          resolve();
        };
        img.onerror = resolve;
        img.src = proxify(sticker.src);
      })
    )
  );

  const dataUrl = offscreen.toDataURL("image/png");

  // Save + download
  const newDesign = {
    id: Date.now(),
    image: dataUrl,
    config: { color, pattern, stickers: activeStickers, aiImage },
    type: "towel",
  };
  setSavedDesigns([newDesign, ...savedDesigns]);

  fetch("http://localhost:5000/design/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newDesign),
  }).catch((err) => console.error("DB Save error:", err));

  const link = document.createElement("a");
  link.download = "towel-design.png";
  link.href = dataUrl;
  link.click();
};

  // ------------------ Image Normalizer ------------------
  const normalizeImage = (image) => {
    if (!image) return "";
    if (typeof image === "string" && image.startsWith("data:image")) return image;
    if (typeof image === "string") return `data:image/png;base64,${image}`;
    if (image.data) {
      const base64 = btoa(String.fromCharCode(...new Uint8Array(image.data)));
      return `data:image/png;base64,${base64}`;
    }
    return "";
  };

  // ------------------ Load saved design onto canvas ------------------
  const loadDesign = (design) => {
    setColor(design.config.color);
    setActiveStickers(design.config.stickers || []);
    if (design.config.pattern === "ai-generated") {
      setPattern("ai-generated");
      setAiImage(normalizeImage(design.config.aiImage || design.image));
    } else {
      setPattern(design.config.pattern);
      setAiImage(null);
    }
  };

  // ------------------ Delete a saved design ------------------
  const handleDeleteDesign = (id) => {
    setSavedDesigns((prev) => prev.filter((d) => d._id !== id && d.id !== id));
    fetch("http://localhost:5000/design/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Deleted from DB:", data))
      .catch((err) => console.error(err));
  };

  // ------------------ AI Generate ------------------
  const handleAIGenerate = async () => {
    if (!prompt.trim()) return alert("Please enter a prompt!");
    setAiLoading(true);
    setWarningMessage('');
    try {
      const res = await fetch("http://localhost:5000/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!res.ok) {
        const detail = data?.detail;
        const detailText = detail
          ? typeof detail === 'string'
            ? detail
            : JSON.stringify(detail)
          : '';
        const errorText = data?.error || `HTTP ${res.status}`;
        const message = detailText ? `${errorText} — ${detailText}` : errorText;
        alert(`AI generation failed: ${message}`);
        console.error('AI Error:', message);
        return;
      }

      if (data.image) {
        if (data.warning) {
          setWarningMessage(data.warning);
        }

        const normalized = data.image.startsWith("data:image")
          ? data.image
          : `data:image/png;base64,${data.image}`;
        setAiImage(normalized);
        setPattern("ai-generated");

        const newDesign = {
          id: Date.now(),
          image: normalized,
          config: { color, pattern: "ai-generated", stickers: activeStickers, aiImage: normalized },
          type: "towel"
        };
        setSavedDesigns((prev) => [newDesign, ...prev]);
        fetch("http://localhost:5000/design/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newDesign),
        }).catch((err) => console.error('Save design error:', err));
      } else {
        alert('AI did not return an image.');
      }
    } catch (err) {
      console.error("AI Error:", err);
      alert('AI generation failed: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="customizer-page">
      <div className="customizer-layout">
        {/* Stickers Sidebar */}
        <div className="sidebar">
          <h3>🌟 Stickers</h3>
          <div className="sticker-gallery">
          {stickers.map((sticker) => (
            <img
              key={sticker.id}
              src={sticker.src}
              alt="sticker"
              className="sticker-thumb"
              onClick={() => addSticker(sticker.src)}
            />
          ))}
        </div>
      </div>

      {/* Main Editor */}
      <div className="customizer-container">
        <h1 className="title">🧵 Towel Customizer</h1>
        <p className="subtitle">Choose patterns, colors & drag stickers</p>

        <textarea
          className="prompt-box"
          placeholder="Enter an image prompt like 'a vibrant towel with floral motifs and golden borders on a soft cotton background'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <button className="generate-btn" onClick={handleAIGenerate} disabled={aiLoading}>
          {aiLoading ? "🤖 Generating..." : "✨ AI Generate from Prompt"}
        </button>
        {warningMessage && (
          <div className="warning-message">
            ⚠️ {warningMessage}
          </div>
        )}

        <div className="controls">
          <div className="control-card">
            <label>🎨 Pick a Color</label>
            <input
              type="color"
              value={color.length === 9 ? color.slice(0, 7) : color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>

          <div className="control-card">
            <label>🖌 Choose Pattern</label>
            <select value={pattern} onChange={(e) => setPattern(e.target.value)}>
              {patterns.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
              <option value="ai-generated">🤖 AI Generated</option>
            </select>
          </div>
        </div>

        <div
  ref={towelRef}
  className="towel-preview"
  style={{
    backgroundColor: color,
    backgroundImage:
      pattern !== "ai-generated"
        ? `url(${patterns.find((p) => p.value === pattern)?.preview})`
        : "none",
    backgroundSize: "150px 150px",
    backgroundRepeat: "repeat",
    position: "relative",
  }}
>
  {/* AI Image Layer */}
  {pattern === "ai-generated" && aiImage && (
    <img
  src={aiImage}
  alt="AI Design"
  className="ai-background"
  style={{
    width: "100%",
    height: "100%",
    objectFit: "contain", 
    objectPosition: "center",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 0,
  }}
/>
  )}

  {/* Stickers go on top */}
  {activeStickers.map((sticker) => (
 <Draggable
    key={sticker.id}
    bounds="parent"
    defaultPosition={{ x: sticker.x, y: sticker.y }}
    onStop={(e, data) => handleDragStop(e, data, sticker.id)}
  >
    <div style={{ position: "absolute", zIndex: 10, cursor: "grab" }}>
      {/* removed left/top — Draggable's transform handles positioning */}
      <img
        src={sticker.src}
        alt="sticker"
        className="draggable-sticker"
        draggable={false}
        crossOrigin="anonymous"
        onDoubleClick={() =>
          setActiveStickers(activeStickers.filter((s) => s.id !== sticker.id))
        }
      />
    </div>
  </Draggable>

  ))}
</div>

        <button className="generate-btn" onClick={handleDownload}>
          💾 Save Design
        </button>
      </div>

      {/* Saved Designs Sidebar */}
      <div className="saved-sidebar">
        <h3>📂 Saved Designs</h3>
        <div className="saved-gallery">
          {savedDesigns.map((design) => (
            <div key={design._id || design.id} className="saved-design-wrapper">
              <img
                src={normalizeImage(design.image)}
                alt="saved design"
                className="sticker-thumb"
                onClick={() => loadDesign(design)}
              />
              <button
                className="delete-btn"
                onClick={() => handleDeleteDesign(design._id || design.id)}
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
  );
}
