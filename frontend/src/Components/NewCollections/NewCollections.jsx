import React, { useEffect, useState } from 'react'
import './NewCollections.css'
// import new_collections from '../Assets/new_collections'
import Item from '../Item/Item'
import { API_URL, fetchConfig } from '../../config'

const NewCollections = () => {
    const [newCollections, setNewCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNewCollections = async () => {
            try {
                setLoading(true);
                const url = `${API_URL}/newcollections`;
                console.log('Fetching new collections from:', url);
                
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

                console.log('Fetched new collections:', data.length);
                setNewCollections(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching new collections:', err);
                setError(err.message);
                setNewCollections([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNewCollections();
    }, []);

    if (loading) {
        return <div className="loading">Loading new collections...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    return (
        <div className='new-collections'>
            <h1>NEW COLLECTIONS</h1>
            <hr />
            <div className="collections">
                {newCollections.map((item, i) => (
                    <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
                ))}
            </div>
        </div>
    )
}

export default NewCollections
