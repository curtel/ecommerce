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
  Alert
} from '@mui/material'
import PhotoCamera from '@mui/icons-material/PhotoCamera'
import UploadFileIcon from '@mui/icons-material/UploadFile'

const AddProduct = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [formErrors, setFormErrors] = useState({});
  const [productDetails, setProductDetails] = useState({
    name: "",
    image: "",
    category: "women",
    new_price: "",
    old_price: ""
  });

  const validateForm = () => {
    const errors = {};
    if (!productDetails.name.trim()) errors.name = 'Product name is required';
    if (!productDetails.old_price.trim()) errors.old_price = 'Price is required';
    if (!productDetails.new_price.trim()) errors.new_price = 'Offer price is required';
    if (!image) errors.image = 'Product image is required';
    
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

  const handleChange = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const addProduct = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    let responseData;
    let product = productDetails;
    
    const formData = new FormData();
    formData.append('product', image);

    try {
      const uploadResponse = await fetch('http://localhost:4000/upload', {
        method: "POST",
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });
      
      responseData = await uploadResponse.json();

      if (responseData.success) {
        product.image = responseData.image_url;
        
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
            category: "women",
            new_price: "",
            old_price: ""
          });
          setImage(null);
        } else {
          setNotification({
            open: true,
            message: 'Failed to add product',
            severity: 'error'
          });
        }
      } else {
        setNotification({
          open: true,
          message: 'Failed to upload image',
          severity: 'error'
        });
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
                <MenuItem value="kid">Kid</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                border: formErrors.image ? '1px dashed #d32f2f' : '1px dashed #ccc',
                borderRadius: 1,
                p: 2,
                height: '100%'
              }}
            >
              {image ? (
                <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                  <CardMedia
                    component="img"
                    image={URL.createObjectURL(image)}
                    alt="Product preview"
                    sx={{ height: 140, objectFit: 'contain' }}
                  />
                  <IconButton 
                    sx={{ position: 'absolute', right: 0, top: 0, color: 'primary.main' }}
                    component="label"
                  >
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={imageHandler}
                    />
                    <PhotoCamera />
                  </IconButton>
                </Box>
              ) : (
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<UploadFileIcon />}
                  sx={{ mt: 2, height: '100%' }}
                >
                  Upload Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={imageHandler}
                  />
                </Button>
              )}
              {formErrors.image && (
                <Typography color="error" variant="caption">
                  {formErrors.image}
                </Typography>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={addProduct}
              disabled={loading}
              sx={{ mt: 2 }}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Add Product'}
            </Button>
          </Grid>
        </Grid>
      </CardContent>
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default AddProduct
