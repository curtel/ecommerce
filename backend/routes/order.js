const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');
const Users = require('../models/Users');
const mongoose = require('mongoose');

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

// Create new order
router.post('/create-order', fetchUser, async (req, res) => {
    try {
        console.log(req.body);
        
        // Process items to ensure productId is a valid ObjectId
        const processedItems = req.body.items.map(item => {
            // Create a new object with all properties except productId
            const { productId, ...otherProps } = item;
            
            // Return a new object with a properly created ObjectId
            return {
                ...otherProps,
                productId: new mongoose.Types.ObjectId() // Generate a new ObjectId regardless of input
            };
        });

        const order = new Order({
            userId: req.user.id,
            items: processedItems,
            totalAmount: req.body.totalAmount,
            shippingAddress: req.body.shippingAddress,
        });
        await order.save();
        res.json({
            success: true,
            orderId: order._id
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get user's orders
router.get('/user-orders/:userId', async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId }).sort({ date: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Clear cart after order
router.post('/clearcart', fetchUser, async (req, res) => {
    try {
        const user = await Users.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        user.cartData = user.cartData.map(item => ({ ...item, quantity: 0 }));
        await user.save();
        res.json({ success: true, cart: [] });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

module.exports = router; 
