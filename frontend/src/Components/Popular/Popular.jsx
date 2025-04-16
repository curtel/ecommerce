import React, { useEffect, useState } from 'react'
import './Popular.css'
import Item from '../Item/Item'
import { API_URL } from '../../config'

const Popular = () => {
    const [popularProducts, setPopularProducts] = useState([]);

    useEffect(() => {
        fetch(`${API_URL}/popularinwomen`)
            .then(response => response.json())
            .then(data => {
                console.log("Fetched products:", data); // For debugging
                setPopularProducts(data);
            })
            .catch(error => {
                console.error('Error fetching popular products:', error);
            });
    }, []);

    return (
        <div className='popular'>
            <h1>POPULAR IN WOMEN</h1>
            <hr />
            <div className="popular-item">
                {popularProducts && popularProducts.map((item, i) => (
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
