// pages/product/[id].js
import React from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { CartContext } from '../../context/CartContext';

const ProductDetail = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const router = useRouter();

  return (
    <Layout>
      <div style={{ display: 'flex' }}>
        <img src={product.image_url} alt={product.name} style={{ width: '50%', height: 'auto' }} />
        <div style={{ marginLeft: '20px' }}>
          <h1>{product.name}</h1>
          <p><strong>Price:</strong> ${product.price.toFixed(2)}</p>
          <p>{product.description}</p>
          <p><strong>Category:</strong> {product.category}</p>
          <p><strong>Stock:</strong> {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</p>
          <button
            style={{ backgroundColor: '#000', color: '#fff', padding: '10px', border: 'none' }}
            disabled={product.stock === 0}
            onClick={() => {
              addToCart(product);
              router.push('/cart');
            }}
          >
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export async function getServerSideProps({ params }) {
  try {
    const res = await axios.get(`http://localhost:5000/api/products/${params.id}`);
    return {
      props: { product: res.data },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
}

export default ProductDetail;
