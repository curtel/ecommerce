const mongoose = require('mongoose');

const CartItem = new mongoose.Schema({
    productId: {
        type: Number,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        default: 0,
        min: 0
    }
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    cartData: [CartItem],
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
userSchema.index({ email: 1 });

const Users = mongoose.model('Users', userSchema);

module.exports = Users; 
