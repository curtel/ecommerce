import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './CSS/Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth-token');
        
        if (!token) {
          setError('You must be logged in to view orders');
          setLoading(false);
          return;
        }

        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/order/my-orders`, {
          headers: {
            'auth-token': token
          }
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch orders');
        }

        setOrders(data.orders);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="orders-container"><h2>Loading orders...</h2></div>;
  }

  if (error) {
    return <div className="orders-container"><h2>{error}</h2></div>;
  }

  return (
    <div className="orders-container">
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You don't have any orders yet.</p>
          <Link to="/" className="shop-now-btn">Shop Now</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-item">
              <div className="order-header">
                <div className="order-info">
                  <span className="order-date">{formatDate(order.createdAt)}</span>
                  <span className="order-id">Order ID: {order._id}</span>
                  <span className={`order-status status-${order.status}`}>{order.status}</span>
                </div>
                <div className="order-total">
                  ${order.totalAmount.toFixed(2)}
                </div>
              </div>
              
              <div className="order-summary">
                <p>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</p>
                <Link to={`/orders/${order._id}`} className="view-details-btn">View Details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders; 
