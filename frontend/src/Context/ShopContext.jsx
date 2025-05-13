import React, { useEffect, useState } from "react";
import { createContext } from "react";
import { API_URL, fetchConfig } from '../config';

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {
    const [all_product, setAll_Product] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortOption, setSortOption] = useState('newest');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedClothingType, setSelectedClothingType] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedMaterial, setSelectedMaterial] = useState('');
    const [initialFetchDone, setInitialFetchDone] = useState(false);

    // Hàm helper để check response
    const handleResponse = async (response) => {
        if (!response.ok) {
            const errorMessage = `HTTP error! status: ${response.status}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const errorMessage = `Expected JSON response but got ${contentType}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }

        return response.json();
    };

    // Fetch products with filters and sorting
    const fetchProducts = async (category = '', page = 1, sort = 'newest', size = '', clothingType = '', color = '', material = '') => {
        try {
            setLoading(true);
            
            // Build query parameters
            const queryParams = new URLSearchParams();
            
            // Add all non-empty filter parameters
            queryParams.append('page', page);
            if (sort) queryParams.append('sort', sort);
            if (category) queryParams.append('category', category);
            if (size) queryParams.append('size', size);
            if (clothingType) queryParams.append('clothingType', clothingType.toLowerCase());
            if (color) queryParams.append('color', color);
            if (material) queryParams.append('material', material);

            console.log('Fetching products with params:', Object.fromEntries(queryParams.entries()));
            
            const response = await fetch(`${API_URL}/products?${queryParams}`, {
                ...fetchConfig,
                method: 'GET'
            });
            const data = await handleResponse(response);
            
            // Check if data and required properties exist
            if (!data || !data.products) {
                throw new Error('Invalid response format from server');
            }
            
            if (page === 1) {
                setAll_Product(data.products);
            } else {
                setAll_Product(prev => [...prev, ...data.products]);
            }

            // Safely access pagination data with default values
            const totalPages = data.totalPages || 1;
            const currentPageFromServer = data.currentPage || 1;

            setTotalPages(totalPages);
            setCurrentPage(currentPageFromServer);
            setError(null);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(err.message);
            if (page === 1) {
                setAll_Product([]);
            }
            // Set default values in case of error
            setTotalPages(1);
            setCurrentPage(1);
        } finally {
            setLoading(false);
        }
    };

    // Update filters and fetch products
    const updateFilters = async (category = '', filters = null) => {
        let sort = sortOption;
        let size = selectedSize;
        let clothingType = selectedClothingType;
        let color = selectedColor;
        let material = selectedMaterial;
        
        // If filters object is provided, extract the values
        if (filters) {
            // Extract sort option if provided
            if (filters.sort) {
                sort = filters.sort;
            }
            
            // Map the filter values to the expected parameters
            if (filters.size && filters.size.length > 0) {
                size = filters.size.join(',');
            }
            
            if (filters.category && filters.category.length > 0) {
                clothingType = filters.category.map(cat => cat.toLowerCase()).join(',');
            }
            
            if (filters.color && filters.color.length > 0) {
                color = filters.color.join(',');
            }
            
            if (filters.material && filters.material.length > 0) {
                material = filters.material.join(',');
            }
        }
        
        // Skip if this is just the initial category filter and we're still loading
        if (category && !size && !clothingType && !color && !material && sort === 'newest' && initialFetchDone) {
            // If just the basic category is changed and nothing else, fetch again
            setSortOption(sort);
            setSelectedSize(size);
            setSelectedClothingType(clothingType);
            setSelectedColor(color);
            setSelectedMaterial(material);
            setCurrentPage(1); // Reset to first page when filters change
            await fetchProducts(category, 1, sort, size, clothingType, color, material);
            return;
        }

        // Regular filter update
        setSortOption(sort);
        setSelectedSize(size);
        setSelectedClothingType(clothingType);
        setSelectedColor(color);
        setSelectedMaterial(material);
        setCurrentPage(1); // Reset to first page when filters change
        await fetchProducts(category, 1, sort, size, clothingType, color, material);
    };

    // Load more products (next page)
    const loadMoreProducts = async (category = '') => {
        if (currentPage < totalPages && !loading) {
            const nextPage = currentPage + 1;
            await fetchProducts(
                category, 
                nextPage, 
                sortOption, 
                selectedSize, 
                selectedClothingType,
                selectedColor,
                selectedMaterial
            );
        }
    };

    useEffect(() => {
        const initializeShop = async () => {
            try {
                // Skip initial product fetch - ShopCategory will handle this
                // Instead, just fetch the cart
                const token = localStorage.getItem('auth-token');
                if (!token) {
                    setCartItems([]);
                    setLoading(false);
                    return;
                }
                
                const response = await fetch(`${API_URL}/user/cart`, {
                    ...fetchConfig,
                    method: 'GET',
                    headers: {
                        ...fetchConfig.headers,
                        'auth-token': token
                    }
                });
                
                const data = await handleResponse(response);
                setCartItems(data);
                setError(null);
                setInitialFetchDone(true);
                setLoading(false);
            } catch (err) {
                console.error('Error initializing shop:', err);
                setError(err.message);
                setCartItems([]);
                setLoading(false);
            }
        };

        initializeShop();
    }, []);

    const addToCart = async (productId, size, quantity) => {
        const token = localStorage.getItem('auth-token');
        if (!token) {
            throw new Error('Please login to add items to cart');
        }

        try {
            const response = await fetch(`${API_URL}/user/addtocart`, {
                ...fetchConfig,
                method: 'POST',
                headers: {
                    ...fetchConfig.headers,
                    'auth-token': token
                },
                body: JSON.stringify({ productId, size, quantity })
            });

            const data = await handleResponse(response);
            if (data.success) {
                setCartItems(data.cart);
                setError(null);
                return data;
            } else {
                throw new Error(data.error || 'Failed to add to cart');
            }
        } catch (err) {
            console.error('Error adding to cart:', err);
            setError(err.message);
            throw err; // Re-throw to handle in components
        }
    };

    const removeFromCart = async (productId, size) => {
        const token = localStorage.getItem('auth-token');
        if (!token) return;

        try {
            const response = await fetch(`${API_URL}/user/removefromcart`, {
                ...fetchConfig,
                method: 'POST',
                headers: {
                    ...fetchConfig.headers,
                    'auth-token': token
                },
                body: JSON.stringify({ productId, size })
            });

            const data = await handleResponse(response);
            if (data.success) {
                setCartItems(data.cart);
                setError(null);
            }
        } catch (err) {
            console.error('Error removing from cart:', err);
            setError(err.message);
        }
    };

    const updateCartItem = async (productId, size, quantity, newSize) => {
        const token = localStorage.getItem('auth-token');
        if (!token) return;

        try {
            const response = await fetch(`${API_URL}/user/updatecartitem`, {
                ...fetchConfig,
                method: 'POST',
                headers: {
                    ...fetchConfig.headers,
                    'auth-token': token
                },
                body: JSON.stringify({
                    productId,
                    size,
                    quantity,
                    newSize
                })
            });

            const data = await handleResponse(response);
            if (data.success) {
                setCartItems(data.cart);
                setError(null);
            }
        } catch (err) {
            console.error('Error updating cart item:', err);
            setError(err.message);
        }
    };

    const clearCart = async () => {
        const token = localStorage.getItem('auth-token');
        if (!token) return;

        try {
            const response = await fetch(`${API_URL}/order/clearcart`, {
                ...fetchConfig,
                method: 'POST',
                headers: {
                    ...fetchConfig.headers,
                    'auth-token': token
                }
            });

            const data = await handleResponse(response);
            if (data.success) {
                setCartItems([]);
                setError(null);
            }
        } catch (err) {
            console.error('Error clearing cart:', err);
            setError(err.message);
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

    const contextValue = {
        all_product,
        cartItems,
        setCartItems,
        loading,
        error,
        currentPage,
        totalPages,
        sortOption,
        selectedSize,
        selectedClothingType,
        selectedColor,
        selectedMaterial,
        addToCart,
        removeFromCart,
        updateCartItem,
        getTotalCartAmount,
        getTotalCartItems,
        clearCart,
        updateFilters,
        loadMoreProducts,
        initialFetchDone
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider; 
