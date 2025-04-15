import React from 'react'
import { Box } from '@mui/material'
import Sidebar from '../../Sidebar/Sidebar'
import { Routes, Route } from 'react-router-dom'
import AddProduct from '../../AddProduct/AddProduct'
import ListProduct from '../../ListProduct/ListProduct'

const Admin = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 2, ml: '240px' }}>
        <Routes>
          <Route path='/addproduct' element={<AddProduct />} />
          <Route path='/listproduct' element={<ListProduct />} />
          <Route path='/' element={<AddProduct />} />
        </Routes>
      </Box>
    </Box>
  )
}

export default Admin
