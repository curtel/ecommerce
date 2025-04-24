import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import ProductGrid from '../../Components/ProductGrid/ProductGrid';

const Women = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('newest');
    const [priceRange, setPriceRange] = useState({ min: null, max: null });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const queryParams = new URLSearchParams({
                    category: 'women',
                    sort: sortBy,
                    ...(priceRange.min && { minPrice: priceRange.min }),
                    ...(priceRange.max && { maxPrice: priceRange.max })
                });

                const response = await fetch(`${API_URL}/products?${queryParams}`);
                const data = await response.json();
                
                if (data.success) {
                    setProducts(data.products || []);
                } else {
                    setError('Failed to fetch products');
                }
            } catch (error) {
                console.error('Error fetching products:', error);
                setError('Error connecting to server');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [sortBy, priceRange]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="women-page">
            <ProductGrid 
                title="Women's Collection" 
                products={products} 
            />
        </div>
    );
};

export default Women; 