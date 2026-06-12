import React, { useState, useEffect } from "react";
import "./Header.css";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faChevronDown, faUser, faSignOutAlt, faUserCircle, faShoppingCart, faHeart, faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import { useUser } from '../../Context/UserContext';
import { useCart } from '../../Context/CartContext';
import { useWishlist } from '../../Context/WishlistContext';
import axios from 'axios';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout: contextLogout, user } = useUser();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isworksOpen, setIsworksOpen] = useState(false);
  const [userName, setUserName] = useState("");

  const productCategories = [
    { name: "Paper Files", path: "/paperfiles" },
    { name: "Towels", path: "/towels" },
    { name: "Bags", path: "/bags" },
    { name: "Napkins", path: "/napkins" },
    { name: "Bedsheets", path: "/bedsheets" },
    { name: "Cup Coasters", path: "/cupcoaster" }
  ];

  const worksCategories = [
    { name: "Blockprinting", path: "/block" },
    { name: "Tailoring", path: "/tailoring" },
    { name: "Handmade Products", path: "/handmade" },
    
  ];

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/user/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.success && response.data.data.name) {
        setUserName(response.data.data.name);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.products-dropdown')) {
        setIsProductsOpen(false);
      }
    };

    

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.works-dropdown')) {
        setIsworksOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/public/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.products);
      } else {
        console.error("Search failed:", data.message);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setSearchResults([]);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const toggleProducts = (e) => {
    e.stopPropagation();
    setIsProductsOpen(!isProductsOpen);
  };

  const toggleworks = (e) => {
    e.stopPropagation();
    setIsworksOpen(!isworksOpen);
  };

  const handleLogout = async () => {
    contextLogout();
    navigate('/loginsignup', { replace: true });  // Use replace to prevent back navigation
  };

  const handleProductClick = () => {
    setSearchResults([]);  // Clear search results
    setQuery("");         // Clear search query
    setIsProductsOpen(false); // Close products dropdown
    setIsworksOpen(false);   // Close works dropdown
  };

  return (
    <div className="header-container">
      <div className="announcement-bar">
        Free Shipping on Orders Above ₹499! | Easy Returns | COD Available
      </div>

      <div className="top-bar">
        <div className="logo">
          <Link to="/" onClick={handleProductClick}>
          <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>Unity Threads</h2>
      <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>ஒன்றிணை நூலிழை</h2>
          </Link>
        </div>

        <div className="top-right">
          <div className="search-container">
            <div className="search-bar">
              {isAuthenticated && (
                <>
                  <div className="login-indicator">
                    <span className="status-dot"></span>
                    <span>Logged In</span>
                  </div>
                  <div className="user-welcome">
                    <FontAwesomeIcon icon={faUser} className="user-icon" />
                    <span className="user-name">Hi, {userName || 'User'}</span>
                  </div>
                </>
              )}
              <input
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                placeholder="Search products..."
              />
              <button className="search-button" onClick={handleSearch}>
                <FontAwesomeIcon icon={faSearch} />
              </button>
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((product) => (
                    <Link 
                      to={`/product/${product._id}`} 
                      key={product._id} 
                      className="search-result-item"
                      onClick={handleProductClick}
                    >
                      <img 
                        src={
                          product.image_url
                            ? (product.image_url.startsWith && product.image_url.startsWith('http')
                                ? product.image_url
                                : `http://localhost:5000${product.image_url}`)
                            : 'https://via.placeholder.com/40'
                        }
                        alt={product.name}
                        onError={(e) => {
                          console.log('Image failed to load:', product.image_url);
                          e.target.src = 'https://via.placeholder.com/40';
                        }}
                      />
                      <div className="search-result-info">
                        <div className="search-result-name">{product.name}</div>
                        <div className="search-result-price">₹{product.new_price}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {query && searchResults.length === 0 && (
                <div className="search-results">
                  <div className="no-results">No products found</div>
                </div>
              )}
            </div>
          </div>
          <div className="account-links">
            {isAuthenticated ? (
              <>
                <Link to="/wishlist" className="account-link wishlist-link">
                  <FontAwesomeIcon icon={faHeart} />
                  {wishlistCount > 0 && <span className="wishlist-count">{wishlistCount}</span>}
                  <span>WISHLIST</span>
                </Link>
                <Link to="/orders" className="account-link orders-link">
                  <FontAwesomeIcon icon={faBoxOpen} />
                  <span>MY ORDERS</span>
                </Link>
                <Link to="/cart" className="account-link cart-link">
                  <FontAwesomeIcon icon={faShoppingCart} />
                  {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                  <span>CART</span>
                </Link>
                <Link to="/profile" className="account-link">
                  <FontAwesomeIcon icon={faUserCircle} />
                  <span>PROFILE</span>
                </Link>
                <button onClick={handleLogout} className="account-link">
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  <span>LOGOUT</span>
                </button>
              </>
            ) : (
              <Link to="/loginsignup" className="account-link">
                <FontAwesomeIcon icon={faUser} />
                <span>SIGNUP/SIGNIN</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <nav className="main-nav">
        <ul>
          <li><Link to="/" onClick={handleProductClick}>HOME</Link></li>
          <li><Link to="/aboutpage" onClick={handleProductClick}>ABOUT US</Link></li>
          <li className={`products-dropdown ${isProductsOpen ? 'active' : ''}`}>
            <div className="nav-link" onClick={toggleProducts}>
              PRODUCTS <FontAwesomeIcon icon={faChevronDown} className={`dropdown-icon ${isProductsOpen ? 'open' : ''}`} />
            </div>
            <div className={`dropdown-menu ${isProductsOpen ? 'show' : ''}`}>
              {productCategories.map((category) => (
                <Link 
                  key={category.path} 
                  to={category.path}
                  className="dropdown-item"
                  onClick={handleProductClick}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </li>
          <li className={`works-dropdown ${isworksOpen ? 'active' : ''}`}>
            <div className="nav-link" onClick={toggleworks}>
              Our Works <FontAwesomeIcon icon={faChevronDown} className={`dropdown-icon ${isworksOpen ? 'open' : ''}`} />
            </div>
            <div className={`dropdown-menu ${isworksOpen ? 'show' : ''}`}>
              {worksCategories.map((category) => (
                <Link 
                  key={category.path} 
                  to={category.path}
                  className="dropdown-item"
                  onClick={handleProductClick}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </li>
          <li><Link to="/gallery" onClick={handleProductClick}>GALLERY</Link></li>
          <li><Link to="/contactus" onClick={handleProductClick}>CONTACT US</Link></li>
        </ul>
      </nav>

    </div>
  );
};

export default Header;
