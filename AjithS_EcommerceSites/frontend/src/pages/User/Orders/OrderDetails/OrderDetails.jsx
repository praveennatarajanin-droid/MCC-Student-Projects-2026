// Architect: SP
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderDetails } from '../../../../services/userapi/orderAPI';
import { useUser } from '../../../../Context/UserContext';
import './OrderDetails.css';

const OrderDetails = () => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useUser();

    const getFullImageUrl = (imagePath) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http')) return imagePath;
        const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        return `http://localhost:5000${path}`;
    };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchOrderDetails();
    }, [isAuthenticated, orderId, navigate]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await getOrderDetails(orderId);
            if (response.success) {
                setOrder(response.data);
            } else {
                setError('Failed to fetch order details');
            }
        } catch (error) {
            setError(error.message || 'Failed to fetch order details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="order-details-loading">Loading order details...</div>;
    }

    if (error) {
        return <div className="order-details-error">{error}</div>;
    }

    if (!order) {
        return <div className="order-details-not-found">Order not found</div>;
    }

    return (
        <div className="order-details-container">
            <div className="order-details-header">
                <button className="back-button" onClick={() => navigate('/orders')}>
                    ← Back to Orders
                </button>
                <h1>Order Details</h1>
                <div className="order-meta">
                    <p>Order #{order._id.slice(-8)}</p>
                    <p>Placed on: {new Date(order.orderDate).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="order-details-content">
                <div className="order-status-section">
                    <h2>Order Status</h2>
                    <div className={`status-badge ${order.orderStatus.toLowerCase()}`}>
                        {order.orderStatus}
                    </div>
                    <div className={`payment-status ${order.paymentStatus.toLowerCase()}`}>
                        Payment: {order.paymentStatus}
                    </div>
                </div>

                <div className="shipping-details">
                    <h2>Shipping Details</h2>
                    <div className="address-card">
                        <p><strong>{order.shippingAddress.fullName}</strong></p>
                        <p>{order.shippingAddress.address}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                        <p>PIN: {order.shippingAddress.pincode}</p>
                        <p>Phone: {order.shippingAddress.phone}</p>
                    </div>
                </div>

                <div className="order-items">
                    <h2>Order Items</h2>
                    {order.products.map((item) => {
                        // Get the image URL from either images array or image_url
                        let imageUrl = '';
                        if (item.product.images && item.product.images.length > 0) {
                            imageUrl = getFullImageUrl(item.product.images[0]);
                        } else if (item.product.image_url) {
                            imageUrl = getFullImageUrl(item.product.image_url);
                        }

                        return (
                            <div key={item._id} className="order-item">
                                <div className="item-image">
                                    <img 
                                        src={imageUrl || '/images/placeholder.png'} 
                                        alt={item.product.name}
                                        onError={(e) => {
                                            e.target.src = '/images/placeholder.png';
                                            e.target.onerror = null;
                                        }}
                                    />
                                </div>
                                <div className="item-details">
                                    <h3>{item.product.name}</h3>
                                    <p className="item-description">{item.product.description}</p>
                                    <div className="item-meta">
                                        <p>Quantity: {item.quantity}</p>
                                        <p>Price: ₹{item.price}</p>
                                        <p>Total: ₹{item.price * item.quantity}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="order-summary">
                    <h2>Order Summary</h2>
                    <div className="summary-details">
                        <div className="summary-row">
                            <span>Subtotal:</span>
                            <span>₹{order.totalAmount}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping:</span>
                            <span>₹{order.totalAmount > 1000 ? 0 : 50}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total:</span>
                            <span>₹{order.totalAmount > 1000 ? order.totalAmount : order.totalAmount + 50}</span>
                        </div>
                    </div>
                </div>

                <div className="order-actions">
                    <button 
                        onClick={() => navigate(`/orders/${order._id}/track`)}
                        className="track-button"
                    >
                        Track Order
                    </button>
                    {order.orderStatus === 'Pending' && (
                        <button 
                            onClick={() => navigate('/')}
                            className="contact-support-button"
                        >
                            Contact Support
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
