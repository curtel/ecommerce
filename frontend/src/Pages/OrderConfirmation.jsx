import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CSS/OrderConfirmation.css';

const OrderConfirmation = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        // You could fetch order details here if needed
        // For now, we'll just simulate a successful order
        setOrder({
            id: orderId,
            status: 'confirmed'
        });
    }, [orderId]);

    const handleReturnHome = () => {
        navigate('/'); // Navigate to home page
    };

    const handleViewOrder = () => {
        navigate(`/orders/${orderId}`); // Navigate to order detail page
    };

    if (!order) {
        return <div>Loading...</div>;
    }

    return (
        <div className="order-confirmation">
            <div className="confirmation-container">
                <div className="success-icon">✓</div>
                <h1>Order Confirmed!</h1>
                <p>Thank you for your purchase</p>
                <div className="order-details">
                    <p>Order ID: {order.id}</p>
                    <p>Status: {order.status}</p>
                </div>
                <p>We'll send you an email with your order details and tracking information.</p>
                <div className="confirmation-buttons">
                    <button onClick={handleViewOrder} className="view-order-button">
                        View Order
                    </button>
                    <button onClick={handleReturnHome} className="return-home-button">
                        Return to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation; 
