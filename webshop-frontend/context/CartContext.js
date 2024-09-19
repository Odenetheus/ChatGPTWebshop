// context/CartContext.js
import React, { createContext, useState } from 'react';
import axios from 'axios';

const envApiUrl = process.env.NEXT_PUBLIC_API_URL;

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Add product to cart
  const addToCart = (product) => {
    setCart([...cart, product]);
    // Log add to cart event
    axios.post(`http://${envApiUrl}/api/events`, {
      event: 'add_to_cart',
      data: { productId: product.id },
    });
  };

  // Clear cart after checkout
  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
