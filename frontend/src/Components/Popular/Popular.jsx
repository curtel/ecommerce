import React, { useEffect, useState } from 'react'
import './Popular.css'
import Item from '../Item/Item'
import { API_URL, fetchConfig } from '../../config'

const Popular = () => {
    const [popularProducts, setPopularProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPopularProducts = async () => {
            try {
                setLoading(true);
                const url = `${API_URL}/popularinwomen`;
                console.log('Fetching women\'s products from:', url);
                
                const response = await fetch(url, {
                    ...fetchConfig,
                    method: 'GET'
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                if (!Array.isArray(data)) {
                    console.error('Invalid data format:', data);
                    throw new Error('Invalid data format received');
                }

                // Verify these are women's products
                const womenProducts = data.filter(product => product.category === 'women');
                if (womenProducts.length === 0) {
                    throw new Error('No women\'s products found');
                }

                console.log('Fetched women\'s products:', womenProducts.length);
                setPopularProducts(womenProducts);
                setError(null);
            } catch (err) {
                console.error('Error fetching women\'s products:', err);
                setError(err.message);
                setPopularProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPopularProducts();
    }, []);

    if (loading) {
        return (
            <div className='popular'>
                <h1>POPULAR IN WOMEN</h1>
                <hr />
                <div className="popular-item">
                    <div className="loading">Loading women's products...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='popular'>
                <h1>POPULAR IN WOMEN</h1>
                <hr />
                <div className="popular-item error-message">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className='popular'>
            <h1>POPULAR IN WOMEN</h1>
            <hr />
            <div className="popular-item">
                {popularProducts.map((item, i) => (
                    <Item 
                        key={i} 
                        id={item.id} 
                        name={item.name} 
                        image={item.image} 
                        new_price={item.new_price} 
                        old_price={item.old_price}
                    />
                ))}
            </div>
        </div>
    )
}

export default Popular
