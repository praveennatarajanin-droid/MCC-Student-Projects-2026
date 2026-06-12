import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Towels.css';


import { getProductsByCategory } from '../services/publicapi/productAPI';
import { getProductImageUrl } from '../utils/imageUtils';

const Towels = () => {
  const navigate = useNavigate();

  const [towels, setTowels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTowels = async () => {
      try {
        setLoading(true);
        const response = await getProductsByCategory('Towel');
        if (response && response.success) {
          setTowels(response.data);
        } else {
          const msg = response?.message || 'Failed to fetch towels';
          setError(`Error fetching towels: ${msg}`);
          console.error('API Error details:', response);
        }
      } catch (error) {
        const detailed = error?.message || JSON.stringify(error);
        setError('Error fetching towels: ' + detailed);
        console.error('Fetch Error (exception):', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTowels();
  }, []);

  const getImageUrl = (product) => getProductImageUrl(product);

  return (
    <div className="towels-page">
      <div className="towels-page-content">
        <h1>Welcome to the Towels Collection!</h1>

        {loading && <div className="loading">Loading towels...</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="product-grid">
          {towels.map((product) => (
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
              <p className="product-size">Size: {product.size.breadth}x{product.size.height} {product.unit?.name}</p>
              <p className="product-price">₹{product.new_price}</p>
              <p className="original-price">Original Price: ₹{product.old_price}</p>
              <Link to={`/product/${product._id}`} className="view-details-btn">
                View Details
              </Link>
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
              onClick={() => navigate("/customize/towel")}
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

export default Towels;
