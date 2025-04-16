const port=4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path=require("path");
const cors=require("cors");
const { log } = require("console");

app.use(express.json());
app.use(cors());

//Database connection with mongodb
const mongoURI = process.env.MONGODB_URI || 'mongodb://root:examplepassword@mongodb:27017/mydatabase?authSource=admin';

mongoose.connect(mongoURI)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

//API Creation

app.get('/allproducts', async (req, res) => {
    try {
      // Lấy tất cả các sản phẩm từ MongoDB
      let products = await Product.find({});
      console.log("ALL Products Fetched");
      res.json(products); // Trả về dữ liệu sản phẩm dưới dạng JSON
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Error fetching products' });
    }
  });
// app.get("/",(req,res)=>{
//     res.send("Express App is Running")
// })

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
    // Get the host from the request or use the default
    const host = req.get('host') || 'localhost:4000';
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
    category: {
        type: String,
        required: true,
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
        category: req.body.category,
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

})

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
    let products = await Product.find({});
    console.log("ALL Products Fetched");
    res.json(products);
})

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
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("New collection fetched");
    res.send(newcollection);
})

// creating endpoint for popular in women section

app.get('/popularinwomen', async (req, res) => {
    try {
        let products = await Product.find({category: "women"});
        console.log("Popular in women fetched");
        res.send(products);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// creating endpoint for men's products
app.get('/popularinmen', async (req, res) => {
    try {
        let products = await Product.find({category: "men"});
        console.log("Popular in men fetched");
        res.send(products);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
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

app.post('/addtocart', fetchUser, async (req, res) => {
    try {
        const { productId, size, quantity } = req.body;
        let userData = await Users.findOne({_id:req.user.id});
        
        // Check if item already exists in cart with same size
        const existingItemIndex = userData.cartData.findIndex(
            item => item.productId === productId && item.size === size
        );

        if (existingItemIndex > -1) {
            // Update quantity if item exists
            userData.cartData[existingItemIndex].quantity += quantity;
        } else {
            // Add new item if it doesn't exist
            userData.cartData.push({
                productId,
                size,
                quantity
            });
        }

        await Users.findOneAndUpdate(
            {_id: req.user.id}, 
            {cartData: userData.cartData}
        );

        res.json({success: true, message: "Added to cart"});
    } catch (error) {
        res.status(500).json({success: false, error: error.message});
    }
});

// creating endpoint to remove from cartdata

app.post('/removefromcart', fetchUser, async (req, res) => {
    try {
        const { productId, size } = req.body;
        let userData = await Users.findOne({_id:req.user.id});
        
        userData.cartData = userData.cartData.filter(
            item => !(item.productId === productId && item.size === size)
        );

        await Users.findOneAndUpdate(
            {_id: req.user.id}, 
            {cartData: userData.cartData}
        );

        res.json({success: true, message: "Removed from cart"});
    } catch (error) {
        res.status(500).json({success: false, error: error.message});
    }
});

// creating endpoint to get cartdata

app.post('/getcart',fetchUser, async (req,res)=>{
    console.log("Getcart");
    let userData = await Users.findOne({_id:req.user.id});
    res.json(userData.cartData);
})

// Add update cart item endpoint
app.post('/updatecartitem', fetchUser, async (req, res) => {
    try {
        const { productId, size, quantity, newSize } = req.body;
        let userData = await Users.findOne({_id:req.user.id});
        
        // Find the item to update
        const itemIndex = userData.cartData.findIndex(
            item => item.productId === productId && item.size === size
        );

        if (itemIndex > -1) {
            // Update quantity and size
            userData.cartData[itemIndex].quantity = quantity;
            if (newSize) {
                userData.cartData[itemIndex].size = newSize;
            }
        }

        await Users.findOneAndUpdate(
            {_id: req.user.id}, 
            {cartData: userData.cartData}
        );

        res.json({success: true, message: "Cart item updated"});
    } catch (error) {
        res.status(500).json({success: false, error: error.message});
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
app.post('/create-order', async (req, res) => {
    try {
        const order = new Order({
            userId: req.body.userId,
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
        // Find the user's cart
        let userData = await Users.findOne({ _id: req.user.id });
        
        if (userData) {
            // Clear the cartData array
            userData.cartData = [];
            await userData.save();
        }

        res.json({ success: true, message: 'Cart cleared successfully' });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Endpoint to initialize sample products
app.post('/init-sample-products', async (req, res) => {
    try {
        // Clear existing products
        await Product.deleteMany({});

        const sampleProducts = [
            {
                id: 1,
                name: "Elegant Summer Dress",
                category: "women",
                image: "https://i.pinimg.com/564x/9c/e7/8d/9ce78d8595a8907e3fb1a087bc1f5c0d.jpg",
                new_price: 85.0,
                old_price: 120.5
            },
            {
                id: 2,
                name: "Modern Business Suit",
                category: "women", 
                image: "https://i.pinimg.com/564x/7d/00/f9/7d00f9b7c4d6a5d89e6f3f7d7a290b2e.jpg",
                new_price: 150.0,
                old_price: 200.0
            },
            {
                id: 3,
                name: "Korean Style Blazer Set",
                category: "women",
                image: "https://i.pinimg.com/564x/c8/a6/c0/c8a6c0c47dfc89a2a3c3d0a0d5d09cf2.jpg", 
                new_price: 120.0,
                old_price: 150.0
            },
            {
                id: 4,
                name: "Floral Maxi Dress",
                category: "women",
                image: "https://i.pinimg.com/564x/f2/7f/98/f27f98921fd69ce7a7f020740828a1d4.jpg",
                new_price: 95.0,
                old_price: 130.0
            },
            {
                id: 5,
                name: "Casual Denim Set",
                category: "women",
                image: "https://i.pinimg.com/564x/0c/cf/c3/0ccfc3c4e5be71562dfc5d6a3c981f3c.jpg",
                new_price: 110.0,
                old_price: 140.0
            },
            {
                id: 6,
                name: "Evening Cocktail Dress",
                category: "women",
                image: "https://i.pinimg.com/564x/e8/f8/a6/e8f8a6e4c59fbf2992639319219d048c.jpg",
                new_price: 160.0,
                old_price: 200.0
            },
            {
                id: 7,
                name: "Vintage Style Dress",
                category: "women",
                image: "https://i.pinimg.com/564x/37/52/5f/37525f911d6c3a2cde577c8c7c4a25f5.jpg",
                new_price: 130.0,
                old_price: 170.0
            },
            {
                id: 8,
                name: "Summer Beach Dress",
                category: "women",
                image: "https://i.pinimg.com/564x/8b/d4/e5/8bd4e545ad7f8d6b1c3a38a4e5c6b020.jpg",
                new_price: 75.0,
                old_price: 100.0
            }
        ];

        // Insert sample products
        await Product.insertMany(sampleProducts);

        res.status(200).json({
            success: true,
            message: "Sample products initialized successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Endpoint to initialize men's fashion products
app.post('/init-men-products', async (req, res) => {
    try {
        // Clear existing men's products
        await Product.deleteMany({ category: "men" });

        const menProducts = [
            {
                id: 2001,
                name: "Premium Navy Business Suit",
                category: "men",
                image: "https://i.pinimg.com/564x/32/37/d3/3237d3fe1f8c352150baf1ed5c2aa51c.jpg",
                new_price: 399.99,
                old_price: 499.99,
                description: "Luxurious navy business suit with modern slim fit design"
            },
            {
                id: 2002,
                name: "Classic Black Suit",
                category: "men",
                image: "https://i.pinimg.com/564x/83/79/d4/8379d43b7d7f6668d0e8e84c0e7e3c1b.jpg",
                new_price: 299.99,
                old_price: 399.99,
                description: "Timeless black suit perfect for any formal occasion"
            },
            {
                id: 2003,
                name: "Modern Grey Suit",
                category: "men",
                image: "https://i.pinimg.com/564x/7b/c3/c4/7bc3c4c3aa90f95f0345c95fc54e7878.jpg",
                new_price: 349.99,
                old_price: 449.99,
                description: "Contemporary grey suit with perfect fit"
            },
            {
                id: 2004,
                name: "Brown Check Suit",
                category: "men",
                image: "https://i.pinimg.com/564x/f5/6b/99/f56b99b3b799d0eaa2e75aa4d2e388cc.jpg",
                new_price: 379.99,
                old_price: 479.99,
                description: "Sophisticated brown check suit for the modern gentleman"
            },
            {
                id: 2005,
                name: "Light Grey Business Suit",
                category: "men",
                image: "https://i.pinimg.com/564x/8d/9b/bb/8d9bbb6b1b2a90c05d98b757e1f5d736.jpg",
                new_price: 329.99,
                old_price: 429.99,
                description: "Professional light grey suit for business wear"
            },
            {
                id: 2006,
                name: "Navy Pinstripe Suit",
                category: "men",
                image: "https://i.pinimg.com/564x/a4/af/8a/a4af8af9c6455dd95d79e3de5cc42f5c.jpg",
                new_price: 419.99,
                old_price: 519.99,
                description: "Classic navy pinstripe suit with modern details"
            },
            {
                id: 2007,
                name: "Blue Wedding Suit",
                category: "men",
                image: "https://i.pinimg.com/564x/8b/dd/51/8bdd51d231a7e3c4327c3971c513a0cc.jpg",
                new_price: 449.99,
                old_price: 549.99,
                description: "Elegant blue suit perfect for weddings"
            },
            {
                id: 2008,
                name: "Black Tuxedo",
                category: "men",
                image: "https://i.pinimg.com/564x/d5/25/8d/d5258d102e3f681e3b2a6399f8172f82.jpg",
                new_price: 499.99,
                old_price: 599.99,
                description: "Classic black tuxedo for formal events"
            }
        ];

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

// Endpoint to initialize popular products
app.post('/init-popular-products', async (req, res) => {
    try {
        // Clear existing products
        await Product.deleteMany({});

        const popularProducts = [
            // Women's Fashion
            {
                id: 1001,
                name: "Elegant Evening Gown",
                category: "women",
                image: "https://i.pinimg.com/564x/e8/f8/a6/e8f8a6e4c59fbf2992639319219d048c.jpg",
                new_price: 189.99,
                old_price: 249.99
            },
            {
                id: 1002,
                name: "Summer Floral Dress",
                category: "women",
                image: "https://i.pinimg.com/564x/af/6f/7d/af6f7d0e9c9439f3f5bb3593c3c0e313.jpg",
                new_price: 79.99,
                old_price: 119.99
            },
            {
                id: 1003,
                name: "Business Casual Set",
                category: "women",
                image: "https://i.pinimg.com/564x/c7/a4/2b/c7a42b3a7d95d9e57c13e3728f36b9e3.jpg",
                new_price: 159.99,
                old_price: 199.99
            },
            {
                id: 1004,
                name: "Korean Style Blazer",
                category: "women",
                image: "https://i.pinimg.com/564x/8c/1a/85/8c1a8595d6b50b827416f8adc8e04f1f.jpg",
                new_price: 129.99,
                old_price: 169.99
            },

            // Men's Fashion
            {
                id: 2001,
                name: "Classic Navy Suit",
                category: "men",
                image: "https://i.pinimg.com/564x/83/79/d4/8379d43b7d7f6668d0e8e84c0e7e3c1b.jpg",
                new_price: 299.99,
                old_price: 399.99
            },
            {
                id: 2002,
                name: "Modern Blazer Set",
                category: "men",
                image: "https://i.pinimg.com/564x/7b/c3/c4/7bc3c4c3aa90f95f0345c95fc54e7878.jpg",
                new_price: 249.99,
                old_price: 329.99
            },
            {
                id: 2003,
                name: "Business Casual Outfit",
                category: "men",
                image: "https://i.pinimg.com/564x/8d/9b/bb/8d9bbb6b1b2a90c05d98b757e1f5d736.jpg",
                new_price: 219.99,
                old_price: 279.99
            },
            {
                id: 2004,
                name: "Wedding Collection Suit",
                category: "men",
                image: "https://i.pinimg.com/564x/a4/af/8a/a4af8af9c6455dd95d79e3de5cc42f5c.jpg",
                new_price: 349.99,
                old_price: 449.99
            },

            // Kids Fashion
            {
                id: 3001,
                name: "Kids Party Dress",
                category: "kid",
                image: "https://i.pinimg.com/564x/96/dc/3b/96dc3b5d006d05b645e276f7c2bd2d1f.jpg",
                new_price: 69.99,
                old_price: 89.99
            },
            {
                id: 3002,
                name: "Boys Formal Suit",
                category: "kid",
                image: "https://i.pinimg.com/564x/46/d9/f0/46d9f0d6eba2604c5dfcae106574c8f6.jpg",
                new_price: 89.99,
                old_price: 119.99
            },
            {
                id: 3003,
                name: "Girls Summer Set",
                category: "kid",
                image: "https://i.pinimg.com/564x/86/b4/f1/86b4f1e8d7d2b3d2aa3b4d5886d7104c.jpg",
                new_price: 59.99,
                old_price: 79.99
            },
            {
                id: 3004,
                name: "Kids Casual Collection",
                category: "kid",
                image: "https://i.pinimg.com/564x/62/15/c4/6215c4d42e0534c828f87a931c6c0815.jpg",
                new_price: 49.99,
                old_price: 69.99
            }
        ];

        // Insert popular products
        await Product.insertMany(popularProducts);

        res.status(200).json({
            success: true,
            message: "Popular products initialized successfully"
        });
    } catch (error) {
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

// Endpoint to initialize kids fashion products
app.post('/init-kids-products', async (req, res) => {
    try {
        // Clear existing kids products
        await Product.deleteMany({ category: "kid" });

        const kidsProducts = [
            {
                id: 3001,
                name: "Boys Checkered Shirt Set",
                category: "kid",
                image: "https://i.pinimg.com/564x/d7/4b/11/d74b11d60babf5e688ac564c9bf6520c.jpg",
                new_price: 45.99,
                old_price: 59.99,
                description: "Stylish blue checkered shirt with suspenders, perfect for special occasions",
                sizes: ['2Y', '3Y', '4Y', '5Y', '6Y']
            },
            {
                id: 3002,
                name: "Kids Denim Jacket",
                category: "kid",
                image: "https://i.pinimg.com/564x/4c/2d/06/4c2d06d94f15487c56e1dd838f0e4c25.jpg",
                new_price: 39.99,
                old_price: 49.99,
                description: "Classic denim jacket for kids, versatile and durable",
                sizes: ['3Y', '4Y', '5Y', '6Y', '7Y']
            },
            {
                id: 3003,
                name: "Boys Casual Shirt & Jeans",
                category: "kid",
                image: "https://i.pinimg.com/564x/d5/7b/cf/d57bcf3a3f2b7138fce36d2c1e9544e8.jpg",
                new_price: 55.99,
                old_price: 69.99,
                description: "Comfortable casual set with white shirt and jeans",
                sizes: ['3Y', '4Y', '5Y', '6Y', '7Y']
            },
            {
                id: 3004,
                name: "Kids Plaid Shirt Combo",
                category: "kid",
                image: "https://i.pinimg.com/564x/91/8d/6a/918d6a06c5262d20f1c91432cb0fb4b4.jpg",
                new_price: 42.99,
                old_price: 54.99,
                description: "Trendy plaid shirt with denim pants",
                sizes: ['2Y', '3Y', '4Y', '5Y', '6Y']
            },
            {
                id: 3005,
                name: "Boys Smart Casual Set",
                category: "kid",
                image: "https://i.pinimg.com/564x/eb/c3/61/ebc361e0476ff5e10603e6437e8ce818.jpg",
                new_price: 49.99,
                old_price: 64.99,
                description: "Smart casual outfit perfect for any occasion",
                sizes: ['3Y', '4Y', '5Y', '6Y', '7Y']
            },
            {
                id: 3006,
                name: "Kids Denim Collection",
                category: "kid",
                image: "https://i.pinimg.com/564x/f5/c8/fa/f5c8fa43ba4d5c0748d229456c960e42.jpg",
                new_price: 59.99,
                old_price: 79.99,
                description: "Complete denim outfit for stylish kids",
                sizes: ['4Y', '5Y', '6Y', '7Y', '8Y']
            },
            {
                id: 3007,
                name: "Boys Formal Shirt Set",
                category: "kid",
                image: "https://i.pinimg.com/564x/8c/9c/db/8c9cdb40eb0af3eed7b9a3c7f5434956.jpg",
                new_price: 47.99,
                old_price: 59.99,
                description: "Formal shirt with bow tie and suspenders",
                sizes: ['2Y', '3Y', '4Y', '5Y', '6Y']
            },
            {
                id: 3008,
                name: "Kids Casual Spring Set",
                category: "kid",
                image: "https://i.pinimg.com/564x/1d/8c/01/1d8c0151434a83a47fa4c65f84e4f1cf.jpg",
                new_price: 44.99,
                old_price: 57.99,
                description: "Comfortable spring collection for active kids",
                sizes: ['3Y', '4Y', '5Y', '6Y', '7Y']
            }
        ];

        // Insert kids products
        await Product.insertMany(kidsProducts);

        res.status(200).json({
            success: true,
            message: "Kids fashion products initialized successfully",
            products: kidsProducts
        });
    } catch (error) {
        console.error("Error initializing kids products:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Endpoint to initialize latest collection products
app.post('/init-latest-collection', async (req, res) => {
    try {
        const latestProducts = [
            {
                id: 4001,
                name: "Modern Slim Fit Suit",
                category: "men",
                image: "https://i.pinimg.com/564x/2c/e3/c3/2ce3c3b3d405f6f126d0d708a0827152.jpg",
                new_price: 449.99,
                old_price: 599.99,
                description: "Contemporary slim fit suit in charcoal grey",
                date: new Date(),
                sizes: ['48', '50', '52', '54']
            },
            {
                id: 4002,
                name: "Designer Evening Gown",
                category: "women",
                image: "https://i.pinimg.com/564x/8c/e2/0b/8ce20bc92b4200b8b12b68b0a0649833.jpg",
                new_price: 299.99,
                old_price: 399.99,
                description: "Elegant evening gown with detailed embellishments",
                date: new Date(),
                sizes: ['S', 'M', 'L']
            },
            {
                id: 4003,
                name: "Kids Party Collection",
                category: "kid",
                image: "https://i.pinimg.com/564x/96/91/74/969174e83863a8f5b43958da9a27e7e3.jpg",
                new_price: 79.99,
                old_price: 99.99,
                description: "Adorable party wear for special occasions",
                date: new Date(),
                sizes: ['3Y', '4Y', '5Y', '6Y']
            },
            {
                id: 4004,
                name: "Business Professional Suit",
                category: "men",
                image: "https://i.pinimg.com/564x/4b/07/0a/4b070a5e8c3409087961b8f1e3322b11.jpg",
                new_price: 479.99,
                old_price: 629.99,
                description: "Premium business suit in classic navy",
                date: new Date(),
                sizes: ['48', '50', '52', '54']
            },
            {
                id: 4005,
                name: "Summer Cocktail Dress",
                category: "women",
                image: "https://i.pinimg.com/564x/57/71/c7/5771c7e8f8d4ad9f5e98493d3be1f895.jpg",
                new_price: 159.99,
                old_price: 199.99,
                description: "Chic cocktail dress perfect for summer events",
                date: new Date(),
                sizes: ['S', 'M', 'L']
            },
            {
                id: 4006,
                name: "Kids Formal Set",
                category: "kid",
                image: "https://i.pinimg.com/564x/41/1e/5c/411e5c30cecf10e1c836686f3a6258e3.jpg",
                new_price: 89.99,
                old_price: 119.99,
                description: "Complete formal set for young gentlemen",
                date: new Date(),
                sizes: ['3Y', '4Y', '5Y', '6Y']
            },
            {
                id: 4007,
                name: "Designer Wedding Suit",
                category: "men",
                image: "https://i.pinimg.com/564x/dd/a7/cf/dda7cf4d8fc29a67ce5bc00d4f21c178.jpg",
                new_price: 599.99,
                old_price: 799.99,
                description: "Luxury wedding suit in modern cut",
                date: new Date(),
                sizes: ['48', '50', '52', '54']
            },
            {
                id: 4008,
                name: "Premium Evening Dress",
                category: "women",
                image: "https://i.pinimg.com/564x/95/2c/ac/952cacee9e3e2c0c85c13765b3e6e1c6.jpg",
                new_price: 279.99,
                old_price: 349.99,
                description: "Sophisticated evening dress with unique design",
                date: new Date(),
                sizes: ['S', 'M', 'L']
            }
        ];

        // Insert latest collection products
        await Product.insertMany(latestProducts);

        res.status(200).json({
            success: true,
            message: "Latest collection products initialized successfully",
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

// Endpoint to get latest collection products
app.get('/latest-collection', async (req, res) => {
    try {
        // Get all products and sort by date in descending order (newest first)
        let latestProducts = await Product.find({})
            .sort({ date: -1 })
            .limit(8);

        if (!latestProducts || latestProducts.length === 0) {
            // If no products found, initialize sample products
            const sampleProducts = [
                {
                    id: 4001,
                    name: "Modern Slim Fit Suit",
                    category: "men",
                    image: "https://i.pinimg.com/564x/2c/e3/c3/2ce3c3b3d405f6f126d0d708a0827152.jpg",
                    new_price: 449.99,
                    old_price: 599.99,
                    description: "Contemporary slim fit suit in charcoal grey",
                    date: new Date(),
                    sizes: ['48', '50', '52', '54']
                },
                {
                    id: 4002,
                    name: "Designer Evening Gown",
                    category: "women",
                    image: "https://i.pinimg.com/564x/8c/e2/0b/8ce20bc92b4200b8b12b68b0a0649833.jpg",
                    new_price: 299.99,
                    old_price: 399.99,
                    description: "Elegant evening gown with detailed embellishments",
                    date: new Date(),
                    sizes: ['S', 'M', 'L']
                }
            ];

            // Insert sample products
            await Product.insertMany(sampleProducts);
            
            // Fetch the products again after initialization
            latestProducts = await Product.find({})
                .sort({ date: -1 })
                .limit(8);
        }

        console.log("Latest collection fetched successfully:", latestProducts.length, "products");
        res.json(latestProducts);
    } catch (error) {
        console.error("Error fetching latest collection:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch latest collection"
        });
    }
});

app.listen(port,(error)=>{
    if(!error){
        console.log("Server listening on port "+ port);
    }
    else{
        console.log("Error : " + error);
    }
});

