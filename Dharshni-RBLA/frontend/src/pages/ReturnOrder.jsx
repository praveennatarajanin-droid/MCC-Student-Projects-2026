import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faBoxOpen, faShippingFast, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import './ReturnOrder.css';

const ReturnOrder = () => {
  const [formData, setFormData] = useState({
    orderId: '',
    email: '',
    reason: '',
    details: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.orderId.trim()) {
      tempErrors.orderId = 'Order ID is required';
    } else if (!/^[a-fA-F0-9]{24}$/.test(formData.orderId.trim()) && !/^[0-9]+$/.test(formData.orderId.trim())) {
      // Basic check for MongoDB ObjectId (24 hex characters) or standard numeric IDs
      tempErrors.orderId = 'Please enter a valid Order ID';
    }
    
    if (!formData.email.trim()) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    if (!formData.reason) {
      tempErrors.reason = 'Please select a reason for the return';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Submitting Return Request:', formData);
      toast.success('Return request submitted successfully! Our logistics team will review and contact you in 24-48 hours.');
      setFormData({
        orderId: '',
        email: '',
        reason: '',
        details: ''
      });
      setErrors({});
    } else {
      toast.error('Please correct the validation errors in the form.');
    }
  };

  return (
    <div className="returns-page-container">
      {/* Hero Header */}
      <div className="returns-page-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Returns Centre</h1>
          <p>We want you to love your handloom creations. Read our policy or request a return below.</p>
        </div>
      </div>

      <div className="returns-content-section">
        {/* Step-by-Step Instructions */}
        <section className="instructions-section">
          <h2>How Our Return Process Works</h2>
          <div className="underline"></div>

          <div className="steps-container">
            <div className="step-card">
              <div className="step-number-icon">
                <FontAwesomeIcon icon={faFileAlt} />
              </div>
              <h3>1. Submit Request</h3>
              <p>Fill out the return request form below with your Order ID, Email, and reason for return.</p>
            </div>
            
            <div className="step-card">
              <div className="step-number-icon">
                <FontAwesomeIcon icon={faBoxOpen} />
              </div>
              <h3>2. Pack the Item</h3>
              <p>Keep the product unused, in its original condition, with tags and packaging intact.</p>
            </div>

            <div className="step-card">
              <div className="step-number-icon">
                <FontAwesomeIcon icon={faShippingFast} />
              </div>
              <h3>3. Free Pick-up</h3>
              <p>Our delivery executive will pick up the package from your address within 2-3 business days.</p>
            </div>

            <div className="step-card">
              <div className="step-number-icon">
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <h3>4. Refund Processed</h3>
              <p>Once inspected, the refund will be credited to your account within 5-7 business days.</p>
            </div>
          </div>
        </section>

        {/* Return Form Section */}
        <section className="returns-form-section">
          <div className="returns-form-wrapper">
            <h2>Initiate a Return</h2>
            <div className="underline"></div>
            <p className="form-helper-text">
              Please enter your details below. Returns must be requested within <strong>7 days</strong> of delivery.
            </p>

            <form onSubmit={handleSubmit} className="returns-form">
              <div className="form-group">
                <label htmlFor="orderId">Order ID / Transaction ID *</label>
                <input
                  type="text"
                  id="orderId"
                  name="orderId"
                  value={formData.orderId}
                  onChange={handleInputChange}
                  className={errors.orderId ? 'input-error' : ''}
                  placeholder="e.g., 64b8f52ef322a105c87e412b"
                />
                {errors.orderId && <span className="error-text">{errors.orderId}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'input-error' : ''}
                  placeholder="name@example.com"
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="reason">Reason for Return *</label>
                <select
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className={errors.reason ? 'input-error' : ''}
                >
                  <option value="">-- Select Reason --</option>
                  <option value="size-issue">Size / Dimensions Mismatch</option>
                  <option value="damaged">Product Received Damaged</option>
                  <option value="wrong-item">Received Wrong Product</option>
                  <option value="quality">Quality Not As Expected</option>
                  <option value="other">Other Reason</option>
                </select>
                {errors.reason && <span className="error-text">{errors.reason}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="details">Additional Details (Optional)</label>
                <textarea
                  id="details"
                  name="details"
                  rows="4"
                  value={formData.details}
                  onChange={handleInputChange}
                  placeholder="Provide any additional comments or details about the issue..."
                ></textarea>
              </div>

              <button type="submit" className="submit-return-btn">
                Submit Return Inquiry
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReturnOrder;
