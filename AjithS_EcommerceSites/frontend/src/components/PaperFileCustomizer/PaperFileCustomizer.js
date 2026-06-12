import React, { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import Draggable from "react-draggable";
import "./PaperFile.css";

export default function PaperFileCustomizer() {
  const [activeStickers, setActiveStickers] = useState([]);
  const [savedDesigns, setSavedDesigns] = useState([]);
  const paperRef = useRef(null);

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

  const addSticker = (src) => {
    setActiveStickers([...activeStickers, { id: Date.now(), src, x: 50, y: 50 }]);
  };

  const handleDragStop = (e, data, id) => {
    setActiveStickers(prev => prev.map(s => s.id === id ? { ...s, x: data.x, y: data.y } : s));
  };

  const handleLoadDesign = (design) => {
    setActiveStickers(design.config.stickers || []);
  };

  const handleDownload = () => {
  if (!paperRef.current) return;

  const { offsetWidth: width, offsetHeight: height } = paperRef.current;

  toPng(paperRef.current, {
    cacheBust: true,
    useCORS: true,
    width,
    height,
  })
    .then((dataUrl) => {
      const newDesign = {
        image: dataUrl,
        config: { stickers: activeStickers },
        type: "paperfile",
      };

      setSavedDesigns([newDesign, ...savedDesigns]);

      fetch("http://localhost:5000/design/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDesign),
      })
        .then(async (res) => {
          if (!res.ok) {
            const err = await res.text();
            throw new Error(err);
          }
          return res.json();
        })
        .then((data) => console.log("Saved:", data))
        .catch((err) => console.error("Save failed:", err));
    })
    .catch(console.error);
};

  useEffect(() => {
    fetch("http://localhost:5000/designs?type=paperfile")
      .then(res => res.json())
      .then(data => setSavedDesigns(data))
      .catch(err => console.error("Load failed:", err));
  }, []);

  const handleDeleteDesign = (id) => {
    setSavedDesigns(prev => prev.filter(d => d._id !== id && d.id !== id));
    fetch("http://localhost:5000/design/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
      .then(res => res.json())
      .then(data => console.log("Deleted:", data))
      .catch(console.error);
  };

  return (
    <div className="paperfile-layout">
      <div className="sidebar">
        <h3>🌟 Stickers</h3>
        <div className="sticker-gallery">
          {stickers.map(sticker => (
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

      <div className="paperfile-container">
        <h1>📂 Paper File Customizer</h1>
        <div
          ref={paperRef}
          className="paperfile-preview"
          style={{
            backgroundImage: `url("/Images/paperfile.jpg")`,
          }}
        >
          {activeStickers.map(sticker => (
            <Draggable
              key={sticker.id}
              bounds="parent"
              position={{ x: sticker.x, y: sticker.y }}
              onStop={(e, data) => handleDragStop(e, data, sticker.id)}
            >
              <img
                src={sticker.src}
                alt="sticker"
                className="draggable-sticker"
                onDoubleClick={() => setActiveStickers(prev => prev.filter(s => s.id !== sticker.id))}
              />
            </Draggable>
          ))}
        </div>
        <button onClick={handleDownload}>💾 Save Design</button>
      </div>

      <div className="sidebar">
        <h3>📂 Saved Designs</h3>
        <div className="saved-gallery">
          {savedDesigns.map(design => (
            <div key={design._id || design.id} className="saved-design-wrapper">
              <img
                src={design.image}
                alt="saved"
                onClick={() => handleLoadDesign(design)}
              />
              <button onClick={() => handleDeleteDesign(design._id || design.id)}>❌</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
