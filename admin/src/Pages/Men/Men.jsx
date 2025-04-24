import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import ProductGrid from '../../Components/ProductGrid/ProductGrid';

const Men = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_URL}/products?category=men`);
                const data = await response.json();
                if (data.success) {
                    setProducts(data.products);
                } else {
                    setError('Failed to fetch products');
                }
            } catch (error) {
                setError('Error connecting to server');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="men-page">
            <ProductGrid title="Men's Collection" products={products} />
        </div>
    );
};

export default Men; 