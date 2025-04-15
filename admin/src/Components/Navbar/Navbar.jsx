import React from 'react'
import { AppBar, Toolbar, Typography, Box, IconButton, Avatar } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'

const Navbar = () => {
  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DashboardIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            E-Commerce Admin
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton edge="end" color="inherit">
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>A</Avatar>
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
