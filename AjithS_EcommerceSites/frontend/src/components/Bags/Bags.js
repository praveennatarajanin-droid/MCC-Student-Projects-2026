import React, { useState, useRef, useEffect } from "react";
// import { toPng } from "html-to-image";
import Draggable from "react-draggable";
import "./Bags.css";

export default function BagCustomizer() {
  const [activeStickers, setActiveStickers] = useState([]);
  const [savedDesigns, setSavedDesigns] = useState([]);
  const bagRef = useRef(null);

  const bagImageUrl = "/Images/frontside.jpg";

  const proxify = (url) =>
    `http://localhost:5000/api/proxy?url=${encodeURIComponent(url)}`;

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
// Add a sticker at default position
  const addSticker = (src) => {
    setActiveStickers([
      ...activeStickers,
      { id: Date.now(), src, x: 50, y: 50 },
    ]);
  };
// Update sticker position after drag
  const handleDragStop = (e, data, id) => {
    setActiveStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, x: data.x, y: data.y } : s))
    );
  };

  //Save the img to db
const handleSaveDesign = async () => {
  const previewEl = bagRef.current;
  if (!previewEl) return;

  const rect = previewEl.getBoundingClientRect();
  const W = rect.width || 450;
  const H = rect.height || 600;

  const offscreen = document.createElement("canvas");
  offscreen.width = W;
  offscreen.height = H;
  const ctx = offscreen.getContext("2d");

  // 1. Draw the bag background image
  await new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, W, H);
      resolve();
    };
    img.onerror = resolve;
    img.src = bagImageUrl;
  });

  // 2. Draw each sticker at its saved position
  await Promise.all(
    activeStickers.map((sticker) =>
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.drawImage(img, sticker.x, sticker.y, 50, 50);
          resolve();
        };
        img.onerror = resolve;
        img.src = proxify(sticker.src);
      })
    )
  );

  const dataUrl = offscreen.toDataURL("image/png");

  const newDesign = {
    id: Date.now(),
    image: dataUrl,
    config: { stickers: activeStickers },
    type: "bag",
  };

  setSavedDesigns([newDesign, ...savedDesigns]);

  fetch("http://localhost:5000/design/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newDesign),
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    })
    .then((data) => console.log("Saved to DB:", data))
    .catch((err) => console.error("DB Save failed:", err));

  const link = document.createElement("a");
  link.download = "bag-design.png";
  link.href = dataUrl;
  link.click();
};

  const handleLoadDesign = (design) => {
    setActiveStickers(design.config.stickers || []);
  };

  const handleDeleteDesign = (id) => {
    setSavedDesigns((prev) => prev.filter((d) => d._id !== id && d.id !== id));
    fetch("http://localhost:5000/design/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Deleted from DB:", data))
      .catch(console.error);
  };

  useEffect(() => {
    fetch("http://localhost:5000/designs?type=bag")
      .then((res) => res.json())
      .then((data) => setSavedDesigns(data))
      .catch((err) => console.error("DB Load error:", err));
  }, []);

  return (
    <div className="bags-page">
      <div className="bags-layout">
        {/* Stickers Sidebar */}
        <aside className="sidebar stickers-sidebar">
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
        </aside>

        {/* Main Editor */}
        <main className="bags-main">
          <div className="bags-header">
            <h1>👜 Bag Customizer</h1>
            <p>Add stickers to your bag and save your design.</p>
          </div>

          <div
            ref={bagRef}
            className="bag-preview"
            style={{
              backgroundImage: `url(${bagImageUrl})`,
            }}
          >
        {activeStickers.map((sticker) => (
  <Draggable
    key={sticker.id}
    bounds="parent"
    defaultPosition={{ x: sticker.x, y: sticker.y }}
    onStop={(e, data) => handleDragStop(e, data, sticker.id)}
  >
    <img
      src={sticker.src}
      alt="sticker"
      style={{
        width: 50,
        height: 50,
        cursor: "grab",
        userSelect: "none",
        position: "absolute",
      }}
      draggable={false}
      crossOrigin="anonymous"
      onDoubleClick={() =>
        setActiveStickers((prev) => prev.filter((s) => s.id !== sticker.id))
      }
    />
  </Draggable>
))}
        </div>

          <div className="bag-actions">
            <button className="save-button" onClick={handleSaveDesign}>
              💾 Save Design
            </button>
          </div>
        </main>

        {/* Saved Designs Sidebar */}
        <aside className="sidebar saved-sidebar">
          <h3>📂 Saved Designs</h3>
          <div className="saved-gallery">
          {savedDesigns.map((design) => (
            <div key={design._id || design.id} className="saved-design-wrapper">
              <img
                src={design.image}
                alt="saved"
                className="saved-design-image"
                onClick={() => handleLoadDesign(design)}
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
      </aside>
    </div>
  </div>
  );
}
