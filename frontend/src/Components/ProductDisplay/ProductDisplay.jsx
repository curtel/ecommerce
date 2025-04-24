import React, { useContext, useState } from 'react'
import './ProductDisplay.css'
import star_icon from "../Assets/star_icon.png";
import star_dull_icon from "../Assets/star_dull_icon.png";
import { ShopContext } from '../../Context/ShopContext';

const ProductDisplay = (props) => {
    const { product } = props;
    const { addToCart } = useContext(ShopContext);
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [selectedImage, setSelectedImage] = useState(product.image);

    const handleAddToCart = async () => {
        if (!selectedSize) {
            setError('Please select a size');
            setSuccess(false);
            return;
        }
        if (quantity < 1) {
            setError('Please enter a valid quantity');
            setSuccess(false);
            return;
        }
        setError('');
        try {
            await addToCart(product.id, selectedSize, quantity);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000); // Hide success message after 3 seconds
        } catch (err) {
            setError('Failed to add to cart. Please try again.');
            setSuccess(false);
        }
    };

    // Combine main image with detail images for the list
    const allImages = [product.image, ...(product.detail_images || [])];

    return (
        <div className='productdisplay'>
            <div className="productdisplay-left">
                <div className="productdisplay-img-list">
                    {allImages.map((img, index) => (
                        <img 
                            key={index}
                            src={img} 
                            alt="" 
                            onClick={() => setSelectedImage(img)}
                            className={selectedImage === img ? 'selected' : ''}
                        />
                    ))}
                </div>
                <div className="productdisplay-img">
                    <img className='productdisplay-main-img' src={selectedImage} alt="" />
                </div>
            </div>
            <div className="productdisplay-right">
                <h1>{product.name}</h1>
                <div className="productdisplay-right-stars">
                    <img src={star_icon} alt="" />
                    <img src={star_icon} alt="" />
                    <img src={star_icon} alt="" />
                    <img src={star_icon} alt="" />
                    <img src={star_dull_icon} alt="" />
                    <p>(122)</p>
                </div>
                <div className="productdisplay-right-prices">
                    <div className="productdisplay-right-price-old">${product.old_price}</div>
                    <div className="productdisplay-right-price-new">${product.new_price}</div>
                </div>
                <div className="productdisplay-right-description">
                    Description of the Product
                </div>
                <div className="productdisplay-right-size">
                    <h1>Select Size</h1>
                    <div className="productdisplay-right-sizes">
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
                <div className="productdisplay-right-quantity">
                    <h1>Quantity</h1>
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">Added to cart successfully!</p>}
                <button 
                    onClick={handleAddToCart}
                    className={success ? 'success' : ''}
                >
                    {success ? 'ADDED TO CART!' : 'ADD TO CART'}
                </button>
                <p className="productdisplay-right-category"><span>Category : </span>{product.category}</p>
                <p className="productdisplay-right-category"><span>Tags : </span>Modern, Latest</p>
            </div>
        </div>
    )
}

export default ProductDisplay
