import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '../../../services/publicapi/productAPI';
import { canReviewProduct } from '../../../services/userapi/reviewAPI';
import { useCart } from '../../../Context/CartContext';
import { useUser } from '../../../Context/UserContext';
import WishlistButton from '../../../components/Wishlist/WishlistButton';
import { toast } from 'react-toastify';
import ReviewStars from '../../User/Reviews/ReviewStars';
import ReviewList from '../../User/Reviews/ReviewList';
import { Sparkles } from 'lucide-react';
import './ProductDetails.css';
import ReactMarkdown from 'react-markdown';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useUser();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('default');
  const [printedSide, setPrintedSide] = useState('single');
  const [addingToCart, setAddingToCart] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProduct(id);
        if (data.success && data.data) {
          const normalizeUrl = (src) => {
            if (!src) return src;
            return src.startsWith('http')
              ? src
              : `http://localhost:5000${src.startsWith('/') ? src : '/' + src}`;
          };

          const primaryImage = data.data.image_url ? normalizeUrl(data.data.image_url) : null;
          const extraImages = data.data.images?.length
            ? data.data.images.map(normalizeUrl).filter(img => img !== primaryImage)
            : [];
          const images = primaryImage ? [primaryImage, ...extraImages] : extraImages;


          setProduct({ ...data.data, images });
          setSelectedImage(0);
        } else {
          setError('Product data is invalid');
        }
      } catch {
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  // Check review eligibility
  useEffect(() => {
    const checkReviewEligibility = async () => {
      if (isAuthenticated && product?._id) {
        const result = await canReviewProduct(product._id);
        setCanReview(result.canReview);
        setReviewMessage(result.message);
      }
    };
    checkReviewEligibility();
  }, [isAuthenticated, product?._id]);

  // Prepare Pollinations prompt for professional summary
  const pollinationsPrompt = useMemo(() => {
  if (!product?.reviews || product.reviews.length === 0) return null;

  const reviewsWithStars = product.reviews
    .map((r, idx) => `Review ${idx + 1} (${r.rating || 0} stars): ${r.comment}`)
    .join('\n');

  return `Summarize the following customer reviews for "${product.name}" in a short, customer-friendly paragraph.

Include only those reviews that actually discuss the product's features, quality, performance, or purchase experience.

Completely ignore and do not mention any reviews containing cuss words, inappropriate language, personal attacks, off-topic remarks, spam, or political content.

Highlight the product’s main strengths and recurring positive feedback, but also mention any significant concerns or negatives if present.

Limit the summary to 3–4 sentences so customers can quickly understand the overall reputation of the product and make a confident buying decision.

Use direct, easy-to-understand language, and avoid repetition or technical jargon.

Conclude with a clear statement on whether the majority of reviewers recommend the product or express reservations.

Customer reviews:
${reviewsWithStars}`;
}, [product]);



 useEffect(() => {
  if (!pollinationsPrompt) {
    setSummary("No reviews to summarize.");
    return;
  }
  setSummaryLoading(true);
  setSummary(""); // Clear before reload

  // Debug: log the prompt sent to backend
  console.log('[ProductDetails] Prompt sent to backend:', pollinationsPrompt);

  fetch("http://localhost:5000/api/ai/summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: pollinationsPrompt, model: 'openai' }),
  })
    .then(res => res.json())
    .then(data => {
      // Debug: log response from backend
      console.log('[ProductDetails] Response from backend:', data);
      if (data.error) {
        setSummary("AI summary error. Please try again.");
      } else {
        setSummary(data.completion || data.summary || "No summary available.");
      }
    })
    .catch((err) => {
      // Debug: log fetch error
      console.error('[ProductDetails] Fetch error:', err);
      setSummary("Failed to fetch AI summary.");
    })
    .finally(() => setSummaryLoading(false));
}, [pollinationsPrompt]);




  // Dynamic price calculation
  const calculatePrice = () => {
    if (!product) return 0;
    const basePrice = product.new_price || product.price;
    const sizeMultipliers = { default: 1, small: 0.8, medium: 1.2, large: 1.5 };
    const sideMultipliers = { single: 1, double: 1.5 };
    return (basePrice * sizeMultipliers[size] * sideMultipliers[printedSide] * quantity).toFixed(2);
  };

  // Add to cart handler
  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      const productToAdd = {
        _id: product._id,
        name: product.name,
        price: parseFloat(calculatePrice()),
        image: product.images?.[0] || product.image_url,
        size,
        printedSide,
      };
      const success = await addToCart(productToAdd, quantity);
      toast[success ? 'success' : 'error'](success ? 'Added to cart successfully!' : 'Failed to add to cart. Please try again.');
      return success;
    } catch {
      toast.error('Error adding to cart. Please try again.');
      return false;
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    const success = await handleAddToCart();
    if (success) navigate('/checkout');
  };

  if (loading) return <div>Loading product details...</div>;
  if (error || !product) return (
    <div>
      <h2>Error</h2>
      <p>{error || 'Product not found'}</p>
      <button onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  return (
    <div className="product-details-container">
      {/* Product Display */}
      <div className="product-main-section">
        <div className="product-images-section">
          {product.images.length > 0 ? (
            <>
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="product-main-image"
                onError={(e) => (e.target.src = product.image_url || '/placeholder-image.jpg')}
              />
              <div className="image-thumbnails">
                {product.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${product.name} view ${idx + 1}`}
                    className={`thumbnail ${selectedImage === idx ? 'selected' : ''}`}
                    onClick={() => setSelectedImage(idx)}
                    onError={(e) => (e.target.src = product.image_url || '/placeholder-image.jpg')}
                  />
                ))}
              </div>
            </>
          ) : <div>No images available</div>}
        </div>

        <div className="product-info-section">
          <div className="product-header">
            <h1>{product.name}</h1>
            <WishlistButton productId={id} />
          </div>

          {product.averageRating > 0 && (
            <div className="product-rating">
              <ReviewStars rating={product.averageRating} />
              <span className="rating-text">({product.reviews?.length || 0} reviews)</span>
            </div>
          )}

          <p>{product.description}</p>

          <div className="price-section">
            {product.old_price && <span className="original-price">₹{product.old_price}</span>}
            <span className="current-price">₹{product.new_price || product.price}</span>
          </div>

          <div>
            {product.stock > 0
              ? <span className={product.stock <= 5 ? 'low-stock' : 'in-stock'}>
                  {product.stock <= 5 ? 'Low Stock' : 'In Stock'} ({product.stock} {product.stock === 1 ? 'item' : 'items'} left)
                </span>
              : <span className="out-of-stock">Out of Stock</span>}
          </div>

          <div className="product-options">
            <label> Size:
              <select value={size} onChange={(e) => setSize(e.target.value)} disabled={addingToCart}>
                <option value="default">Default</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </label>

            <label> Printed Side:
              <select value={printedSide} onChange={(e) => setPrintedSide(e.target.value)} disabled={addingToCart}>
                <option value="single">Single Side</option>
                <option value="double">Double Side</option>
              </select>
            </label>

            <label> Quantity:
              <button disabled={quantity <= 1 || addingToCart} onClick={() => setQuantity(Math.max(1, quantity - 1))}> - </button>
              <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} disabled={addingToCart} />
              <button disabled={addingToCart} onClick={() => setQuantity(quantity + 1)}> + </button>
            </label>

            <div>Total: ₹{calculatePrice()}</div>
          </div>

          <div className="action-buttons">
            <button className="add-to-cart-btn" onClick={handleAddToCart} disabled={addingToCart || product.stock <= 0}>
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            <button className="buy-now-btn" onClick={handleBuyNow} disabled={addingToCart || product.stock <= 0}>
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* AI Review Summary */}
      <div className="ai-review-summary">
    <Sparkles className="icon-sparkles" />
    <h3>AI Review Summary</h3>
    <ReactMarkdown>
      {summaryLoading
        ? "[Loading professional AI summary...]"
        : summary}
    </ReactMarkdown>
  </div>

      {/* Review Form */}
      {isAuthenticated && (
        canReview
          ? <button className="write-review-btn" onClick={() => navigate(`/review/${product._id}`)}>Write a Review</button>
          : <div className="review-message">{reviewMessage || 'Purchase this product to write a review'}</div>
      )}

      {/* Reviews Listing */}
      <div className="reviews-section">
        <h2>Customer Reviews ({product.reviews?.length || 0})</h2>
        <ReviewList productId={product._id} initialReviews={product.reviews || []} />
      </div>
    </div>
  );
}
