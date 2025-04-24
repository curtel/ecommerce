import React, { useContext, useState } from 'react';
import './CSS/Checkout.css';
import { ShopContext } from '../Context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { API_URL, fetchConfig } from '../config';

const Checkout = () => {
    const { cartItems, all_product, getTotalCartAmount, clearCart } = useContext(ShopContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        address: '',
        city: '',
        phone: ''
    });
    const [errors, setErrors] = useState({
        fullName: '',
        address: '',
        city: '',
        phone: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            fullName: '',
            address: '',
            city: '',
            phone: ''
        };

        // Validate Full Name
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
            isValid = false;
        } else if (formData.fullName.trim().length < 2) {
            newErrors.fullName = 'Full name must be at least 2 characters';
            isValid = false;
        }

        // Validate Address
        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
            isValid = false;
        } else if (formData.address.trim().length < 5) {
            newErrors.address = 'Please enter a valid address';
            isValid = false;
        }

        // Validate City
        if (!formData.city.trim()) {
            newErrors.city = 'City is required';
            isValid = false;
        }

        // Validate Phone Number
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
            isValid = false;
        } else if (!phoneRegex.test(formData.phone.trim())) {
            newErrors.phone = 'Please enter a valid phone number (10-11 digits)';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const authToken = localStorage.getItem('auth-token');
            if (!authToken) {
                alert('Please log in to complete your order');
                navigate('/login');
                return;
            }

            // Prepare order items
            const orderItems = cartItems
                .filter(item => item.quantity > 0)
                .map(item => {
                    const product = all_product.find(p => p.id === item.productId);
                    if (!product) {
                        throw new Error(`Product not found for id: ${item.productId}`);
                    }
                    return {
                        productId: item.productId,
                        quantity: item.quantity,
                        price: product.new_price,
                        name: product.name
                    };
                });

            if (orderItems.length === 0) {
                alert('Your cart is empty');
                setIsSubmitting(false);
                return;
            }

            // Create order data
            const orderData = {
                items: orderItems,
                totalAmount: getTotalCartAmount(),
                shippingAddress: {
                    fullName: formData.fullName,
                    address: formData.address,
                    city: formData.city,
                    phone: formData.phone
                }
            };

            // Create order
            const response = await fetch(`${API_URL}/create-order`, {
                method: 'POST',
                headers: {
                    ...fetchConfig.headers,
                    'auth-token': authToken
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Server error (${response.status})`);
            }

            const data = await response.json();
            if (data.success) {
                await clearCart(); // Clear the cart after successful order
                navigate('/order-confirmation/' + data.orderId);
            } else {
                throw new Error(data.error || 'Error creating order');
            }
        } catch (error) {
            console.error('Error:', error);
            if (error.message === 'Failed to fetch') {
                alert('Unable to connect to the server. Please check your internet connection and try again.');
            } else {
                alert(error.message || 'Error creating order. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="checkout-container">
            <div className="checkout-form">
                <h2>Shipping Information</h2>
                <div className="form-group">
                    <label>Full Name</label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={errors.fullName ? 'error' : ''}
                        placeholder="Enter your full name"
                    />
                    {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                </div>

                <div className="form-group">
                    <label>Address</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={errors.address ? 'error' : ''}
                        placeholder="Enter your address"
                    />
                    {errors.address && <span className="error-message">{errors.address}</span>}
                </div>

                <div className="form-group">
                    <label>City</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={errors.city ? 'error' : ''}
                        placeholder="Enter your city"
                    />
                    {errors.city && <span className="error-message">{errors.city}</span>}
                </div>

                <div className="form-group">
                    <label>Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={errors.phone ? 'error' : ''}
                        placeholder="Enter your phone number"
                    />
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>

                <div className="order-summary">
                    <h2>Order Summary</h2>
                    <div className="summary-row">
                        <span>Total Amount:</span>
                        <span>${getTotalCartAmount()}</span>
                    </div>
                </div>

                <button 
                    className="confirm-button" 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Processing...' : 'Confirm Order'}
                </button>
            </div>
        </div>
    );
};

export default Checkout; 