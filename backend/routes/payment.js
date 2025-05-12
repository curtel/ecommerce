const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const { api, helpers } = require('../utils/zalopayHelper');

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

// Get supported bank list
router.get('/banks', async (req, res) => {
    try {
        const response = await api.getBankList();
        
        if (response.returncode !== 1) {
            return res.status(400).json({
                success: false,
                message: response.returnmessage
            });
        }
        
        res.json({
            success: true,
            banks: response.banks
        });
    } catch (error) {
        console.error('Error getting bank list:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get bank list'
        });
    }
});

// Create ZaloPay payment for an order
router.post('/create-payment/:orderId', fetchUser, async (req, res) => {
    try {

        console.log(req.params);
        // Get order
        const order = await Order.findById(req.params.orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }
        
        // Check if order belongs to the user
        if (order.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to access this order'
            });
        }
        
        // Check payment method
        if (req.body.paymentMethod !== 'zalopay') {
            return res.status(400).json({
                success: false,
                error: 'Invalid payment method'
            });
        }
        
        // Prepare order data for ZaloPay
        const orderData = {
            _id: order._id,
            userId: order.userId,
            items: order.items,
            totalAmount: order.totalAmount,
            bankcode: req.body.bankcode || ""
        };
        // Create payment in ZaloPay
        const response = await api.createOrder(orderData, req.params.orderId);
        
        if (response.returncode !== 1) {
            return res.status(400).json({
                success: false,
                message: response.returnmessage
            });
        }
        
        // Update order with payment information
        order.payment = {
            method: 'zalopay',
            status: 'pending',
            apptransid: response.apptransid,
            zptranstoken: response.zptranstoken,
            amount: order.totalAmount
        };
        
        await order.save();
        
        // Return payment URL
        res.json({
            success: true,
            orderurl: response.orderurl,
            zptranstoken: response.zptranstoken,
            orderId: order._id
        });
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create payment'
        });
    }
});

// Handle ZaloPay callback
router.post('/callback', async (req, res) => {
    try {
        // Extract data from the request
        const data = req.body;
        
        // Validate data
        const dataStr = `${data.appid}|${data.apptransid}|${data.appuser}|${data.amount}|${data.apptime}|${data.embeddata}|${data.item}`;
        const requestMac = data.mac;
        
        // Generate MAC for verification
        const mac = require('crypto')
            .createHmac('sha256', process.env.ZALOPAY_KEY2 || "Iyz2habzyr7AG8SgvoBCbKwKi3UzlLi3")
            .update(dataStr)
            .digest('hex');
        
        // Verify MAC
        if (mac !== requestMac) {
            return res.status(400).json({
                return_code: -1,
                return_message: 'Invalid MAC'
            });
        }
        
        // Find order by apptransid
        const order = await Order.findOne({
            'payment.apptransid': data.apptransid
        });
        
        if (!order) {
            return res.status(404).json({
                return_code: -1,
                return_message: 'Order not found'
            });
        }
        
        // Update order payment status
        order.payment.status = data.status === 1 ? 'completed' : 'failed';
        
        // If payment successful, update order status to confirmed
        if (data.status === 1) {
            order.status = 'confirmed';
        }
        
        await order.save();
        
        // Return success
        res.json({
            return_code: 1,
            return_message: 'Success'
        });
    } catch (error) {
        console.error('Error handling callback:', error);
        res.status(500).json({
            return_code: -1,
            return_message: 'Server error'
        });
    }
});

// Handle redirect from ZaloPay
router.get('/redirect', async (req, res) => {
    try {
        // Extract data from the request
        const data = req.query;
        
        // Verify redirect data
        if (!helpers.verifyRedirect(data)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid redirect data'
            });
        }
        
        // Find order by apptransid
        const order = await Order.findOne({
            'payment.apptransid': data.apptransid
        });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }
        
        // Check if we already received a callback
        if (order.payment.status === 'pending') {
            // Query payment status from ZaloPay
            const response = await api.getOrderStatus(data.apptransid);
            
            if (response.returncode === 1) {
                // Update order payment status
                order.payment.status = response.status === 1 ? 'completed' : 'failed';
                
                // If payment successful, update order status to confirmed
                if (response.status === 1) {
                    order.status = 'confirmed';
                }
                
                await order.save();
            }
        }
        
        // Redirect to frontend with the result
        const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/result?orderId=${order._id}&status=${order.payment.status}`;
        
        res.redirect(redirectUrl);
    } catch (error) {
        console.error('Error handling redirect:', error);
        
        // Redirect to frontend with error
        const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/result?error=1`;
        
        res.redirect(redirectUrl);
    }
});

// Check payment status
router.get('/status/:orderId', fetchUser, async (req, res) => {
    try {
        // Get order
        const order = await Order.findById(req.params.orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }
        
        // Check if order belongs to the user
        if (order.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to access this order'
            });
        }
        
        // Check if payment method is ZaloPay
        if (order.payment.method !== 'zalopay') {
            return res.status(400).json({
                success: false,
                error: 'Not a ZaloPay payment'
            });
        }
        
        // If payment is pending, check status from ZaloPay
        if (order.payment.status === 'pending' && order.payment.apptransid) {
            try {
                const response = await api.getOrderStatus(order.payment.apptransid);
                
                if (response.returncode === 1) {
                    // Update order payment status
                    order.payment.status = response.status === 1 ? 'completed' : 'failed';
                    
                    // If payment successful, update order status to confirmed
                    if (response.status === 1) {
                        order.status = 'confirmed';
                    }
                    
                    await order.save();
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
                // Continue with the current payment status
            }
        }
        
        // Return payment status
        res.json({
            success: true,
            payment: {
                method: order.payment.method,
                status: order.payment.status
            },
            orderStatus: order.status
        });
    } catch (error) {
        console.error('Error getting payment status:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get payment status'
        });
    }
});

module.exports = router; 
