import React, { useContext, useState } from 'react';
import './CartItems.css';
import { ShopContext } from '../../Context/ShopContext';
import remove_icon from '../Assets/cart_cross_icon.png';
import { useNavigate } from 'react-router-dom';

const CartItems = () => {
    const { all_product, cartItems, removeFromCart, getTotalCartAmount, updateCartItem } = useContext(ShopContext);
    const navigate = useNavigate();
    const [editingItem, setEditingItem] = useState(null);

    const handleQuantityChange = (item, newQuantity) => {
        if (newQuantity > 0) {
            updateCartItem(item.productId, item.size, newQuantity);
        }
    };

    const handleSizeChange = (item, newSize) => {
        updateCartItem(item.productId, item.size, item.quantity, newSize);
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
            {cartItems.map((item) => {
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
                                onClick={() => removeFromCart(item.productId, item.size)} 
                            />
                        </div>
                    );
                }
                return null;
            })}
            <div className="cartitems-down">
                <div className="cartitems-total">
                    <h1>Cart Totals</h1>
                    <div>
                        <div className="cartitems-total-item">
                            <p>Subtotal</p>
                            <p>${getTotalCartAmount()}</p>
                        </div>
                        <hr />
                        <div className="cartitems-total-item">
                            <p>Shipping Fees</p>
                            <p>Free</p>
                        </div>
                        <hr />
                        <div className="cartitems-total-item">
                            <h3>Total</h3>
                            <h3>${getTotalCartAmount()}</h3>
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
        </div>
    );
};

export default CartItems;

