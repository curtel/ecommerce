import React, { useContext, useState, useEffect } from 'react';
import './CartItems.css';
import { ShopContext } from '../../Context/ShopContext';
import remove_icon from '../Assets/cart_cross_icon.png';
import { useNavigate } from 'react-router-dom';
import { API_URL, fetchConfig } from '../../config';

const CartItems = () => {
    const { all_product, cartItems, removeFromCart, getTotalCartAmount, updateCartItem } = useContext(ShopContext);
    const [localCartItems, setLocalCartItems] = useState([]);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch latest cart data when component mounts
    useEffect(() => {
        fetchCartItems();
    }, []);

    const fetchCartItems = async () => {
        const token = localStorage.getItem('auth-token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/user/cart`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch cart items');
            }

            const data = await response.json();
            // Filter to include only items with quantity > 0
            const activeItems = Array.isArray(data) ? data.filter(item => item.quantity > 0) : [];
            setLocalCartItems(activeItems);
            setError(null);
        } catch (error) {
            console.error('Error fetching cart items:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuantityChange = async (item, newQuantity) => {
        if (newQuantity > 0) {
            await updateCartItem(item.productId, item.size, newQuantity);
            // Refetch cart items to update the display
            fetchCartItems();
        }
    };

    const handleSizeChange = async (item, newSize) => {
        await updateCartItem(item.productId, item.size, item.quantity, newSize);
        // Refetch cart items to update the display
        fetchCartItems();
    };

    const handleRemoveFromCart = async (productId, size) => {
        await removeFromCart(productId, size);
        // Refetch cart items to update the display
        fetchCartItems();
    };

    const handleCheckout = () => {
        const authToken = localStorage.getItem('auth-token');
        if (!authToken) {
            alert('Please login to proceed with checkout');
            navigate('/login');
            return;
        }
        navigate('/checkout');
    };

    const calculateItemTotal = (item) => {
        const product = all_product.find(p => p.id === item.productId);
        return product ? product.new_price * item.quantity : 0;
    };

    if (isLoading) {
        return <div className="cartitems-loading">Loading cart items...</div>;
    }

    if (error) {
        return <div className="cartitems-loading">Error: {error}</div>;
    }

    return (
        <div className="cartitems">
            <div className="cartitems-format-main">
                <p>Products</p>
                <p>Title</p>
                <p>Size</p>
                <p>Price</p>
                <p>Quantity</p>
                <p>Total</p>
                <p>Remove</p>
            </div>
            <hr />
            {localCartItems.length === 0 ? (
                <div className="empty-cart">
                    <h2>Your cart is empty</h2>
                    <button onClick={() => navigate('/')}>Continue Shopping</button>
                </div>
            ) : (
                localCartItems.map((item) => {
                    const product = all_product.find(p => p.id === item.productId);
                    if (product && item.quantity > 0) {
                        return (
                            <div key={`${item.productId}-${item.size}`} className="cartitems-format cartitems-format-main">
                                <img src={product.image} alt="" className="carticon-product-icon" />
                                <p>{product.name}</p>
                                <div className="cartitems-size">
                                    <select
                                        value={item.size}
                                        onChange={(e) => handleSizeChange(item, e.target.value)}
                                    >
                                        {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                                            <option key={size} value={size}>{size}</option>
                                        ))}
                                    </select>
                                </div>
                                <p>${product.new_price}</p>
                                <div className="cartitems-quantity">
                                    <button onClick={() => handleQuantityChange(item, item.quantity - 1)}>-</button>
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => handleQuantityChange(item, parseInt(e.target.value) || 0)}
                                    />
                                    <button onClick={() => handleQuantityChange(item, item.quantity + 1)}>+</button>
                                </div>
                                <p>${calculateItemTotal(item)}</p>
                                <img 
                                    className='cartitems-remove-icon' 
                                    src={remove_icon} 
                                    alt="" 
                                    onClick={() => handleRemoveFromCart(item.productId, item.size)} 
                                />
                            </div>
                        );
                    }
                    return null;
                })
            )}
            {localCartItems.length > 0 && (
                <div className="cartitems-down">
                    <div className="cartitems-total">
                        <h1>Cart Totals</h1>
                        <div>
                            <div className="cartitems-total-item">
                                <p>Subtotal</p>
                                <p>${localCartItems.reduce((total, item) => {
                                    const product = all_product.find(p => p.id === item.productId);
                                    return total + (product ? product.new_price * item.quantity : 0);
                                }, 0).toFixed(2)}</p>
                            </div>
                            <hr />
                            <div className="cartitems-total-item">
                                <p>Shipping Fees</p>
                                <p>Free</p>
                            </div>
                            <hr />
                            <div className="cartitems-total-item">
                                <h3>Total</h3>
                                <h3>${localCartItems.reduce((total, item) => {
                                    const product = all_product.find(p => p.id === item.productId);
                                    return total + (product ? product.new_price * item.quantity : 0);
                                }, 0).toFixed(2)}</h3>
                            </div>
                        </div>
                        <button onClick={handleCheckout}>PROCEED TO CHECKOUT</button>
                    </div>
                    <div className="cartitems-promocode">
                        <p>If You Have A Promo Code, Enter it Here</p>
                        <div className="cartitems-promobox">
                            <input type="text" placeholder='promo code' />
                            <button>Submit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartItems;

