const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require('fs');
const adminAuthRouter = require('./routes/adminAuth');
const orderRouter = require('./routes/order');
const userRouter = require('./routes/user');
const Users = require('./models/Users');
const paymentRouter = require('./routes/payment');
require('dotenv').config();

// Create upload directory if it doesn't exist
const uploadDir = './upload/images';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware configuration
app.use(express.json());

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'], // Replace with your frontend origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'auth-token'],
    credentials: true  // Allow credentials
}));

// Enable pre-flight requests for all routes
app.options('*', cors());

// Global middleware to set JSON headers
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/ecommerce', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Connected to MongoDB successfully');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

// Routes
app.use('/api/admin', adminAuthRouter);
app.use('/api/order', orderRouter);
app.use('/api/user', userRouter);
app.use('/api/payment', paymentRouter);
// Test route to verify server is working
app.get('/api/test', (req, res) => {
    res.json({ message: 'Test endpoint is working' });
});

//API Creation

app.get('/api/allproducts', async (req, res) => {
    try {
        const products = await Product.find({});
        console.log('Products fetched:', products.length);
        res.json(products);
    } catch (error) {
        console.error('Error in /allproducts:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch products'
        });
    }
});

//Image storage Engine

const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({ storage: storage })

//Creating Upload endpoint images
app.use('/images', express.static('upload/images'))

app.post("/upload", upload.single('product'), (req, res) => {
    // Get the host and protocol from the request headers
    const host = req.get('host');
    const protocol = req.protocol || 'http';

    res.json({
        success: 1,
        image_url: `${protocol}://${host}/images/${req.file.filename}`
    })
})

//Schema for Creating products

const Product = mongoose.model("Product", {
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    detail_images: {
        type: [String],
        default: []
    },
    category: {
        type: String,
        required: true,
    },
    clothingType: {
        type: String,
        enum: ['shirt', 'pants', 't-shirt', 'dress'],
        required: true
    },
    new_price: {
        type: Number,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    sizes: {
        type: [String],
        default: ['S', 'M', 'L', 'XL']
    },
    date: {
        type: Date,
        default: Date.now,
    },
    available: {
        type: Boolean,
        default: true,
    },
});

app.post('/addproduct', async (req, res) => {
    let products = await Product.find({});
    let id;
    if (products.length > 0) {
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id + 1;
    }
    else {
        id = 1;
    }
    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        detail_images: req.body.detail_images || [],
        category: req.body.category,
        clothingType: req.body.clothingType,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
    });

    console.log(product);
    await product.save();
    console.log('Saved');

    res.json({
        success: true,
        product: req.body.name,
    })
});

// Creating API Deleting Products

app.post('/api/removeproduct', async (req, res) => {
    await Product.findOneAndDelete({ id: req.body.id });
    res.json({
        success: true,
        name: req.body.name,
    })
})

// Creating API for updating product
app.post('/api/updateproduct', async (req, res) => {
    try {
        const { id, name, category, clothingType, new_price, old_price, image, detail_images, removed_images, new_images } = req.body;
        
        // Find the product by ID
        const product = await Product.findOne({ id });
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Update basic product information
        product.name = name;
        product.category = category;
        product.clothingType = clothingType;
        product.new_price = new_price;
        product.old_price = old_price;
        
        // Update main image if provided
        if (image) {
            product.image = image;
        }
        
        // Handle detail images
        if (detail_images) {
            // Filter out any removed images
            const updatedDetailImages = detail_images.filter(img => !removed_images?.includes(img));
            
            // Add any new images
            if (new_images && new_images.length > 0) {
                updatedDetailImages.push(...new_images);
            }
            
            product.detail_images = updatedDetailImages;
        }
        
        // Save the updated product
        await product.save();
        
        res.json({
            success: true,
            product: product
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update product'
        });
    }
})

//Creating API for geting All Products

app.get('/api/allproducts', async (req, res) => {
    try {
        let products = await Product.find({});
        console.log("ALL Products Fetched");
        res.json({
            success: true,
            count: products.length,
            products: products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch products'
        });
    }
})

// API for getting popular products in women category
app.get('/api/popularinwomen', async (req, res) => {
    try {
        const products = await Product.find({
            category: 'women',
            // You can add additional criteria here for "popular" items
            // For example, sort by date or some popularity metric
        }).sort({ date: -1 }).limit(8);  // Get latest 8 items

        console.log("Popular women products fetched:", products.length);
        res.json(products);
    } catch (error) {
        console.error('Error in /popularinwomen:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch popular women products'
        });
    }
});

// API for getting new collections
app.get('/api/newcollections', async (req, res) => {
    try {
        const newProducts = await Product.find({
            available: true
        })
            .sort({ date: -1 })  // Sort by date, newest first
            .limit(8);          // Get latest 8 items

        console.log("New collections fetched:", newProducts.length);
        res.json(newProducts);
    } catch (error) {
        console.error('Error in /newcollections:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch new collections'
        });
    }
});

// API for getting filtered and sorted products
app.get('/api/products', async (req, res) => {
    try {
        const { category, sort, clothingType, size, color, material, minPrice, maxPrice, page = 1, limit = 12 } = req.query;
        const skip = (page - 1) * limit;

        let query = { available: true }; // Only get available products

        if (category) {
            // Handle both "kid" and "kids" categories case-insensitively
            const categoryRegex = new RegExp(`^${category}s?$`, 'i');
            query.category = categoryRegex;
        }

        console.log('[Products] clothingType:', clothingType);
        if (clothingType) {
            // Handle comma-separated clothingType values
            const types = clothingType.split(',');
            if (types.length > 1) {
                query.clothingType = { $in: types };
            } else {
                query.clothingType = clothingType;
            }
        }

        // Handle size filter (sizes are stored as an array in the database)
        if (size) {
            const sizes = size.split(',');
            if (sizes.length > 1) {
                // Find products that have ANY of the specified sizes
                query.sizes = { $in: sizes };
            } else {
                // Find products that have this specific size
                query.sizes = size;
            }
        }

        // Handle color filter if we add it to the schema later
        if (color) {
            const colors = color.split(',');
            if (colors.length > 1) {
                query.color = { $in: colors };
            } else {
                query.color = color;
            }
        }

        // Handle material filter if we add it to the schema later
        if (material) {
            const materials = material.split(',');
            if (materials.length > 1) {
                query.material = { $in: materials };
            } else {
                query.material = material;
            }
        }

        if (minPrice || maxPrice) {
            query.new_price = {};
            if (minPrice) query.new_price.$gte = parseInt(minPrice);
            if (maxPrice) query.new_price.$lte = parseInt(maxPrice);
        }

        let sortQuery = {};
        switch (sort) {
            case 'price_asc':
                sortQuery = { new_price: 1 };
                break;
            case 'price_desc':
                sortQuery = { new_price: -1 };
                break;
            case 'newest':
                sortQuery = { date: -1 };
                break;
            default:
                sortQuery = { date: -1 }; // Default to newest
        }

        // Log the final query for debugging
        console.log('MongoDB Query:', JSON.stringify(query));
        console.log('Sort Query:', JSON.stringify(sortQuery));

        const products = await Product.find(query)
            .sort(sortQuery)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Product.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            products,
            total,
            currentPage: parseInt(page),
            totalPages,
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            products: [],
            total: 0,
            currentPage: 1,
            totalPages: 1,
            limit: 12
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log("Server is running on port " + port);
});
