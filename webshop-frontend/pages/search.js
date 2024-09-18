// pages/search.js
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';

const SearchPage = () => {
  const [products, setProducts] = useState([]);
  const router = useRouter();
  const { q } = router.query;

  useEffect(() => {
    if (q) {
      axios.get(`http://localhost:5000/api/products/search?q=${encodeURIComponent(q)}`)
        .then(response => setProducts(response.data))
        .catch(error => console.error('Error fetching search results:', error));
    }
  }, [q]);

  return (
    <Layout>
      <h1>Search Results for "{q}"</h1>
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {products.map(product => (
            <div key={product.id} style={{ border: '1px solid #000', margin: '10px', width: 'calc(33% - 20px)', padding: '10px' }}>
              <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              <h2>{product.name}</h2>
              <p><strong>Price:</strong> ${product.price.toFixed(2)}</p>
              <Link href={`/product/${product.id}`}>
                <button style={{ backgroundColor: '#000', color: '#fff', padding: '10px', border: 'none' }}>View Product</button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default SearchPage;
