// pages/cart.js
import React, { useContext } from 'react';
import Layout from '../components/Layout';
import { CartContext } from '../context/CartContext';
import Link from 'next/link';

const CartPage = () => {
  const { cart } = useContext(CartContext);

  const totalPrice = cart.reduce((total, product) => total + product.price, 0);

  return (
    <Layout>
      <h1>Your Cart</h1>
      {cart.length === 0 ? (
        <p>Your shopping cart is empty.</p>
      ) : (
        <>
          <ul>
            {cart.map((product, index) => (
              <li key={index} style={{ marginBottom: '10px' }}>
                {product.name} - ${product.price.toFixed(2)}
              </li>
            ))}
          </ul>
          <p>Total: ${totalPrice.toFixed(2)}</p>
          <Link href="/checkout">
            <button style={{ backgroundColor: '#000', color: '#fff', padding: '10px', border: 'none' }}>
              Proceed to Checkout
            </button>
          </Link>
        </>
      )}
    </Layout>
  );
};

export default CartPage;
