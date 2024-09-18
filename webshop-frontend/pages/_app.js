// pages/_app.js
import { CartProvider } from '../context/CartContext';
import '../styles/global.css';
import { useEffect } from 'react';
import axios from 'axios';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Log page load event
    axios.post('http://localhost:5000/api/events', { event: 'page_load' });
  }, []);

  return (
    <CartProvider>
      <Component {...pageProps} />
    </CartProvider>
  );
}

export default MyApp;
