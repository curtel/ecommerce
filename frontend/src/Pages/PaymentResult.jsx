import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CSS/PaymentResult.css';
import { API_URL, fetchConfig } from '../config';

const PaymentResult = () => {
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const [orderId, setOrderId] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Parse query parameters
        const queryParams = new URLSearchParams(location.search);
        const orderIdParam = queryParams.get('orderId');
        const statusParam = queryParams.get('status');
        const errorParam = queryParams.get('error');

        if (errorParam) {
            setStatus('error');
            setMessage('There was an error processing your payment. Please try again or contact support.');
            return;
        }

        console.log(orderIdParam, statusParam);
        if (orderIdParam) {
            setOrderId(orderIdParam);
            
            if (statusParam == 1) {
                setStatus('success');
                setMessage('Your payment has been successfully processed! Your order is confirmed.');
            } else if (statusParam === 'failed') {
                setStatus('error');
                setMessage('Your payment was unsuccessful. Please try again or choose a different payment method.');
            } else {
                // Check payment status from the server
                checkPaymentStatus(orderIdParam);
            }
        } else {
            setStatus('error');
            setMessage('Invalid order information. Please return to your orders.');
        }
    }, [location.search]);

    const checkPaymentStatus = async (orderIdParam) => {
        try {
            const authToken = localStorage.getItem('auth-token');
            if (!authToken) {
                setStatus('error');
                setMessage('Authentication required. Please log in to view payment status.');
                return;
            }

            const response = await fetch(`${API_URL}/payment/status/${orderIdParam}`, {
                method: 'GET',
                headers: {
                    ...fetchConfig.headers,
                    'auth-token': authToken
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                if (data.payment.status === 'completed') {
                    setStatus('success');
                    setMessage('Your payment has been successfully processed! Your order is confirmed.');
                } else if (data.payment.status === 'failed') {
                    setStatus('error');
                    setMessage('Your payment was unsuccessful. Please try again or choose a different payment method.');
                } else {
                    setStatus('pending');
                    setMessage('Your payment is being processed. We will notify you once it is complete.');
                }
            } else {
                throw new Error(data.error || 'Error checking payment status');
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
            setStatus('error');
            setMessage('Failed to check payment status. Please contact support or check your orders later.');
        }
    };

    const goToOrderDetails = () => {
        if (orderId) {
            navigate(`/orders/${orderId}`);
        } else {
            navigate('/profile');
        }
    };

    const goToHome = () => {
        navigate('/');
    };

    const renderStatusIcon = () => {
        switch (status) {
            case 'success':
                return <div className="status-icon success">✓</div>;
            case 'error':
                return <div className="status-icon error">✗</div>;
            case 'pending':
                return <div className="status-icon pending">⟳</div>;
            default:
                return <div className="status-icon loading">⟳</div>;
        }
    };

    return (
        <div className="payment-result-container">
            <div className="payment-result-card">
                {renderStatusIcon()}
                
                <h2>
                    {status === 'loading' && 'Checking Payment...'}
                    {status === 'success' && 'Payment Successful!'}
                    {status === 'error' && 'Payment Failed'}
                    {status === 'pending' && 'Payment Processing'}
                </h2>
                
                <p>{message}</p>
                
                <div className="result-actions">
                    {status !== 'loading' && (
                        <>
                            {status === 'success' && (
                                <button className="primary-button" onClick={goToOrderDetails}>
                                    View Order
                                </button>
                            )}
                            
                            {status === 'error' && (
                                <button className="primary-button" onClick={() => navigate('/checkout')}>
                                    Try Again
                                </button>
                            )}
                            
                            <button className="secondary-button" onClick={goToHome}>
                                Continue Shopping
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentResult; 
