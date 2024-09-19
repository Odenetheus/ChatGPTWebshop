// pages/_app.js
import { CartProvider } from '../context/CartContext';
import '../styles/global.css';
import { useEffect } from 'react';
import axios from 'axios';
const envApiUrl = process.env.NEXT_PUBLIC_API_URL;

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Log page load event
    axios.post(`https://${envApiUrl}/api/events`, { event: 'page_load' });
  }, []);

  return (
    <CartProvider>
      <Component {...pageProps} />
    </CartProvider>
  );
}

export default MyApp;
