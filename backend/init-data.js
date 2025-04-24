const axios = require('axios');

const initializeData = async () => {
    try {
        // Initialize men's products
        await axios.post('http://localhost:4000/init-men-products');
        console.log('Men products initialized successfully');

        // Initialize women's products
        await axios.post('http://localhost:4000/init-women-products');
        console.log('Women products initialized successfully');

        // Initialize popular products
        await axios.post('http://localhost:4000/init-popular-products');
        console.log('Popular products initialized successfully');

        console.log('All data initialized successfully');
    } catch (error) {
        console.error('Error initializing data:', error);
    }
};

initializeData(); 