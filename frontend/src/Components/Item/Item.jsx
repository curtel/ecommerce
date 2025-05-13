import React, { useContext, useState, useEffect, useRef } from 'react'
import './Item.css'
import { Link } from 'react-router-dom'
import { ShopContext } from '../../Context/ShopContext'

const Item = (props) => {
    console.log('rendered item');
    const { addToCart } = useContext(ShopContext);
    const [showModal, setShowModal] = useState(false);
    const [selectedSize, setSelectedSize] = useState('M');
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const modalRef = useRef(null);
    

    useEffect(() => {
        console.log('rendered showModal');
    }, [showModal]);
    // Handle click outside modal
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Kiểm tra nếu click ngoài modal và không phải là nút "Add to Cart"
            if (modalRef.current && 
                !modalRef.current.contains(event.target) && 
                !event.target.classList.contains('add-to-cart')) {
                console.log('clicked outside modal');
                setShowModal(false);
            }
        };

        if (showModal) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showModal]);
    
    // Calculate discount percentage
    const discount = Math.round(((props.old_price - props.new_price) / props.old_price) * 100);

    const handleAddToCart = async () => {
        if (!selectedSize) {
            setError('Please select a size');
            return;
        }
        if (quantity < 1) {
            setError('Please enter a valid quantity');
            return;
        }
        setError('');
        try {
            await addToCart(props.id, selectedSize, quantity);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setShowModal(false);
            }, 1500); // Close modal after 1.5 seconds
        } catch (err) {
            if (err.message === 'Please login to add items to cart') {
                setError('Please login to add items to cart');
            } else {
                setError('Failed to add to cart. Please try again.');
            }
            setSuccess(false);
        }
    };

    const handleOpenModal = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowModal(true);
    };

    return (
        <div className='item'>
            {discount > 0 && (
                <div className="item-discount">
                    -{discount}%
                </div>
            )}
            <Link to={`/product/${props.id}`}>
                <div className="item-image-container">
                    <img src={props.image} alt={props.name} className="item-image" />
                </div>
                <div className="item-details">
                    <h3 className="item-name">{props.name}</h3>
                    <div className="item-prices">
                        <div className="item-price-new">${props.new_price}</div>
                        {props.old_price > props.new_price && (
                            <div className="item-price-old">${props.old_price}</div>
                        )}
                    </div>
                </div>
            </Link>
            <button 
                className="add-to-cart"
                onClick={handleOpenModal}
            >
                Add to Cart
            </button>

            {showModal && (
                <div className="item-modal-overlay">
                    <div className="item-modal" ref={modalRef}>
                        <h3>Select Options</h3>
                        <div className="modal-content">
                            <div className="size-selection">
                                <label>Size:</label>
                                <div className="size-options">
                                    {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                                        <div
                                            key={size}
                                            className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                                            onClick={() => setSelectedSize(size)}
                                        >
                                            {size}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="quantity-selection">
                                <label>Quantity:</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                />
                            </div>
                            {error && <p className="error-message">{error}</p>}
                            {success && <p className="success-message">Added to cart successfully!</p>}
                            <div className="modal-buttons">
                                <button 
                                    className="cancel-button" 
                                    onClick={() => setShowModal(false)}
                                    disabled={success}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className={`confirm-button ${success ? 'success' : ''}`} 
                                    onClick={handleAddToCart}
                                    disabled={success}
                                >
                                    {success ? 'Added!' : 'Add to Cart'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Item
