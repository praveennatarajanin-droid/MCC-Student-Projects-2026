import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '../../../services/superadmin/orderAPI';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import './Orders.css';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await getOrderById(orderId);
        setOrder(response);
        setError(null);
      } catch (err) {
        setError(err.message || err.error || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="loading">
        <FaSpinner className="spinner" />
        <span>Loading order details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button className="view-details-btn" onClick={() => navigate('/superadmin/orders')}>
          <FaArrowLeft /> Back to Orders
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="error">
        <p>Order not found.</p>
        <button className="view-details-btn" onClick={() => navigate('/superadmin/orders')}>
          <FaArrowLeft /> Back to Orders
        </button>
      </div>
    );
  }

  const productTotal = order.products?.reduce((sum, item) => {
    const price = Number(item.price || 0);
    const quantity = Number(item.quantity || 0);
    return sum + price * quantity;
  }, 0) || 0;

  return (
    <div className="orders-container">
      <div className="orders-header">
        <button className="view-details-btn" onClick={() => navigate('/superadmin/orders')}>
          <FaArrowLeft /> Back to Orders
        </button>
        <h2>Order Details</h2>
      </div>

      <div className="order-details-page">
        <div className="detail-row">
          <span className="detail-label">Order Number:</span>
          <span className="detail-value">{order.orderNumber || order._id}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Customer:</span>
          <span className="detail-value">{order.user?.name || 'N/A'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Email:</span>
          <span className="detail-value">{order.user?.email || 'N/A'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Status:</span>
          <span className="detail-value">{order.orderStatus || 'N/A'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Order Date:</span>
          <span className="detail-value">
            {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }) : 'N/A'}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Total Amount:</span>
          <span className="detail-value">₹{productTotal.toFixed(2)}</span>
        </div>

        <div className="order-products">
          <h3>Products</h3>
          <table className="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.products?.map((item, index) => (
                <tr key={index}>
                  <td>{item.product?.name || 'Unknown'}</td>
                  <td>{item.quantity || 0}</td>
                  <td>₹{Number(item.price || 0).toFixed(2)}</td>
                  <td>₹{(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {order.shippingAddress && (
          <div className="shipping-address">
            <h3>Shipping Address</h3>
            <p>
              {order.shippingAddress.street || ''}
              {order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ''}
              {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''}
              {order.shippingAddress.country ? `, ${order.shippingAddress.country}` : ''}
              {order.shippingAddress.postalCode ? `, ${order.shippingAddress.postalCode}` : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
