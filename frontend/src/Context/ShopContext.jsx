import React, { useEffect, useState } from "react";
import { createContext } from "react";

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {
    const [all_product, setAll_Product] = useState([]);
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        fetch('http://localhost:4000/allproducts')
            .then((response) => response.json())
            .then((data) => setAll_Product(data));

        if (localStorage.getItem('auth-token')) {
            fetch('http://localhost:4000/getcart', {
                method: 'POST',
                headers: {
                    'auth-token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json',
                },
                body: ""
            })
                .then((response) => response.json())
                .then((data) => setCartItems(data));
        }
    }, []);

    const addToCart = (productId, size, quantity) => {
        if (!localStorage.getItem('auth-token')) {
            alert('Please login to add items to cart');
            return;
        }

        const existingItemIndex = cartItems.findIndex(
            item => item.productId === productId && item.size === size
        );

        let updatedCart;
        if (existingItemIndex > -1) {
            // Update quantity if item exists
            updatedCart = cartItems.map((item, index) => {
                if (index === existingItemIndex) {
                    return { ...item, quantity: item.quantity + quantity };
                }
                return item;
            });
        } else {
            // Add new item if it doesn't exist
            updatedCart = [...cartItems, { productId, size, quantity }];
        }

        setCartItems(updatedCart);

        fetch('http://localhost:4000/addtocart', {
            method: 'POST',
            headers: {
                'auth-token': localStorage.getItem('auth-token'),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId, size, quantity })
        })
            .then((response) => response.json())
            .then((data) => console.log(data));
    };

    const removeFromCart = (productId, size) => {
        const updatedCart = cartItems.filter(
            item => !(item.productId === productId && item.size === size)
        );

        setCartItems(updatedCart);

        if (localStorage.getItem('auth-token')) {
            fetch('http://localhost:4000/removefromcart', {
                method: 'POST',
                headers: {
                    'auth-token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productId, size })
            })
                .then((response) => response.json())
                .then((data) => console.log(data));
        }
    };

    const updateCartItem = (productId, size, quantity, newSize = null) => {
        const updatedCart = cartItems.map(item => {
            if (item.productId === productId && item.size === size) {
                return {
                    ...item,
                    quantity: quantity,
                    size: newSize || item.size
                };
            }
            return item;
        });

        setCartItems(updatedCart);

        if (localStorage.getItem('auth-token')) {
            fetch('http://localhost:4000/updatecartitem', {
                method: 'POST',
                headers: {
                    'auth-token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId,
                    size,
                    quantity,
                    newSize
                })
            })
                .then((response) => response.json())
                .then((data) => console.log(data));
        }
    };

    const getTotalCartAmount = () => {
        return cartItems.reduce((total, item) => {
            const product = all_product.find(p => p.id === item.productId);
            return total + (product ? product.new_price * item.quantity : 0);
        }, 0);
    };

    const getTotalCartItems = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const clearCart = () => {
        setCartItems([]);
        
        if (localStorage.getItem('auth-token')) {
            fetch('http://localhost:4000/clearcart', {
                method: 'POST',
                headers: {
                    'auth-token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json',
                }
            })
                .then((response) => response.json())
                .then((data) => console.log(data));
        }
    };

    const contextValue = {
        all_product,
        cartItems,
        addToCart,
        removeFromCart,
        updateCartItem,
        getTotalCartAmount,
        getTotalCartItems,
        clearCart
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider; 