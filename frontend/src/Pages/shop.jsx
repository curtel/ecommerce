import React, { useContext, useEffect } from 'react'
import './CSS/Shop.css'
import { ShopContext } from '../Context/ShopContext'
import Item from '../Components/Item/Item'
import { useNavigate } from 'react-router-dom'

const Shop = () => {
    const { all_product, loading, error, updateFilters, initialFetchDone } = useContext(ShopContext);
    const navigate = useNavigate();
    
    // Fetch products when component mounts if they haven't been fetched yet
    useEffect(() => {
        if (!initialFetchDone || all_product.length === 0) {
            updateFilters();
        }
    }, [initialFetchDone, all_product.length, updateFilters]);

    console.log('rendered');
    const categories = [
        {
            name: "Men's Collection",
            description: "Discover our latest men's fashion collection",
            image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1887&auto=format&fit=crop",
            path: "/men"
        },
        {
            name: "Women's Collection",
            description: "Explore our women's fashion collection",
            image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
            path: "/women"
        }
    ];

    return (
        <div className='shop'>
            {/* Hero Section */}
            <div className="shop-hero">
                <div className="hero-content">
                    <h1 className="hero-title">Welcome to Shopper</h1>
                    <p className="hero-subtitle">Discover the latest trends in fashion and explore our new collections</p>
                    <button className="hero-button" onClick={() => navigate('/newest')}>
                        Explore Newest Collection
                    </button>
                </div>
            </div>

            {/* Categories Section */}
            <section className="shop-categories">
                <h2 className="categories-title">Shop by Category</h2>
                <div className="categories-grid">
                    {categories.map((category, index) => (
                        <div key={index} className="category-card" onClick={() => navigate(category.path)}>
                            <img src={category.image} alt={category.name} className="category-image" />
                            <div className="category-content">
                                <h3 className="category-name">{category.name}</h3>
                                <p className="category-description">{category.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Products Section */}
            <section className="shop-products">
                <h2 className="products-title">Popular Products</h2>
                {loading ? (
                    <div className="loading-spinner"></div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <div className="products-grid">
                        {all_product.map((item, i) => (
                            <Item
                                key={`${item.id}-${i}`}
                                id={item.id}
                                name={item.name}
                                image={item.image}
                                new_price={item.new_price}
                                old_price={item.old_price}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

export default Shop



