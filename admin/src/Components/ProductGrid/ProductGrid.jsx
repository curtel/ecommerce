import React from 'react';
import './ProductGrid.css';
import { Link } from 'react-router-dom';
import FilterListIcon from '@mui/icons-material/FilterList';

const ProductGrid = ({ title, products }) => {
    const formatPrice = (price) => {
        return `$${price}`;
    };

    return (
        <div className="product-grid-container">
            {title && <h2 className="product-grid-title">{title}</h2>}
            <div className="products-grid">
                {products.map((product) => (
                    <div key={product.id} className="product-card">
                        <Link to={`/product/${product.id}`} className="product-image-container">
                            <img 
                                src={product.image} 
                                alt={product.name} 
                                className="product-image"
                            />
                        </Link>
                        <div className="product-details">
                            <Link to={`/product/${product.id}`} className="product-name">
                                {product.name}
                            </Link>
                            <div className="price-container">
                                <span className="current-price">
                                    {formatPrice(product.new_price)}
                                </span>
                                {product.old_price && (
                                    <span className="old-price">
                                        {formatPrice(product.old_price)}
                                    </span>
                                )}
                            </div>
                            <button className="add-to-cart-btn">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <button className="filter-sort-btn">
                <FilterListIcon /> Filter & Sort
            </button>
        </div>
    );
};

export default ProductGrid; 