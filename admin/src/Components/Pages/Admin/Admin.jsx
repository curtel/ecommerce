import React from 'react'
import { Box } from '@mui/material'
import Sidebar from '../../Sidebar/Sidebar'
import { Routes, Route } from 'react-router-dom'
import AddProduct from '../../AddProduct/AddProduct'
import ListProduct from '../../ListProduct/ListProduct'
import OrderManagement from '../../OrderManagement/OrderManagement'
import Login from '../Login/Login'
import ProtectedRoute from '../../ProtectedRoute/ProtectedRoute'
import { AuthProvider } from '../../../context/AuthContext'
const Admin = () => {
  return (
    <AuthProvider>
      <Box sx={{ display: 'flex' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <>
                  <Sidebar />
                  <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 2, ml: '240px' }}>
                    <Routes>
                      <Route path='/addproduct' element={<AddProduct />} />
                      <Route path='/listproduct' element={<ListProduct />} />
                      <Route path='/orders' element={<OrderManagement />} />
                      <Route path='/' element={<AddProduct />} />
                    </Routes>
                  </Box>
                </>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Box>
    </AuthProvider>
  )
}

export default Admin
