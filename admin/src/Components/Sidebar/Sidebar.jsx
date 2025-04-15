import React from 'react'
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Divider } from '@mui/material'
import { Link, useLocation } from 'react-router-dom'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import ViewListIcon from '@mui/icons-material/ViewList'

const Sidebar = () => {
  const location = useLocation();
  const drawerWidth = 240;
  
  const menuItems = [
    {
      text: 'Add Product',
      icon: <AddCircleIcon color="primary" />,
      path: '/addproduct'
    },
    {
      text: 'Product List',
      icon: <ViewListIcon color="primary" />,
      path: '/listproduct'
    }
  ];

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          top: '64px',
          height: 'calc(100% - 64px)',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Box sx={{ overflow: 'auto', mt: 2 }}>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.text} 
              component={Link} 
              to={item.path}
              sx={{
                backgroundColor: location.pathname === item.path ? 'rgba(96, 121, 255, 0.1)' : 'transparent',
                borderRight: location.pathname === item.path ? '4px solid #6079ff' : 'none',
                '&:hover': {
                  backgroundColor: 'rgba(96, 121, 255, 0.05)'
                }
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  )
}

export default Sidebar
