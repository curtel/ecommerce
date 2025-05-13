import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './CSS/OrderDetail.css';

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth-token');
        
        if (!token) {
          setError('You must be logged in to view order details');
          setLoading(false);
          return;
        }

        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/order/${orderId}`, {
          headers: {
            'auth-token': token
          }
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch order details');
        }

        setOrder(data.order);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="order-detail-container"><h2>Loading order details...</h2></div>;
  }

  if (error) {
    return <div className="order-detail-container"><h2>{error}</h2></div>;
  }

  if (!order) {
    return <div className="order-detail-container"><h2>Order not found</h2></div>;
  }

  return (
    <div className="order-detail-container">
      <div className="order-detail-header">
        <Link to="/orders" className="back-to-orders">← Back to Orders</Link>
        <div className="order-detail-title">
          <h1>Order Details</h1>
          <span className="order-id">Order #{order._id}</span>
          <span className={`order-status status-${order.status}`}>{order.status}</span>
        </div>
        <div className="order-date">
          Placed on {formatDate(order.createdAt)}
        </div>
      </div>

      <div className="order-sections-container">
        <div className="order-detail-section order-items">
          <h2>Items Ordered</h2>
          <div className="order-items-list">
            {order.items.map((item, index) => (
              <div key={index} className="order-item-detail">
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p className="item-price">${item.price.toFixed(2)}</p>
                  <p className="item-qty">Quantity: {item.quantity}</p>
                </div>
                <div className="item-subtotal">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <div className="order-total-section">
            <div className="total-line">
              <span>Subtotal:</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
            <div className="total-line">
              <span>Shipping:</span>
              <span>$0.00</span>
            </div>
            <div className="total-line total-amount">
              <span>Total:</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="order-detail-side">
          <div className="order-detail-section shipping-info">
            <h2>Shipping Information</h2>
            <p className="recipient-name">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.address}</p>
            <p>{order.shippingAddress.city}</p>
            <p>Phone: {order.shippingAddress.phone}</p>
          </div>

          <div className="order-detail-section payment-info">
            <h2>Payment Information</h2>
            <p className="payment-method">Method: {order.payment.method}</p>
            <p className={`payment-status status-${order.payment.status}`}>
              Status: {order.payment.status}
            </p>
            {order.payment.transactionId && (
              <p className="transaction-id">Transaction ID: {order.payment.transactionId}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail; 
