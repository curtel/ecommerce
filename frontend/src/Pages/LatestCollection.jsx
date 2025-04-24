import React, { useEffect, useState } from 'react';
import './CSS/LatestCollection.css';
import Item from '../Components/Item/Item';
import { API_URL } from '../config';

const LatestCollection = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLatestCollection = async () => {
            try {
                const response = await fetch(`${API_URL}/latest-collection`);
                if (!response.ok) {
                    throw new Error('Failed to fetch latest collection');
                }
                const data = await response.json();
                setProducts(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchLatestCollection();
    }, []);

    if (loading) {
        return <div className="latest-collection loading">Loading...</div>;
    }

    if (error) {
        return <div className="latest-collection error">Error: {error}</div>;
    }

    return (
        <div className="latest-collection">
            <h1>Latest Collection</h1>
            <hr />
            <div className="latest-collection-items">
                {products.map((item) => (
                    <Item
                        key={item.id}
                        id={item.id}
                        name={item.name}
                        image={item.image}
                        new_price={item.new_price}
                        old_price={item.old_price}
                    />
                ))}
            </div>
        </div>
    );
};

export default LatestCollection; 