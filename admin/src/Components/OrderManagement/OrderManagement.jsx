import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  FormControl,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
} from '@mui/material';
import { API_URL } from '../../config';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const statusColors = {
    pending: 'warning',
    confirmed: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'error'
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Order Management
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order._id}</TableCell>
                <TableCell>{formatDate(order.date)}</TableCell>
                <TableCell>{order.shippingAddress.fullName}</TableCell>
                <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <FormControl size="small">
                    <Select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="confirmed">Confirmed</MenuItem>
                      <MenuItem value="shipped">Shipped</MenuItem>
                      <MenuItem value="delivered">Delivered</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleViewDetails(order)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              Order Details
              <Chip
                label={selectedOrder.status.toUpperCase()}
                color={statusColors[selectedOrder.status]}
                size="small"
                sx={{ ml: 2 }}
              />
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography variant="h6" gutterBottom>
                    Shipping Information
                  </Typography>
                  <Typography>
                    Name: {selectedOrder.shippingAddress.fullName}
                  </Typography>
                  <Typography>
                    Address: {selectedOrder.shippingAddress.address}
                  </Typography>
                  <Typography>
                    City: {selectedOrder.shippingAddress.city}
                  </Typography>
                  <Typography>
                    Phone: {selectedOrder.shippingAddress.phone}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" gutterBottom>
                    Order Summary
                  </Typography>
                  <Typography>
                    Order Date: {formatDate(selectedOrder.date)}
                  </Typography>
                  <Typography>
                    Total Items: {selectedOrder.items.length}
                  </Typography>
                  <Typography>
                    Total Amount: ${selectedOrder.totalAmount.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Order Items
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Product Name</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell align="right">Price</TableCell>
                          <TableCell align="right">Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedOrder.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                            <TableCell align="right">
                              ${(item.price * item.quantity).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default OrderManagement; 
