import React, { useRef, useEffect } from 'react';
import { Canvas, Image as FabricImage } from 'fabric'; // Named imports from fabric.js
import { useNavigate } from 'react-router-dom'; // Import useNavigate from React Router
import './UploadDesignAndCheckout.css';


const UploadDesignAndCheckout = () => {
  const canvasRef = useRef(null);
  const navigate = useNavigate(); // Initialize navigate function

  useEffect(() => {
    // Initialize fabric.js canvas
    const canvas = new Canvas('designCanvas', {
      width: 600,
      height: 400,
      backgroundColor: '#f0f0f0',
    });
    canvasRef.current = canvas;

    return () => {
      if (canvasRef.current) {
        canvasRef.current.dispose();
        canvasRef.current = null;
      }
    };
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const fabricImg = new FabricImage(img, {
            left: 50,
            top: 50,
            scaleX: 0.5,
            scaleY: 0.5,
          });
          canvasRef.current.add(fabricImg);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckout = () => {
    alert('Proceeding to checkout...');
    navigate('/Checkout'); // Navigate to the Custom Design Page
  };

  return (
    <div className="upload-design-page">
      <h1>Upload Your Design</h1>
      <div className="upload-section">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="upload-input"
        />
        <button
          className="clear-canvas-btn"
          onClick={() => canvasRef.current.clear()}
        >
          Clear Canvas
        </button>
      </div>
      <div className="canvas-container">
        <canvas id="designCanvas"></canvas>
      </div>
      <div className="checkout-section">
        <button className="checkout-btn" onClick={handleCheckout}>
          Checkout
        </button>
      </div>
      
    </div>
  );
};

export default UploadDesignAndCheckout;
