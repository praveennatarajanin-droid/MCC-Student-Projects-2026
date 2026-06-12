import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FashionForward from '../components/FashionForward/FashionForward';
import SellerStories from '../components/SellerStories/SellerStories';
import { getAllProducts } from '../services/publicapi/productAPI';
import { getProductImageUrl } from '../utils/imageUtils';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await getAllProducts();
        if (response.success) {
          setFeaturedProducts(response.data.slice(0, 6));
        } else {
          setProductsError('Unable to load featured products');
          console.error('API Error:', response);
        }
      } catch (error) {
        setProductsError('Unable to load featured products: ' + error.message);
        console.error('Fetch Error:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const getImageUrl = (product) => getProductImageUrl(product);

  return (
    <div className="page-container">
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">Handcrafted with heart</p>
          <h1>Discover ethical home goods and artisan textiles made in South India.</h1>
          <p className="hero-description">
            Shop curated collections from Enterprises1, Enterprises2, and Enterprises3. Each purchase supports skilled artisans and sustainable livelihoods.
          </p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={() => navigate('/ProductPage')}>
              Shop the Collection
            </button>
            <button className="secondary-btn" onClick={() => navigate('/aboutpage')}>
              Learn Our Story
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <span>New Arrivals</span>
            <h2>Timeless textures, bold stories.</h2>
            <p>Explore designer home essentials, gift-ready accessories, and handcrafted pieces built to last.</p>
          </div>
        </div>
      </section>

      <section className="home-featured-products">
        <div className="section-header">
          <h2>Featured Products</h2>
          <p>Freshly added products from our artisan collections.</p>
        </div>

        {loadingProducts && <div className="loading">Loading featured products...</div>}
        {productsError && <div className="error-message">{productsError}</div>}

        <div className="product-grid-home">
          {featuredProducts.map((product) => (
            <div className="product-card-home" key={product._id}>
              <Link to={`/product/${product._id}`}>
                <img
                  className="product-image-home"
                  src={getImageUrl(product)}
                  alt={product.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder.svg';
                  }}
                />
              </Link>
              <div className="product-info-home">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p className="product-price-home">₹{product.new_price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="featured-panels">
        <FashionForward />
      </section>

      <section className="seller-stories-panel">
        <SellerStories />
      </section>

      <section className="bulk-orders">
        <div className="bulk-orders-content">
          <h2>Place a bulk order with us</h2>
          <div className="underline"></div>
          <p>
            We partner with store owners, corporate clients, event companies, and wholesale buyers. Every order is tailored to your needs and delivered with quality craftsmanship.
          </p>
          <div className="bulk-actions">
            <button className="bulk-orders-btn" onClick={() => navigate('/contactus')}>
              Get In Touch
            </button>
            <button className="bulk-btn" onClick={() => navigate('/bulkorders')}>
              Learn More
            </button>
          </div>
        </div>
        <div className="bulk-orders-image" />
      </section>
    </div>
  );
};

export default Home;
