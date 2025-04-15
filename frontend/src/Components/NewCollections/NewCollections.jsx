import React, { useEffect, useState } from 'react'
import './NewCollections.css'
// import new_collections from '../Assets/new_collections'
import Item from '../Item/Item'

const NewCollections = () => {
    const [newCollections, setNewCollections] = useState([]);

    useEffect(() => {
        // Fetch new collections (all categories)
        fetch('http://localhost:4000/newcollections')
            .then(response => response.json())
            .then(data => {
                // Get a mix of items from all categories
                const mixedCollections = data.sort(() => 0.5 - Math.random()).slice(0, 8);
                setNewCollections(mixedCollections);
            })
            .catch(error => console.error('Error fetching new collections:', error));
    }, []);

    return (
        <div className='new-collections'>
            <h1>NEW COLLECTIONS</h1>
            <hr />
            <div className="collections">
                {newCollections.map((item, i) => {
                    return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
                })}
            </div>
        </div>
    )
}

export default NewCollections
