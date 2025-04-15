import React, { useContext, useState } from 'react';
import { ShopContext } from '../Context/ShopContext';
import { useNavigate } from 'react-router-dom';
import './CSS/Checkout.css';

const Checkout = () => {
    const { cartItems, getTotalCartAmount, all_product, clearCart } = useContext(ShopContext);
    const navigate = useNavigate();
    const [shippingInfo, setShippingInfo] = useState({
        fullName: '',
        address: '',
        city: '',
        phone: '',
    });

    const [errors, setErrors] = useState({
        fullName: '',
        address: '',
        city: '',
        phone: '',
    });

    const validateField = (name, value) => {
        const specialCharsRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
        const phoneRegex = /^[0-9]+$/;

        switch (name) {
            case 'fullName':
                if (!value) {
                    return 'Vui lòng nhập họ tên';
                }
                if (specialCharsRegex.test(value)) {
                    return 'Họ tên không được chứa ký tự đặc biệt';
                }
                return '';

            case 'address':
                if (!value) {
                    return 'Vui lòng nhập địa chỉ';
                }
                if (specialCharsRegex.test(value)) {
                    return 'Địa chỉ không được chứa ký tự đặc biệt';
                }
                return '';

            case 'city':
                if (!value) {
                    return 'Vui lòng nhập thành phố';
                }
                if (specialCharsRegex.test(value)) {
                    return 'Tên thành phố không được chứa ký tự đặc biệt';
                }
                return '';

            case 'phone':
                if (!value) {
                    return 'Vui lòng nhập số điện thoại';
                }
                if (!phoneRegex.test(value)) {
                    return 'Số điện thoại chỉ được chứa số';
                }
                return '';

            default:
                return '';
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({
            ...prev,
            [name]: value
        }));

        // Validate and set error message
        const errorMessage = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: errorMessage
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields before submission
        const newErrors = {
            fullName: validateField('fullName', shippingInfo.fullName),
            address: validateField('address', shippingInfo.address),
            city: validateField('city', shippingInfo.city),
            phone: validateField('phone', shippingInfo.phone),
        };

        setErrors(newErrors);

        // Check if there are any errors
        if (Object.values(newErrors).some(error => error !== '')) {
            return; // Stop submission if there are errors
        }
        
        // Prepare order items
        const items = cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            price: all_product.find(p => p.id === item.productId)?.new_price || 0,
            name: all_product.find(p => p.id === item.productId)?.name || ''
        }));

        const orderData = {
            userId: localStorage.getItem('auth-token'),
            items: items,
            totalAmount: getTotalCartAmount(),
            shippingAddress: shippingInfo
        };

        try {
            const response = await fetch('http://localhost:4000/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token')
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();
            if (data.success) {
                // Clear the cart after successful order
                clearCart();
                // Navigate to order confirmation
                navigate('/order-confirmation/' + data.orderId);
            } else {
                alert('Error creating order. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error creating order. Please try again.');
        }
    };

    return (
        <div className="checkout">
            <h1>Checkout</h1>
            <div className="checkout-container">
                <div className="checkout-form">
                    <h2>Shipping Information</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={shippingInfo.fullName}
                                onChange={handleInputChange}
                                className={errors.fullName ? 'error' : ''}
                            />
                            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                        </div>
                        <div className="form-group">
                            <label>Address</label>
                            <input
                                type="text"
                                name="address"
                                value={shippingInfo.address}
                                onChange={handleInputChange}
                                className={errors.address ? 'error' : ''}
                            />
                            {errors.address && <span className="error-message">{errors.address}</span>}
                        </div>
                        <div className="form-group">
                            <label>City</label>
                            <input
                                type="text"
                                name="city"
                                value={shippingInfo.city}
                                onChange={handleInputChange}
                                className={errors.city ? 'error' : ''}
                            />
                            {errors.city && <span className="error-message">{errors.city}</span>}
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={shippingInfo.phone}
                                onChange={handleInputChange}
                                className={errors.phone ? 'error' : ''}
                            />
                            {errors.phone && <span className="error-message">{errors.phone}</span>}
                        </div>
                        <div className="order-summary">
                            <h2>Order Summary</h2>
                            <div className="summary-item">
                                <span>Total Amount:</span>
                                <span>${getTotalCartAmount()}</span>
                            </div>
                        </div>
                        <button type="submit" className="checkout-button">
                            Confirm Order
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Checkout; 