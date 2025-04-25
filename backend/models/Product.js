const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    detail_images: [{
        type: String
    }],
    category: {
        type: String,
        required: true,
        enum: ['men', 'women', 'kids']
    },
    clothingType: {
        type: String,
        required: true
    },
    new_price: {
        type: Number,
        required: true,
        min: 0
    },
    old_price: {
        type: Number,
        required: true,
        min: 0
    },
    available: {
        type: Boolean,
        default: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Create indexes for frequently queried fields
productSchema.index({ category: 1 });
productSchema.index({ available: 1 });
productSchema.index({ new_price: 1 });
productSchema.index({ date: -1 });

module.exports = mongoose.model('Product', productSchema); 