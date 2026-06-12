// Architect: SP
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserOrders } from '../../../../services/userapi/orderAPI';
import { useUser } from '../../../../Context/UserContext';
import './MyOrders.css';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await getUserOrders();
            // Ensure we're setting an array
            setOrders(response.data || []);
            setError(null);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError(error.message || 'Failed to fetch orders');
            setOrders([]); // Reset orders to empty array on error
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'status-pending';
            case 'processing':
                return 'status-processing';
            case 'shipped':
                return 'status-shipped';
            case 'delivered':
                return 'status-delivered';
            case 'cancelled':
            case 'canceled':
                return 'status-cancelled';
            default:
                return '';
        }
    };

    const getFullImageUrl = (path) => {
        if (!path) return '/images/placeholder.png';
        return path.startsWith('http') ? path : `http://localhost:5000${path}`;
    };

    if (loading) {
        return <div className="orders-loading">Loading your orders...</div>;
    }

    if (error) {
        return <div className="orders-error">{error}</div>;
    }

    if (!Array.isArray(orders) || orders.length === 0) {
        return (
            <div className="orders-empty">
                <h2>No orders found</h2>
                <p>You haven't placed any orders yet.</p>
                <button onClick={() => navigate('/products')}>Start Shopping</button>
            </div>
        );
    }

    return (
        <div className="my-orders-container">
            <h2>My Orders</h2>
            <div className="orders-list">
                {orders.map((order) => (
                    <div key={order._id} className="order-card">
                        <div className="order-header">
                            <div className="order-info">
                                <h3>Order #{order.orderNumber || order._id.slice(-8)}</h3>
                                <p>Placed on: {new Date(order.orderDate).toLocaleDateString()}</p>
                            </div>
                            <span className={`order-status ${getStatusColor(order.orderStatus)}`}>
                                {order.orderStatus}
                            </span>
                        </div>
                        
                        <div className="order-products">
                            {Array.isArray(order.products) && order.products.map((item) => {
                                // Safely handle null product
                                if (!item?.product) {
                                    return null;
                                }

                                // Get the image URL from either images array or image_url
                                let imageUrl = getFullImageUrl(
                                    item.product.image_url || 
                                    (item.product.images && item.product.images.length > 0 ? item.product.images[0] : null)
                                );

                                return (
                                    <div key={item._id} className="order-product">
                                        <img 
                                            src={imageUrl}
                                            alt={item.product.name}
                                            className="product-image"
                                            onError={(e) => {
                                                e.target.src = '/images/placeholder.png';
                                                e.target.onerror = null;
                                            }}
                                        />
                                        <div className="product-details">
                                            <h4>{item.product.name}</h4>
                                            <p>Quantity: {item.quantity}</p>
                                            <p>Price: ₹{item.product.new_price}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="order-footer">
                            <div className="order-total">
                                <p>Total Amount: <span className="total-amount">₹{order.totalAmount}</span></p>
                                <p className="payment-status">Payment Status: <span className={`status-badge payment-${order.paymentStatus?.toLowerCase()}`}>{order.paymentStatus}</span></p>
                            </div>
                            <div className="order-actions">
                                <button onClick={() => navigate(`/orders/${order._id}`)} className="view-details-btn">
                                    View Details
                                </button>
                                <button onClick={() => navigate(`/orders/${order._id}/track`)} className="track-order-btn">
                                    Track Order
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyOrders;
