import React, { useContext, useState, useRef, useEffect } from 'react';
import './Navbar.css';
import logo from '../Assets/logo.png';
import cart_icon from '../Assets/cart_icon.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';
import nav_dropdown from '../Assets/nav_dropdown4.png'

const Navbar = () => {
  const [menu, setMenu] = useState("shop");
  const {getTotalCartItems}=useContext(ShopContext)
  const menuRef=useRef();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('auth-token') ? true : false;
  
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setMenu("shop");
    else if (path === '/men') setMenu("men");
    else if (path === '/women') setMenu("women");
    else if (path === '/orders') setMenu("orders");
  }, [location]);
  
  const dropdown_toggle=(e)=>{
      menuRef.current.classList.toggle('nav-menu-visible');
      e.target.classList.toggle('open');
  }

  return (
    <div className='navbar'>
      <div className="nav-logo" onClick={() => navigate('/')}>
        <p>SHOPPER</p>
      </div>
      <img className='nav-dropdown' onClick={dropdown_toggle} src={nav_dropdown} alt="" />
      <ul ref={menuRef} className="nav-menu">
        <li onClick={() => { setMenu("shop") }}><Link style={{ textDecoration: 'none' }} to='/'>Shop</Link>{menu === "shop" ? <hr /> : <></>}</li>
        <li onClick={() => { setMenu("men") }}><Link style={{ textDecoration: 'none' }} to='/men'>Men</Link>{menu === "men" ? <hr /> : <></>}</li>
        <li onClick={() => { setMenu("women") }}><Link style={{ textDecoration: 'none' }} to='/women'>Women</Link>{menu === "women" ? <hr /> : <></>}</li>
        {isLoggedIn && (
          <li onClick={() => { setMenu("orders") }}><Link style={{ textDecoration: 'none' }} to='/orders'>Orders</Link>{menu === "orders" ? <hr /> : <></>}</li>
        )}
      </ul>
      <div className="nav-login-cart">
      {isLoggedIn ?
        <button onClick={() => {localStorage.removeItem('auth-token'); window.location.replace('/')}}>Logout</button>
        :
        <Link to='/login'><button>Login</button></Link>
        }
        <Link to='/cart'><img src={cart_icon} alt="" /></Link>
        <div className="nav-cart-count">{getTotalCartItems()}</div>
      </div>
    </div>
  );
}

export default Navbar;
