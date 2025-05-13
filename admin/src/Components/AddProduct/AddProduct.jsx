import React, { useState } from 'react'
import {
  Box, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  MenuItem, 
  Select, 
  InputLabel, 
  FormControl,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Stack
} from '@mui/material'
import PhotoCamera from '@mui/icons-material/PhotoCamera'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import { API_URL } from '../../config';
const AddProduct = () => {
  const [image, setImage] = useState(null);
  const [detailImages, setDetailImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [formErrors, setFormErrors] = useState({});
  const [productDetails, setProductDetails] = useState({
    name: "",
    image: "",
    detail_images: [],
    category: "women",
    clothingType: "shirt",
    new_price: "",
    old_price: ""
  });

  const validateForm = () => {
    const errors = {};
    if (!productDetails.name.trim()) errors.name = 'Product name is required';
    if (!productDetails.old_price.trim()) errors.old_price = 'Price is required';
    if (!productDetails.new_price.trim()) errors.new_price = 'Offer price is required';
    if (!image) errors.image = 'Product image is required';
    if (!productDetails.clothingType) errors.clothingType = 'Clothing type is required';
    
    // Validate that prices are numbers
    if (isNaN(Number(productDetails.old_price))) errors.old_price = 'Price must be a number';
    if (isNaN(Number(productDetails.new_price))) errors.new_price = 'Offer price must be a number';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const imageHandler = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const detailImagesHandler = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length > 4) {
        setNotification({
          open: true,
          message: 'Maximum 4 detail images allowed',
          severity: 'warning'
        });
        // Take only first 4 images
        setDetailImages(files.slice(0, 4));
      } else {
        setDetailImages(files);
      }
    }
  };

  const handleChange = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('product', file);

    const uploadResponse = await fetch('http://localhost:4000/upload', {
      method: "POST",
      headers: {
        Accept: 'application/json',
      },
      body: formData,
    });
    
    return await uploadResponse.json();
  };

  const addProduct = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    let product = productDetails;
    
    try {
      // Upload main image
      const mainImageResponse = await uploadImage(image);
      if (!mainImageResponse.success) {
        throw new Error('Failed to upload main image');
      }
      product.image = mainImageResponse.image_url;

      // Upload detail images
      const detailImageUrls = [];
      for (let detailImage of detailImages) {
        const detailImageResponse = await uploadImage(detailImage);
        if (!detailImageResponse.success) {
          throw new Error('Failed to upload detail image');
        }
        detailImageUrls.push(detailImageResponse.image_url);
      }
      product.detail_images = detailImageUrls;

      // Add product with all images
      const addProductResponse = await fetch('http://localhost:4000/addproduct', {
        method: "POST",
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
      
      const addProductData = await addProductResponse.json();
      
      if (addProductData.success) {
        setNotification({
          open: true,
          message: 'Product added successfully!',
          severity: 'success'
        });
        // Clear form
        setProductDetails({
          name: "",
          image: "",
          detail_images: [],
          category: "women",
          clothingType: "shirt",
          new_price: "",
          old_price: ""
        });
        setImage(null);
        setDetailImages([]);
      } else {
        throw new Error('Failed to add product');
      }
    } catch (error) {
      console.error('Error:', error);
      setNotification({
        open: true,
        message: 'Error adding product: ' + error.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', p: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Add New Product
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Product Name"
              name="name"
              value={productDetails.name}
              onChange={handleChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Price"
              name="old_price"
              value={productDetails.old_price}
              onChange={handleChange}
              error={!!formErrors.old_price}
              helperText={formErrors.old_price}
              variant="outlined"
              InputProps={{
                startAdornment: <Typography variant="body2">$</Typography>
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Offer Price"
              name="new_price"
              value={productDetails.new_price}
              onChange={handleChange}
              error={!!formErrors.new_price}
              helperText={formErrors.new_price}
              variant="outlined"
              InputProps={{
                startAdornment: <Typography variant="body2">$</Typography>
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                name="category"
                value={productDetails.category}
                onChange={handleChange}
              >
                <MenuItem value="women">Women</MenuItem>
                <MenuItem value="men">Men</MenuItem>
                <MenuItem value="kids">Kids</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Clothing Type</InputLabel>
              <Select
                label="Clothing Type"
                name="clothingType"
                value={productDetails.clothingType}
                onChange={handleChange}
                error={!!formErrors.clothingType}
              >
                <MenuItem value="shirt">Shirt</MenuItem>
                <MenuItem value="pants">Pants</MenuItem>
                <MenuItem value="t-shirt">T-Shirt</MenuItem>
                <MenuItem value="dress">Dress</MenuItem>
              </Select>
              {formErrors.clothingType && (
                <Typography color="error" variant="caption">
                  {formErrors.clothingType}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="contained"
                component="label"
                startIcon={<PhotoCamera />}
                sx={{ mt: 1 }}
              >
                Upload Image
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={imageHandler}
                />
              </Button>

              <Button
                variant="contained"
                component="label"
                startIcon={<UploadFileIcon />}
                sx={{ mt: 1 }}
              >
                Upload Detail Images
                <input
                  hidden
                  accept="image/*"
                  multiple
                  type="file"
                  onChange={detailImagesHandler}
                />
              </Button>
            </Stack>

            {image && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Main Image Preview:
                </Typography>
                <CardMedia
                  component="img"
                  height="200"
                  image={URL.createObjectURL(image)}
                  alt="Product preview"
                  sx={{ objectFit: 'contain', borderRadius: 1 }}
                />
              </Box>
            )}

            {detailImages.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Detail Images Preview:
                </Typography>
                <Grid container spacing={1}>
                  {Array.from(detailImages).map((file, index) => (
                    <Grid item xs={4} key={index}>
                      <CardMedia
                        component="img"
                        height="100"
                        image={URL.createObjectURL(file)}
                        alt={`Detail ${index + 1}`}
                        sx={{ objectFit: 'contain', borderRadius: 1 }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Grid>

          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              onClick={addProduct}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Add Product'}
            </Button>
          </Grid>
        </Grid>

        <Snackbar 
          open={notification.open} 
          autoHideDuration={6000} 
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity}
            variant="filled"
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
};

export default AddProduct;
