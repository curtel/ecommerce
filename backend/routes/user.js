const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Users = require('../models/Users');

// Middleware to fetch user
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({errors: "Please authenticate using valid token"})
    }
    else{
        try {
            const data = jwt.verify(token, 'secret_ecom');
            req.user = data.user;
            next();
        } catch (error) {
            res.status(401).send({errors: "Please authenticate using valid token"});
        }
    }
}

// Register user
router.post('/signup', async (req, res) => {
    try {
        let check = await Users.findOne({email: req.body.email});

        if(check){
            return res.status(400).json({success: false, error: "Existing User found with same email address"});
        }

        let cart = [];
        for(let i = 0; i < 300 + 1; ++i){
            cart.push({
                productId: i,
                size: 'S',
                quantity: 0
            });
        }

        const user = new Users({
            name: req.body.username,
            email: req.body.email,
            password: req.body.password,
            cartData: cart,
        });

        await user.save();
        const data = {
            user: {
                id: user.id
            }
        }
        const token = jwt.sign(data, 'secret_ecom');
        res.json({success: true, token})
    } catch (error) {
        console.error('Error in signup:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create user'
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        let user = await Users.findOne({email: req.body.email});

        if(user){
            const passCompare = req.body.password === user.password;
            if(passCompare){
                const data = {
                    user: {
                        id: user.id
                    }
                }
                const token = jwt.sign(data, 'secret_ecom');
                res.json({success: true, token});
            }
            else{
                res.json({success: false, errors: "Wrong Password"})
            }
        }
        else{
            res.json({success: false, errors: "Wrong Email Id"});
        }
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Login failed'
        });
    }
});

// Add to cart
router.post('/addtocart', async (req, res) => {
    try {
        const token = req.headers['auth-token'];
        if (!token) {
            return res.status(401).json({ success: false, error: 'No authentication token provided' });
        }

        const decoded = jwt.verify(token, 'secret_ecom');
        const user = await Users.findById(decoded.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const { productId, size, quantity } = req.body;
        
        const existingItemIndex = user.cartData.findIndex(
            item => item.productId === productId && item.size === size
        );

        if (existingItemIndex > -1) {
            user.cartData[existingItemIndex].quantity += quantity;
        } else {
            user.cartData.push({ productId, size, quantity });
        }

        await user.save();
        res.json({ success: true, cart: user.cartData.filter(item => item.quantity > 0) });
    } catch (error) {
        console.error('Error adding to cart:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, error: 'Invalid token' });
        }
        res.status(500).json({ success: false, error: 'Error adding to cart' });
    }
});

// Remove from cart
router.post('/removefromcart', fetchUser, async (req, res) => {
    try {
        const { productId, size } = req.body;
        const user = await Users.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        user.cartData = user.cartData.filter(
            item => !(item.productId === productId && item.size === size)
        );

        await user.save();
        res.json({ success: true, cart: user.cartData.filter(item => item.quantity > 0) });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// Get cart
router.get('/cart', async (req, res) => {
    try {
        const token = req.headers['auth-token'];
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Authentication token is required'
            });
        }

        const decoded = jwt.verify(token, 'secret_ecom');
        const user = await Users.findById(decoded.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json(user.cartData || []);
    } catch (error) {
        console.error('Error in /getcart:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token'
            });
        }
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch cart'
        });
    }
});

// Update cart item
router.post('/updatecartitem', fetchUser, async (req, res) => {
    try {
        const { productId, size, quantity, newSize } = req.body;
        const user = await Users.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        const cartItemIndex = user.cartData.findIndex(
            item => item.productId === productId && item.size === size
        );

        if (cartItemIndex > -1) {
            user.cartData[cartItemIndex].quantity = quantity;
            if (newSize) {
                user.cartData[cartItemIndex].size = newSize;
            }
        }

        await user.save();
        res.json({ success: true, cart: user.cartData.filter(item => item.quantity > 0) });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

module.exports = router; 
