const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require('fs');
const { log } = require("console");
const { generateSampleData } = require('./genarate');

// Create upload directory if it doesn't exist
const uploadDir = './upload/images';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware configuration
app.use(express.json());

// CORS configuration
app.use(cors({
    origin: '*',  // Allow any origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
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
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerce', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB successfully');
})
.catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Test route to verify server is working
app.get('/test', (req, res) => {
    res.json({ message: 'Test endpoint is working' });
});

//API Creation

app.get('/allproducts', async (req, res) => {
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

const upload = multer({storage: storage})

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
        enum: ['shirt', 'pants'],
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
    let products=await Product.find({});
    let id;
    if(products.length>0){
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id=last_product.id+1;
    }
    else{
        id=1;
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

//Creating API Deleting Products

app.post('/removeproduct',async (req,res)=>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Remove");
    res.json({
        success:true,
        name:req.body.name,
    })
})

//Creating API for geting All Products

app.get('/allproducts',async (req,res)=>{
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
app.get('/popularinwomen', async (req, res) => {
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
app.get('/newcollections', async (req, res) => {
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

// Schema for userModel

const CartItem = {
    productId: Number,
    size: String,
    quantity: Number
};

const Users = mongoose.model('Users',{
    name: {
        type: String,
    },
    email:{
        type: String,
        unique: true
    },
    password: {
        type: String,
    },
    cartData: [{
        type: CartItem
    }],
    date:{
        type: Date,
        default: Date.now,
    }
})

// Creating andpoint for registering users

app.post('/signup',async (req,res)=>{
    let check = await Users.findOne({email:req.body.email});

    if(check){
        return res.status(400).json({success:false, error:"Existing User found with same email address"});
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

    // console.log(user.cartData);

    await user.save();
    const data = {
        user: {
            id: user.id
        }
    }
    const token = jwt.sign(data, 'secret_ecom');
    res.json({success: true, token})
})

// creating endpoint for Userlogin

app.post('/login', async (req, res) => {
    let user = await Users.findOne({email:req.body.email});

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
            res.json({success:false,errors:"Wrong Password"})
        }
    }
    else{
        res.json({success:false, errors:"Wrong Email Id"});
    }
})

// creating endpoint for new collection
app.get('/newcollections', async (req, res) => {
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

// creating endpoint for popular in women section
app.get('/popularinwomen', async (req, res) => {
    try {
        const products = await Product.find({ 
            category: 'women',
            available: true 
        })
        .sort({ date: -1 })
        .limit(8);  // Get latest 8 items
        
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

// creating endpoint for men's products
app.get('/popularinmen', async (req, res) => {
    try {
        // 1. Fetch sản phẩm nam mới nhất
        let products = await Product.find({ category: "men" })
            .sort({ date: -1 })
            .limit(8);

        // 2. Kiểm tra và khởi tạo dữ liệu nếu cần
        if (!products || products.length === 0) {
            const sampleProducts = generateSampleData(8).map(product => ({
                ...product,
                category: 'men'
            }));
            await Product.insertMany(sampleProducts);
            
            // Fetch lại sau khi khởi tạo
            products = await Product.find({ category: "men" })
                .sort({ date: -1 })
                .limit(8);
        }

        console.log("Popular in men fetched successfully:", products.length, "products");
        res.json(products);
    } catch (error) {
        console.error('Error fetching popular men products:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch popular men products' 
        });
    }
});

// creating middleware to fetch user

const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({errors: "Please authenticate using valid token as token not found"})
    }
    else{
        try {
            const data = jwt.decode(token,'secret_ecom');
            req.user = data.user;
            next();
        } catch (error) {
            res.status(401).send({errors: "Please authenticate using valid token as it enters in catch block"});
        }
    }
}

// creating endpoint for adding products in cartdata

app.post('/addtocart', async (req, res) => {
    try {
        const token = req.headers['auth-token'];
        if (!token) {
            return res.status(401).json({ success: false, error: 'No authentication token provided' });
        }

        const decoded = jwt.verify(token, 'secret_ecom'); // Use same secret as signup
        const user = await Users.findById(decoded.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const { productId, size, quantity } = req.body;
        
        // Check if item already exists in cart
        const existingItemIndex = user.cartData.findIndex(
            item => item.productId === productId && item.size === size
        );

        if (existingItemIndex > -1) {
            // Update quantity if item exists
            user.cartData[existingItemIndex].quantity += quantity;
        } else {
            // Add new item if it doesn't exist
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

// creating endpoint to remove from cartdata

app.post('/removefromcart', fetchUser, async (req, res) => {
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

// creating endpoint to get cartdata

app.post('/getcart', async (req, res) => {
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

// Add update cart item endpoint
app.post('/updatecartitem', fetchUser, async (req, res) => {
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

// Serve any image dynamically
app.get('/images/:image', (req, res) => {
    const imageName = req.params.image; // Get the image name from the URL
    const imagePath = path.join(__dirname, 'upload/images', imageName); // Construct the image path
    const defaultImagePath = path.join(__dirname, 'upload/images', 'default-product.png');

    res.sendFile(imagePath, (err) => {
        if (err) {
            console.error(`Image not found: ${imageName}, serving default image instead`);
            // Serve the default image instead
            res.sendFile(defaultImagePath, (defaultErr) => {
                if (defaultErr) {
                    console.error('Error serving default image:', defaultErr);
                    res.status(500).send("Error serving image");
                }
            });
        }
    });
});

// Schema for Order
const Order = mongoose.model('Order', {
    userId: {
        type: String,
        required: true,
    },
    items: [{
        productId: Number,
        quantity: Number,
        price: Number,
        name: String,
    }],
    totalAmount: {
        type: Number,
        required: true,
    },
    shippingAddress: {
        fullName: String,
        address: String,
        city: String,
        phone: String,
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'confirmed', 'shipped', 'delivered']
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

// API to create new order
app.post('/create-order', fetchUser, async (req, res) => {
    try {
        const order = new Order({
            userId: req.user.id, // Get userId from fetchUser middleware
            items: req.body.items,
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

// API to get user's orders
app.get('/user-orders/:userId', async (req, res) => {
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

// API to clear cart
app.post('/clearcart', fetchUser, async (req, res) => {
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

// API to initialize sample products for men's category
app.post('/init-men-products', async (req, res) => {
    try {
        const menProducts = generateSampleData(8).map(product => ({
            ...product,
            category: 'men'
        }));

        // Insert men's products
        await Product.insertMany(menProducts);

        res.status(200).json({
            success: true,
            message: "Men's fashion products initialized successfully",
            products: menProducts
        });
    } catch (error) {
        console.error("Error initializing men's products:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API to initialize sample products for women's category
app.post('/init-women-products', async (req, res) => {
    try {
        const womenProducts = generateSampleData(8).map(product => ({
            ...product,
            category: 'women'
        }));

        // Insert women's products
        await Product.insertMany(womenProducts);

        res.status(200).json({
            success: true,
            message: "Women's fashion products initialized successfully",
            products: womenProducts
        });
    } catch (error) {
        console.error("Error initializing women's products:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API to initialize popular products
app.post('/init-popular-products', async (req, res) => {
    try {
        const popularProducts = generateSampleData(8);

        // Insert popular products
        await Product.insertMany(popularProducts);

        res.status(200).json({
            success: true,
            message: "Popular products initialized successfully",
            products: popularProducts
        });
    } catch (error) {
        console.error("Error initializing popular products:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API to initialize latest collection
app.post('/init-latest-collection', async (req, res) => {
    try {
        const latestProducts = generateSampleData(8);

        // Insert latest collection products
        await Product.insertMany(latestProducts);

        res.status(200).json({
            success: true,
            message: "Latest collection initialized successfully",
            products: latestProducts
        });
    } catch (error) {
        console.error("Error initializing latest collection:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Endpoint to add banner suit product
app.post('/add-banner-suit', async (req, res) => {
    try {
        const bannerSuit = {
            id: 2009,
            name: "Premium Navy Business Suit",
            category: "men",
            image: "https://i.pinimg.com/564x/32/37/d3/3237d3fe1f8c352150baf1ed5c2aa51c.jpg",
            new_price: 399.99,
            old_price: 499.99,
            sizes: ['48', '50', '52', '54'], // European suit sizes
            description: "Luxurious navy business suit featuring a modern slim fit design, premium wool blend fabric, and exquisite tailoring. Perfect for professional and formal occasions."
        };

        // Add the banner suit to database
        const product = new Product(bannerSuit);
        await product.save();

        res.status(200).json({
            success: true,
            message: "Banner suit product added successfully",
            product: bannerSuit
        });
    } catch (error) {
        console.error("Error adding banner suit:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Endpoint to get latest collection products
app.get('/latest-collection', async (req, res) => {
    try {
        // Lấy tất cả sản phẩm mới nhất
        const products = await Product.find({ available: true })
        .sort({ date: -1 })
        .limit(12);  // Giới hạn 12 sản phẩm mới nhất

        res.json(products);
    } catch (error) {
        console.error('Error in /latest-collection:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Endpoint to get a single product by ID
app.get('/product/:id', async (req, res) => {
    try {
        const productId = Number(req.params.id);
        const product = await Product.findOne({ id: productId });
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API for getting filtered and sorted products
app.get('/products', async (req, res) => {
    try {
        const { category, sort, minPrice, maxPrice, page = 1, limit = 12 } = req.query;
        const skip = (page - 1) * limit;

        let query = { available: true }; // Only get available products
        
        if (category) {
            // Handle both "kid" and "kids" categories case-insensitively
            const categoryRegex = new RegExp(`^${category}s?$`, 'i');
            query.category = categoryRegex;
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

// Creating endpoint for updating product
app.post('/updateproduct', async (req, res) => {
    try {
        const {
            id,
            name,
            image,
            detail_images,
            category,
            clothingType,
            new_price,
            old_price
        } = req.body;

        const updatedProduct = await Product.findOneAndUpdate(
            { id },
            {
                name,
                image,
                detail_images,
                category,
                clothingType,
                new_price,
                old_price,
                date: Date.now() // Update the date to reflect the modification
            },
            { new: true } // Return the updated document
        );

        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.json({
            success: true,
            product: updatedProduct
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update product'
        });
    }
});

// Start server
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});