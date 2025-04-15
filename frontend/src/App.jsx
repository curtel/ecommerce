import React from 'react';
import './App.css';
import Navbar from './Components/Navbar/Navbar';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Shop from './Pages/shop';
import ShopCategory from './Pages/ShopCategory';
import Product from './Pages/Product';
import Cart from './Pages/Cart';
import { LoginSignup } from './Pages/LoginSignup';
import Checkout from './Pages/Checkout';
import OrderConfirmation from './Pages/OrderConfirmation';
import Footer from './Components/Footer/Footer';
import LatestCollection from './Pages/LatestCollection';

// Import banners from public URL instead of local files
const men_banner = "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1920&h=600&fit=crop";
const women_banner = "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&h=600&fit=crop";
const kid_banner = "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=1920&h=600&fit=crop";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path='/' element={<Shop />} />
          <Route path='/mens' element={<ShopCategory banner={men_banner} category='men' />} />
          <Route path='/womens' element={<ShopCategory banner={women_banner} category='women' />} />
          <Route path='/kids' element={<ShopCategory banner={kid_banner} category='kid' />} />
          <Route path='/product' element={<Product />}>
            <Route path=':productId' element={<Product />} />
          </Route>
          <Route path='/cart' element={<Cart />} />
          <Route path='/login' element={<LoginSignup />} />
          <Route path='/checkout' element={<Checkout />} />
          <Route path='/order-confirmation/:orderId' element={<OrderConfirmation />} />
          <Route path='/latest-collection' element={<LatestCollection />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
