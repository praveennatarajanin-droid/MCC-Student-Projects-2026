import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Bags.css';


import { getProductsByCategory } from '../services/publicapi/productAPI';
import { getProductImageUrl } from '../utils/imageUtils';

const Bags = () => {
  const navigate = useNavigate();

  const [bags, setBags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBags = async () => {
      try {
        setLoading(true);
        console.log('Fetching bags...');
        const response = await getProductsByCategory('Bag');
        console.log('Bags API response:', response);
        if (response && response.success) {
          console.log('Setting bags data:', response.data);
          setBags(response.data || []);
        } else {
          const errorMsg = response?.message || 'Failed to fetch bags';
          console.error('API Error:', errorMsg);
          setError(errorMsg);
        }
      } catch (error) {
        const errorMsg = error?.response?.data?.message || error.message || 'Error fetching bags';
        console.error('Fetch Error:', error);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchBags();
  }, []);

  const getImageUrl = (product) => getProductImageUrl(product);

  return (
    <div className="bags-page">
      <div className="bags-page-content">
        <h1>Welcome to the Bags Collection!</h1>

        {loading && <div className="loading">Loading bags...</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="product-grid">
          {bags.map((product) => (
            <div className="product-card" key={product._id}>
              <Link to={`/product/${product._id}`}>
                <img 
                  src={getImageUrl(product)} 
                  alt={product.name} 
                  className="product-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder.svg';
                  }}
                />
              </Link>

              <h3>{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <p className="product-size">Size: {product.size?.breadth}x{product.size?.height} {product.unit?.name}</p>
              <p className="product-price">₹{product.new_price}</p>
              <p className="original-price">Original Price: ₹{product.old_price}</p>
              {product.stock > 0 ? (
                <Link to={`/product/${product._id}`} className="view-details-btn">
                  View Details
                </Link>
              ) : (
                <button className="out-of-stock-btn" disabled>
                  Out of Stock
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="design-steps">
          <h3>Next Step for Design</h3>
          <div className="design-options">
            <div
              className="design-option"
              onClick={() => navigate("/browse-design")}
              role="button"
              aria-label="Browse Design"
            >
              Browse Design →
            </div>
            <div
              className="design-option"
              onClick={() => navigate("/customize/bag")}
              role="button"
              aria-label="Custom Design"
            >
              Custom Design →
            </div>
            <div
              className="design-option"
              onClick={() => navigate("/upload-design")}
              role="button"
              aria-label="Upload Design and Checkout"
            >
              Upload Design and Checkout →
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Bags;
